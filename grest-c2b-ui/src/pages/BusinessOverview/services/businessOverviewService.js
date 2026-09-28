import axios from 'axios'
import { handleLogout } from '../../../utils/axiosInterceptor'

const API_BASE = import.meta.env.VITE_REACT_APP_ENDPOINT

// The dashboard's paged loads use their own axios instance: the app's global
// interceptor shows "Network error" for any request without a response, which
// includes requests this page cancels on purpose (Refresh, filter changes) and
// ones it retries. Failures are reported in the page's own banners instead.
// An expired session still logs the user out, exactly as the interceptor does.
const api = axios.create()
api.interceptors.response.use(undefined, (err) => {
  if (err?.response?.status === 401) {
    handleLogout(err.response.data?.message || 'Session expired. Please login again.')
  }
  return Promise.reject(err)
})

// prospects/findAll does heavy work per returned record (full population and
// PII handling): 40 rows take ~15s and 100 rows exceed the gateway's 29s limit
// (504/502). 10 rows per request is what the app's own Store Report uses on
// production, so that is the page size; parallel requests make up the speed.
const SOLD_PAGE_SIZE = 10
// Separate lanes so background work (the tracker's month) never queues in
// front of what the user is looking at.
const SOLD_FOREGROUND_IN_FLIGHT = 4
const SOLD_BACKGROUND_IN_FLIGHT = 2
// Everything else (small, fast endpoints).
const MAX_IN_FLIGHT = 6
const RETRIES = 3
const RETRY_BASE_MS = 800
// Safety cap so an accidental "all time" range can't freeze the browser.
export const MAX_RECORDS = 25000

const authHeaders = (token) => ({ headers: { Authorization: `${token}` } })

// --- request limiting & retries ---------------------------------------------

const createLimiter = (max) => {
  let inFlight = 0
  const waiting = []
  return (task) =>
    new Promise((resolve, reject) => {
      const run = () => {
        inFlight++
        task()
          .then(resolve, reject)
          .finally(() => {
            inFlight--
            if (waiting.length) {
              waiting.shift()()
            }
          })
      }
      if (inFlight < max) {
        run()
      } else {
        waiting.push(run)
      }
    })
}

const limit = createLimiter(MAX_IN_FLIGHT)
const limitSoldForeground = createLimiter(SOLD_FOREGROUND_IN_FLIGHT)
const limitSoldBackground = createLimiter(SOLD_BACKGROUND_IN_FLIGHT)

// Network errors, timeouts, throttling and server errors are worth retrying;
// auth/validation errors and cancelled requests are not.
const isRetryable = (err) => {
  if (axios.isCancel(err)) {
    return false
  }
  const status = err?.response?.status
  return !status || status === 408 || status === 413 || status === 429 || status >= 500
}

/** Human-readable reason for a failed request, for on-screen banners. */
export const describeError = (err) => {
  if (!err) {
    return 'unknown error'
  }
  const status = err.response?.status
  if (status) {
    const msg = err.response?.data?.message || err.response?.data?.error
    return `HTTP ${status}${msg ? `: ${msg}` : ''}`
  }
  if (err.code === 'ECONNABORTED') {
    return 'request timed out'
  }
  return 'no response from server (network, CORS or gateway timeout)'
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const withRetry = async (request, { lane = limit, signal, retries = RETRIES } = {}) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await lane(() => {
        // A request cancelled while queued never goes out.
        if (signal?.aborted) {
          return Promise.reject(new axios.Cancel('aborted'))
        }
        return request()
      })
    } catch (err) {
      if (attempt >= retries || !isRetryable(err) || signal?.aborted) {
        throw err
      }
      await sleep(RETRY_BASE_MS * 2 ** attempt)
    }
  }
}

// --- metadata ---------------------------------------------------------------

export const getCategories = (token) =>
  axios.get(`${API_BASE}/api/category/getAll`, authHeaders(token))

export const getCompanies = (token) =>
  axios.get(`${API_BASE}/api/company/findAll`, authHeaders(token))

