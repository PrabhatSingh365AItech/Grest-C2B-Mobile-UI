import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  describeError,
  fetchQuoteTracking,
  fetchSoldWindow,
  getRegisteredUsers,
} from '../services/businessOverviewService'
import { normalizeRecord } from '../utils/aggregate'
import { toYMD } from '../utils/dateRange'
import { adaptQuoteRow, adaptRegisteredUser } from '../utils/trackerAdapters'
import {
  buildTrackerRows,
  DEFAULT_RECENT_WINDOW,
  RECENT_WINDOWS,
  recentWindow,
  trackerTotals,
  trackerWindows,
} from '../utils/dailyTracker'

const IDLE = {
  records: [],
  ready: false,
  failed: false,
  error: '',
  progress: { loaded: 0, total: 0 },
}

// Every window the tracker can show, fetched once so switching is instant.
const QUOTE_RANGES = ['Today', 'Yesterday', 'Last 7 Days', '1 Month']

/**
 * Store x FOS tracker: quote attempts (Quote Tracking API) against conversions
 * (sold prospects) for a selectable short window and the last month.
 *
 * Loads in order of cost so something useful shows quickly:
 *  1. registered FOS + quote totals (small, fast)
 *  2. conversions for the short window (a few days of sold records)
 *  3. conversions for the month - in the background lane, so it never delays
 *     the dashboard; once loaded it also serves any short window
 */
