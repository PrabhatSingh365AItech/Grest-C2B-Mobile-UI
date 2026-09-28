import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import {
  describeError,
  fetchSoldWindow,
  getCategories,
  getCompanies,
  getStores,
  MAX_RECORDS,
} from '../services/businessOverviewService'
import { resolvePreset, toYMD } from '../utils/dateRange'
import { applyCommission, loadCommissionRates, saveCommissionRates } from '../utils/commission'
import {
  applyFocus,
  buildTrend,
  commissionByCompany,
  groupBy,
  normalizeRecord,
  summarize,
} from '../utils/aggregate'
import { USER_ROLES } from '../../../constants/roleConstants'
import useDebounce from '../../../hooks/useDebounce'

// Wait for the user to finish ticking boxes before refetching.
const FILTER_DEBOUNCE_MS = 600

const EMPTY_FOCUS = {
  category: null,
  company: null,
  store: null,
  brand: null,
  model: null,
  grade: null,
  staff: null,
  stage: null,
}

export const useBusinessOverview = () => {
  const token = sessionStorage.getItem('authToken')
  const profile = JSON.parse(sessionStorage.getItem('profile') || '{}')
  const canPickCompany =
    profile?.role === USER_ROLES.SUPER_ADMIN ||
    profile?.role === USER_ROLES.SUPER_ADMIN_UNICORN

  // Server-side filters (changing them triggers a refetch)
  const [preset, setPreset] = useState('today')
  const [customRange, setCustomRange] = useState({ from: null, to: null })
  // Multi-selects: an empty array means "all".
  const [companyIds, setCompanyIds] = useState([])
  const [categoryCodes, setCategoryCodes] = useState([])
  // Store filter is applied client-side; its options depend on the companies.
  const [storeIds, setStoreIds] = useState([])

  // Per-company commission rates (agreed defaults, overridable; stored here).
  const [commissionRates, setRates] = useState(loadCommissionRates)
  const setCommissionRates = useCallback((rates) => {
    setRates(rates)
    saveCommissionRates(rates)
  }, [])

  // Client-side cross-filter (click a row to focus)
  const [focus, setFocus] = useState(EMPTY_FOCUS)

  const [categories, setCategories] = useState([])
  const [companies, setCompanies] = useState([])
  const [stores, setStores] = useState([])
  // Sold records for the selected range (all categories); the category and
  // store filters narrow them client-side.
  const [records, setRecords] = useState([])
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [truncated, setTruncated] = useState(false)
  // Chunks that still failed after retries; the rest of the data is shown.
  const [partial, setPartial] = useState(null)
  // Records the server reported but paging never returned (unstable order).
  const [gaps, setGaps] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const requestId = useRef(0)
  const abortRef = useRef(null)

  const range = useMemo(
    () => resolvePreset(preset, customRange),
    [preset, customRange]
  )

  const fetchFromKey = toYMD(range.from)
  const fetchToKey = toYMD(range.to)

  useEffect(() => {
    getCategories(token)
      .then((res) => {
        const list = res.data?.data || []
        setCategories(list)
        if (!list.length) {
          setIsLoading(false)
          setError('No device categories configured.')
        }
      })
      .catch((err) => {
        console.error('Failed to load categories:', err)
        setIsLoading(false)
        setError('Could not load device categories. Please refresh the page.')
      })
    getStores(token)
      .then((res) => setStores(res.data?.result || []))
      .catch((err) => console.error('Failed to load stores:', err))
    if (canPickCompany) {
      getCompanies(token)
        .then((res) => setCompanies(res.data?.result || []))
        .catch((err) => console.error('Failed to load companies:', err))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stable, debounced keys: re-selecting the same set doesn't refetch, and a
  // burst of checkbox clicks becomes one fetch.
  const companyKey = useDebounce(companyIds.join(','), FILTER_DEBOUNCE_MS)

  const storeCompanyId = (s) => s?.companyId?._id || s?.companyId

  // Store dropdown only offers stores of the selected companies.
  const storeOptions = useMemo(
    () =>
      companyIds.length
        ? stores.filter((s) => companyIds.includes(storeCompanyId(s)))
        : stores,
    [stores, companyIds]
  )

  // Drop selected stores that no longer belong to the selected companies.
  useEffect(() => {
    const allowed = new Set(storeOptions.map((s) => s._id))
    setStoreIds((prev) => {
      const next = prev.filter((id) => allowed.has(id))
      return next.length === prev.length ? prev : next
    })
  }, [storeOptions])

  const fetchData = useCallback(async () => {
    // Wait for categories: prospects/findAll is always queried per device type.
    if (!categories.length) {
      return
    }
    // Cancel the previous load: its queued requests are dropped, not sent.
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const current = ++requestId.current
    setIsLoading(true)
    setError('')
    setProgress({ loaded: 0, total: 0 })
    const onProgress = ({ loaded = 0, total = 0 }) => {
      if (current === requestId.current) {
        setProgress((p) => ({ loaded: p.loaded + loaded, total: p.total + total }))
      }
    }

    try {
      const result = await fetchSoldWindow(
        token,
        {
          categories,
          // The API filters by one company at a time, so a multi-company
          // selection becomes one request stream per company.
          companyIds: companyKey ? companyKey.split(',') : [],
          startDate: fetchFromKey,
          endDate: fetchToKey,
        },
        { normalize: normalizeRecord, signal: controller.signal, onProgress }
      )
      if (current !== requestId.current) {
        return
      }
      setPartial(result.failed ? { count: result.failed, reason: result.reason } : null)
      setGaps(result.gaps)
      if (result.duplicates) {
        console.info(`Business overview: removed ${result.duplicates} duplicate record(s) returned by paging.`)
      }
      setRecords(result.records.slice(0, MAX_RECORDS))
      setTruncated(result.truncated || result.records.length > MAX_RECORDS)
      setLastUpdated(new Date())
      setFocus(EMPTY_FOCUS)
    } catch (err) {
      if (current !== requestId.current || axios.isCancel(err)) {
        return
      }
      console.error('Business overview fetch failed:', err)
      setError(`Could not load purchase data (${describeError(err)}). Try Refresh.`)
      setRecords([])
      setPartial(null)
    } finally {
      if (current === requestId.current) {
        setIsLoading(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFromKey, fetchToKey, companyKey, categories])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleFocus = useCallback((dimension, row) => {
    setFocus((prev) => ({
      ...prev,
      [dimension]:
        prev[dimension]?.id === row.id ? null : { id: row.id, label: row.label },
    }))
  }, [])

  const clearFocus = useCallback((dimension) => {
    setFocus((prev) =>
      dimension ? { ...prev, [dimension]: null } : EMPTY_FOCUS
    )
  }, [])

  const storeKey = storeIds.join(',')

  // Applies the page's category/store selections (not dates or focus) to any
  // records - used by cards that load their own date window.
  const scopeRecords = useCallback(
    (list) => {
      const storeSet = new Set(storeIds)
      const catSet = new Set(categoryCodes)
      return list
        .filter(
          (r) =>
            (!catSet.size || catSet.has(r.categoryCode)) &&
            (!storeSet.size || storeSet.has(r.storeId))
        )
        .map((r) => applyCommission(r, commissionRates))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeKey, categoryCodes, commissionRates]
  )

  const view = useMemo(() => {
    const storeSet = new Set(storeIds)
    const catSet = new Set(categoryCodes)
    const from = range.from.getTime()
    const to = new Date(range.to).setHours(23, 59, 59, 999)
    const filtered = records
      .filter((r) => {
        const t = r.date.getTime()
        return (
          t >= from &&
          t <= to &&
          (!catSet.size || catSet.has(r.categoryCode)) &&
          (!storeSet.size || storeSet.has(r.storeId))
        )
      })
      .map((r) => applyCommission(r, commissionRates))
    const scoped = applyFocus(filtered, focus)
    const scopedStores = storeOptions.filter((s) => {
      if (storeSet.size && !storeSet.has(s._id)) {
        return false
      }
      if (focus.company && storeCompanyId(s) !== focus.company.id) {
        return false
      }
      return true
    })
    return {
      kpis: summarize(scoped),
      trend: buildTrend(scoped, range.from, range.to),
      byCategory: groupBy(scoped, 'category'),
      byCompany: groupBy(scoped, 'company'),
      byStore: groupBy(scoped, 'store'),
      byBrand: groupBy(scoped, 'brand'),
      byModel: groupBy(scoped, 'model'),
      byGrade: groupBy(scoped, 'grade'),
      byStaff: groupBy(scoped, 'staff'),
      byStage: groupBy(scoped, 'stage'),
      commissionByCompany: commissionByCompany(scoped),
      totalStores: scopedStores.length,
      records: scoped,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, focus, storeOptions, storeKey, range, categoryCodes, commissionRates])

  // Cancel any in-flight load when leaving the page.
  useEffect(() => () => abortRef.current?.abort(), [])

  return {
    canPickCompany,
    preset,
    setPreset,
    customRange,
    setCustomRange,
    range,
    companyIds,
    companyKey,
    setCompanyIds,
    categoryCodes,
    setCategoryCodes,
    storeIds,
    setStoreIds,
    storeOptions,
    categories,
    companies,
    focus,
    toggleFocus,
    clearFocus,
    isLoading,
    error,
    truncated,
    partial,
    gaps,
    commissionRates,
    setCommissionRates,
    scopeRecords,
    // Companies present in the loaded data, for roles without a company list.
    companiesInData: useMemo(() => {
      const seen = new Map()
      records.forEach((r) => {
        if (r.companyId !== 'Unknown' && !seen.has(r.companyId)) {
          seen.set(r.companyId, { _id: r.companyId, name: r.companyName })
        }
      })
      return [...seen.values()]
    }, [records]),
    progress,
    lastUpdated,
    fetchData,
    view,
    hasData: records.length > 0,
  }
}
