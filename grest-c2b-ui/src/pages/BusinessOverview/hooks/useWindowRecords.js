import { useEffect, useState } from 'react'
import axios from 'axios'
import { describeError, fetchSoldWindow } from '../services/businessOverviewService'
import { normalizeRecord } from '../utils/aggregate'
import { toYMD } from '../utils/dateRange'

const IDLE = { records: [], loading: false, error: '', progress: { loaded: 0, total: 0 } }

/**
 * Loads sold records for a date window on demand, for cards whose own date
 * range reaches outside what the page has loaded. Runs on the foreground lane:
 * the user is waiting for this card, and the background lane can be hundreds
 * of requests deep with the tracker's month load. Cancels when the window
 * changes.
 */
export const useWindowRecords = ({ categories, companyKey, from, to, enabled }) => {
  const [state, setState] = useState(IDLE)
  const fromKey = enabled ? toYMD(from) : ''
  const toKey = enabled ? toYMD(to) : ''

  useEffect(() => {
    if (!enabled || !categories.length || !fromKey || !toKey) {
      setState(IDLE)
      return undefined
    }
    const controller = new AbortController()
    const token = sessionStorage.getItem('authToken')
    setState({ ...IDLE, loading: true })

    fetchSoldWindow(
      token,
      {
        categories,
        companyIds: companyKey ? companyKey.split(',') : [],
        startDate: fromKey,
        endDate: toKey,
      },
      {
        normalize: normalizeRecord,
        background: false,
        signal: controller.signal,
        onProgress: ({ loaded = 0, total = 0 }) =>
          !controller.signal.aborted &&
          setState((s) => ({
            ...s,
            progress: { loaded: s.progress.loaded + loaded, total: s.progress.total + total },
          })),
      }
    )
      .then((res) => {
        if (!controller.signal.aborted) {
          setState((s) => ({
            ...s,
            records: res.records,
            loading: false,
            error: res.failed
              ? `${res.failed} chunk(s) failed${res.reason ? ` (${res.reason})` : ''}; figures may be understated.`
              : '',
          }))
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setState((s) => ({
            ...s,
            loading: false,
            error: `Could not load this range (${describeError(err)}).`,
          }))
        }
      })

    return () => controller.abort()
  }, [enabled, categories, companyKey, fromKey, toKey])

  return state
}