export const getStores = (token) =>
  axios.get(`${API_BASE}/api/store/findAll?page=0&limit=9999`, authHeaders(token))

export const getRegisteredUsers = (token) =>
  withRetry(() => api.get(`${API_BASE}/api/userregistry/all`, authHeaders(token)))

// --- quote tracking ---------------------------------------------------------

/**
 * Per-user quote-attempt totals for one of the API's fixed windows
 * ('Today' | 'Yesterday' | 'Last 7 Days' | '1 Month' | 'All Time').
 * Pages through everything; the API's page numbers are 1-based.
 */
export const fetchQuoteTracking = async (token, dateRange) => {
  const get = (page) =>
    withRetry(() =>
      api.get(`${API_BASE}/api/quoteTracking/dashboard`, {
        ...authHeaders(token),
        params: { page, limit: 500, dateRange, search: '' },
      })
    )
  const first = await get(1)
  const rows = [...(first.data?.data || [])]
  const totalPages = first.data?.pagination?.totalPages || 1
  const rest = []
  for (let page = 2; page <= totalPages; page++) {
    rest.push(get(page))
  }
  const pages = await Promise.all(rest)
  pages.forEach((res) => rows.push(...(res.data?.data || [])))
  // Paging can repeat a row across page boundaries. Only drop exact repeats
  // (same user, store, count and last activity) so genuine rows are never lost.
  const seen = new Set()
  return rows.filter((r) => {
    const key = [r?.userId, r?.email, r?.storeName, r?.totalQuotes, r?.lastActivityDate].join('|')
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

// --- sold prospects ---------------------------------------------------------

const fetchSoldPage = (token, query, { page, pageSize, lane, signal, retries }) => {
  const params = new URLSearchParams({
    page,
    limit: pageSize,
    is_selled: 'true',
    deviceType: query.deviceType,
    startDate: query.startDate,
    endDate: query.endDate,
  })
  if (query.companyId) {
    params.append('companyId', query.companyId)
  }
  return withRetry(
    () =>
      api.get(`${API_BASE}/api/prospects/findAll?${params.toString()}`, {
        ...authHeaders(token),
        signal,
      }),
    { lane, signal, retries }
  )
}

// --- date helpers (YYYY-MM-DD, local time) -----------------------------------

const parseYMD = (v) => {
  const [y, m, d] = String(v).split('-').map(Number)
  return new Date(y, m - 1, d)
}
const toYMDLocal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
const spanDays = (q) =>
  Math.round((parseYMD(q.endDate) - parseYMD(q.startDate)) / (24 * 60 * 60 * 1000)) + 1

/** Splits an inclusive date range into two halves. */
const splitRange = (q) => {
  const start = parseYMD(q.startDate)
  const firstHalfDays = Math.floor(spanDays(q) / 2)
  const firstEnd = addDays(start, firstHalfDays - 1)
  return [
    { ...q, endDate: toYMDLocal(firstEnd) },
    { ...q, startDate: toYMDLocal(addDays(firstEnd, 1)) },
  ]
}

const EMPTY_RESULT = {
  records: [],
  total: 0,
  truncated: false,
  failedPages: 0,
  failedRows: 0,
  failureReason: null,
}

const mergeResults = (results) =>
  results.reduce(
    (acc, r) => ({
      records: acc.records.concat(r.records),
      total: acc.total + r.total,
      truncated: acc.truncated || r.truncated,
      failedPages: acc.failedPages + r.failedPages,
      failedRows: acc.failedRows + r.failedRows,
      failureReason: acc.failureReason || r.failureReason,
    }),
    EMPTY_RESULT
  )

/**
 * Fetches records [offset, offset + count) one at a time. Used when a page of
 * 10 keeps failing: if a single record breaks the server's response, only that
 * record is lost instead of the whole page.
 */
const fetchSingles = async (token, query, offset, count, { lane, signal, onProgress }) => {
  const settled = await Promise.allSettled(
    Array.from({ length: count }, (_, i) =>
      fetchSoldPage(token, query, { page: offset + i, pageSize: 1, lane, signal, retries: 1 })
    )
  )
  if (signal?.aborted) {
    throw new axios.Cancel('aborted')
  }
  const records = []
  let failedRows = 0
  let failureReason = null
  settled.forEach((r) => {
    if (r.status === 'fulfilled') {
      records.push(...(r.value.data?.data || []))
    } else {
      failedRows++
      failureReason = failureReason || describeError(r.reason)
    }
  })
  onProgress?.({ loaded: records.length })
  return { records, failedRows, failureReason }
}

/**
 * Pulls every sold prospect of one category in the date range, 10 at a time,
 * degrading gracefully when the server fails:
 *  - the first page fails  -> split the date range in half and retry each half
 *    (down to single days), so a heavy query becomes lighter ones and a bad
 *    record is confined to one day;
 *  - a single day still fails -> fetch its records one at a time;
 *  - a later page fails    -> fetch that page's 10 records one at a time.
 * Only what still fails is skipped, and it is counted.
 *
 * options:
 *  - background: use the low-priority lane
 *  - signal:     AbortSignal; aborting drops queued requests
 *  - onProgress: ({ loaded, total }) deltas, for "x of y records" displays
 *
 * Returns { records, total, truncated, failedPages, failedRows, failureReason }.
 */
export const fetchSoldForCategory = async (
  token,
  query,
  { budget = MAX_RECORDS, background = false, signal, onProgress } = {}
) => {
  const lane = background ? limitSoldBackground : limitSoldForeground
  const options = { budget, background, signal, onProgress }

  let first
  try {
    first = await fetchSoldPage(token, query, {
      page: 0,
      pageSize: SOLD_PAGE_SIZE,
      lane,
      signal,
      // Splittable ranges retry once, then split; single days retry fully.
      retries: spanDays(query) > 1 ? 1 : RETRIES,
    })
  } catch (err) {
    if (signal?.aborted || !isRetryable(err)) {
      throw err
    }
    // Heavy range or a bad record: narrow the date range and try again.
    if (spanDays(query) > 1) {
      const halves = await Promise.allSettled(
        splitRange(query).map((q) => fetchSoldForCategory(token, q, options))
      )
      if (signal?.aborted) {
        throw new axios.Cancel('aborted')
      }
      const ok = halves.filter((h) => h.status === 'fulfilled').map((h) => h.value)
      if (!ok.length) {
        throw halves[0].reason
      }
      const merged = mergeResults(ok)
      const lost = halves.find((h) => h.status === 'rejected')
      return lost
        ? {
            ...merged,
            failedPages: merged.failedPages + 1,
            failureReason: merged.failureReason || describeError(lost.reason),
          }
        : merged
    }
    // A single day that still fails: go record by record.
    const probe = await fetchSoldPage(token, query, { page: 0, pageSize: 1, lane, signal })
    const dayTotal = Math.min(probe.data?.totalCounts ?? 0, budget)
    onProgress?.({ total: dayTotal })
    const singles = await fetchSingles(token, query, 0, dayTotal, { lane, signal, onProgress })
    return {
      records: singles.records,
      total: dayTotal,
      truncated: (probe.data?.totalCounts ?? 0) > budget,
      failedPages: singles.failedRows ? 1 : 0,
      failedRows: singles.failedRows,
      failureReason: singles.failureReason,
    }
  }

  const total = first.data?.totalCounts ?? first.data?.data?.length ?? 0
  const records = [...(first.data?.data || [])]
  onProgress?.({ total: Math.min(total, budget), loaded: records.length })

  // If the backend returned fewer rows than asked for while more exist, it caps
  // the page size; page through at the size it actually serves so no rows are
  // skipped. (Page 0 starts at row 0 either way.)
  const pageSize =
    records.length > 0 && records.length < SOLD_PAGE_SIZE && records.length < total
      ? records.length
      : SOLD_PAGE_SIZE

  const wanted = Math.min(total, budget)
  const pageCount = Math.max(Math.ceil(wanted / pageSize), 1)
  const rest = []
  for (let page = 1; page < pageCount; page++) {
    rest.push(
      fetchSoldPage(token, query, { page, pageSize, lane, signal })
        .then((res) => {
          onProgress?.({ loaded: res.data?.data?.length || 0 })
          return { records: res.data?.data || [], failedRows: 0, failureReason: null }
        })
        .catch((err) => {
          if (signal?.aborted || !isRetryable(err)) {
            throw err
          }
          // This page keeps failing: fetch its records one at a time.
          const count = Math.min(pageSize, wanted - page * pageSize)
          return fetchSingles(token, query, page * pageSize, count, { lane, signal, onProgress })
        })
    )
  }
  const settled = await Promise.allSettled(rest)
  if (signal?.aborted) {
    throw new axios.Cancel('aborted')
  }
  let failedPages = 0
  let failedRows = 0
  let failureReason = null
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      records.push(...r.value.records)
      if (r.value.failedRows) {
        failedPages++
        failedRows += r.value.failedRows
        failureReason = failureReason || r.value.failureReason
      }
    } else {
      // Non-retryable failure for the whole page.
      failedPages++
      failedRows += Math.min(pageSize, wanted - (i + 1) * pageSize)
      failureReason = failureReason || describeError(r.reason)
    }
  })

  return {
    records: records.slice(0, budget),
    total,
    truncated: total > budget,
    failedPages,
    failedRows,
    failureReason,
  }
}