export const useDailyTracker = ({
  categories,
  companyKey,
  storeOptions,
  storeIds,
  companies,
}) => {
  const token = sessionStorage.getItem('authToken')
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [recent, setRecent] = useState(IDLE)
  const [month, setMonth] = useState(IDLE)
  const [refreshTick, setRefreshTick] = useState(0)
  const [recentKey, setRecentKey] = useState(DEFAULT_RECENT_WINDOW)

  // Re-anchored to "now" on every refresh.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const base = useMemo(() => trackerWindows(new Date()), [refreshTick])
  const windows = useMemo(
    () => ({ ...base, ...recentWindow(base.now, recentKey) }),
    [base, recentKey]
  )

  // 1. FOS + quotes
  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      setIsLoading(true)
      setError('')
      const [usersRes, ...quoteRes] = await Promise.allSettled([
        getRegisteredUsers(token),
        ...QUOTE_RANGES.map((r) => fetchQuoteTracking(token, r)),
      ])
      if (controller.signal.aborted) {
        return
      }
      const quoteFailure = quoteRes.find((r) => r.status === 'rejected')
      const problems = [
        usersRes.status === 'rejected' && `registered users (${describeError(usersRes.reason)})`,
        quoteFailure && `quote tracking (${describeError(quoteFailure.reason)})`,
      ].filter(Boolean)
      if (problems.length) {
        console.error('Daily tracker load failed:', { usersRes, quoteRes })
        setError(`Could not load ${problems.join(', ')}. Try Refresh.`)
      }
      const quotes = {}
      QUOTE_RANGES.forEach((range, i) => {
        const r = quoteRes[i]
        quotes[range] = (r.status === 'fulfilled' ? r.value : []).map(adaptQuoteRow)
      })
      setData({
        users: (usersRes.status === 'fulfilled' ? usersRes.value?.data?.data || [] : []).map(
          adaptRegisteredUser
        ),
        quotes,
      })
      setIsLoading(false)
    }
    run()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick])

  const loadPhase = useCallback(
    async ({ from, to, setPhase, background, signal }) => {
      setPhase({ ...IDLE })
      const onProgress = ({ loaded = 0, total = 0 }) =>
        !signal.aborted &&
        setPhase((p) => ({
          ...p,
          progress: { loaded: p.progress.loaded + loaded, total: p.progress.total + total },
        }))
      try {
        const res = await fetchSoldWindow(
          token,
          {
            categories,
            companyIds: companyKey ? companyKey.split(',') : [],
            startDate: toYMD(from),
            endDate: toYMD(to),
          },
          { normalize: normalizeRecord, background, signal, onProgress }
        )
        if (!signal.aborted) {
          const problems = [
            res.failed &&
              `${res.failed} chunk(s) failed after retries${res.reason ? ` (${res.reason})` : ''}`,
            res.gaps && `${res.gaps} record(s) were skipped by the server while paging`,
          ].filter(Boolean)
          setPhase((p) => ({
            ...p,
            records: res.records,
            ready: true,
            error: problems.length
              ? `${problems.join('; ')}, so Converted may be understated.`
              : '',
          }))
        }
      } catch (err) {
        if (!signal.aborted && !axios.isCancel(err)) {
          setPhase((p) => ({
            ...p,
            ready: true,
            failed: true,
            error: `Could not load conversions (${describeError(err)}). Try Refresh.`,
          }))
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, companyKey]
  )

  const monthOk = month.ready && !month.failed

  // 3. month conversions, background lane
  useEffect(() => {
    if (!categories.length) {
      return undefined
    }
    const controller = new AbortController()
    loadPhase({
      from: base.monthFrom,
      to: base.now,
      setPhase: setMonth,
      background: true,
      signal: controller.signal,
    })
    return () => controller.abort()
  }, [loadPhase, base, categories.length])

  // 2. short-window conversions - only needed until the month has loaded
  useEffect(() => {
    if (!categories.length || monthOk) {
      return undefined
    }
    const controller = new AbortController()
    const endsToday = RECENT_WINDOWS[recentKey]?.endsToday
    loadPhase({
      from: windows.recentFrom,
      // "Yesterday" ends at yesterday; the others run to today.
      to: endsToday ? new Date(windows.recentTo.getTime() - 1) : base.now,
      setPhase: setRecent,
      background: false,
      signal: controller.signal,
    })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPhase, base, recentKey, categories.length])

  const refresh = useCallback(() => setRefreshTick((t) => t + 1), [])

  const storeKey = storeIds.join(',')
  const companyListKey = companies.map((c) => c._id).join(',')

  // Rows are limited to stores under companies in the company dropdown:
  // the selected stores, else the selected companies' stores, else every
  // store whose company is listed. FOS without a store, or with a store under
  // an unlisted company, are left out. Applied without refetching.
  const inScope = useMemo(() => {
    const listed = new Set(companies.map((c) => c._id))
    const storeCompany = (s) => s?.companyId?._id || s?.companyId
    let restrictTo
    if (storeIds.length) {
      restrictTo = storeOptions.filter((s) => storeIds.includes(s._id))
    } else if (companyKey || !listed.size) {
      // Selected companies' stores; or, for roles without a company list
      // (Company Admin), the stores the API returned for them.
      restrictTo = storeOptions
    } else {
      restrictTo = storeOptions.filter((s) => listed.has(storeCompany(s)))
    }
    // If the store list failed to load, don't blank the tracker.
    if (!storeOptions.length) {
      return () => true
    }
    const ids = new Set(restrictTo.map((s) => s._id))
    const names = new Set(restrictTo.map((s) => String(s.storeName).toLowerCase()))
    return (id, name) =>
      (id && ids.has(id)) || (name && names.has(String(name).toLowerCase()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeOptions, storeKey, companyKey, companyListKey])

  // Month records cover every short window, so once loaded they serve both
  // column groups; until then (or if the month load failed) use the short
  // window's own records and keep the month columns pending.
  const recentOk = monthOk || (recent.ready && !recent.failed)
  const sold = monthOk ? month.records : recent.records

  const rows = useMemo(() => {
    if (!data) {
      return []
    }
    const quotes = {
      recent: (RECENT_WINDOWS[recentKey]?.apiRanges || []).map((r) => data.quotes[r] || []),
      month: data.quotes['1 Month'] || [],
    }
    return buildTrackerRows({ users: data.users, quotes, sold, windows, inScope })
  }, [data, sold, windows, inScope, recentKey])

  return {
    rows,
    totals: useMemo(() => trackerTotals(rows), [rows]),
    windows,
    recentKey,
    setRecentKey,
    isLoading,
    error,
    recentReady: recentOk,
    monthReady: monthOk,
    recentProgress: recent.progress,
    monthProgress: month.progress,
    conversionsError: month.error || recent.error,
    refresh,
  }
}