/**
 * Sold records for every category x company stream in a date window.
 *
 * The backend's paging order isn't stable, so small parallel pages can return
 * the same record twice (and skip another). Records are therefore de-duplicated
 * by id, and `gaps` reports how many records the server said exist but never
 * came back, so the UI can say the numbers are understated.
 *
 * Returns { records (normalized, unique), failed, reason, truncated,
 * duplicates, gaps }; throws only if every stream failed (or was cancelled).
 */
export const fetchSoldWindow = async (
  token,
  { categories, companyIds, startDate, endDate },
  { normalize, ...options } = {}
) => {
  const companies = companyIds.length ? companyIds : ['']
  const settled = await Promise.allSettled(
    categories.flatMap((cat) =>
      companies.map((companyId) =>
        fetchSoldForCategory(
          token,
          { startDate, endDate, companyId, deviceType: cat.categoryCode },
          options
        ).then((res) => ({ ...res, cat }))
      )
    )
  )
  if (options.signal?.aborted) {
    throw new axios.Cancel('aborted')
  }
  const ok = settled.filter((r) => r.status === 'fulfilled').map((r) => r.value)
  if (!ok.length) {
    throw settled[0]?.reason || new Error('All requests failed')
  }
  const rejected = settled.find((r) => r.status === 'rejected')

  const seen = new Set()
  let duplicates = 0
  const records = []
  ok.forEach((r) =>
    r.records.forEach((row) => {
      const id = row?._id || row?.uniqueCode
      if (id) {
        if (seen.has(id)) {
          duplicates++
          return
        }
        seen.add(id)
      }
      records.push(normalize(row, r.cat))
    })
  )
  // Rows the server reported but we never received, excluding pages that
  // failed outright (those are already counted in `failed`).
  const reported = ok.reduce((n, r) => n + Math.min(r.total, MAX_RECORDS), 0)
  const failedRows = ok.reduce((n, r) => n + r.failedRows, 0)
  const gaps = Math.max(reported - failedRows - records.length, 0)

  return {
    records,
    duplicates,
    gaps,
    failed: settled.length - ok.length + ok.reduce((n, r) => n + r.failedPages, 0),
    reason:
      (rejected && describeError(rejected.reason)) ||
      ok.find((r) => r.failureReason)?.failureReason ||
      null,
    truncated: ok.some((r) => r.truncated),
  }
}
