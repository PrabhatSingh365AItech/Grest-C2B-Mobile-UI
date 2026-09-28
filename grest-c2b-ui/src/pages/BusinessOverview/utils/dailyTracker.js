import { convertedBy, FOS_ROLES } from './trackerAdapters'

const DAY_MS = 24 * 60 * 60 * 1000

const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

// Short-window choices. The Quote Tracking API only accepts fixed windows
// relative to now, so these are the only ones whose quote counts are exact;
// `apiRanges` are summed to build the window's "Quote Given".
export const RECENT_WINDOWS = {
  today: { label: 'Today', apiRanges: ['Today'], fromDays: 0 },
  yesterday: { label: 'Yesterday', apiRanges: ['Yesterday'], fromDays: 1, endsToday: true },
  '48h': { label: 'Last 48 hours', apiRanges: ['Today', 'Yesterday'], fromDays: 1 },
  '7d': { label: 'Last 7 days', apiRanges: ['Last 7 Days'], fromDays: 6 },
}
export const DEFAULT_RECENT_WINDOW = '48h'

/**
 * Month window (the API's "1 Month"): same date last month -> now.
 */
export const trackerWindows = (now = new Date(), recentKey = DEFAULT_RECENT_WINDOW) => {
  const today = startOfDay(now)
  const monthFrom = new Date(today)
  monthFrom.setMonth(monthFrom.getMonth() - 1)
  return {
    now,
    monthFrom,
    // Matches a rolling one-month window (e.g. 18 Aug -> 18 Sep = 31 days).
    monthDays: Math.round((today - monthFrom) / DAY_MS),
    ...recentWindow(now, recentKey),
  }
}

/** Short window [recentFrom, recentTo) for one of RECENT_WINDOWS. */
export const recentWindow = (now, key) => {
  const def = RECENT_WINDOWS[key] || RECENT_WINDOWS[DEFAULT_RECENT_WINDOW]
  const today = startOfDay(now)
  return {
    recentKey: key,
    recentLabel: def.label,
    recentFrom: new Date(today.getTime() - def.fromDays * DAY_MS),
    // "Yesterday" stops at today's midnight; the others run up to now.
    recentTo: def.endsToday ? today : new Date(8640000000000000),
  }
}

const ratio = (a, b) => (b ? a / b : null)

/**
 * Builds one row per quoting user (registered FOS first-class, anyone else who
 * quoted or converted included so totals reconcile).
 *
 * @param users      adapted registered users (all roles)
 * @param quotes     { recent: [lists summed for the short window], month }
 * @param sold       normalized sold records covering the month window
 * @param windows    from trackerWindows()
 * @param inScope    (storeId, storeName) => boolean, applies page filters
 */
export const buildTrackerRows = ({ users, quotes, sold, windows, inScope }) => {
  const rows = new Map()

  const ensure = (email, init) => {
    if (!rows.has(email)) {
      rows.set(email, {
        email,
        name: init.name || email,
        storeName: init.storeName || '—',
        storeIds: init.storeIds || [],
        isFos: Boolean(init.isFos),
        recentQuoted: 0,
        recentConverted: 0,
        monthQuoted: 0,
        monthConverted: 0,
      })
    }
    return rows.get(email)
  }

  // 1. Every registered FOS gets a row, even with zero activity.
  users
    .filter((u) => u.email && FOS_ROLES.includes(u.role))
    .forEach((u) => {
      const stores = u.stores.filter((s) => inScope(s.id, s.name))
      if (u.stores.length && !stores.length) {
        return // FOS belongs to stores outside the current filter
      }
      if (!u.stores.length && !inScope('', '')) {
        return
      }
      ensure(u.email, {
        name: u.name,
        storeName: stores.map((s) => s.name).filter(Boolean).join(', '),
        storeIds: stores.map((s) => s.id),
        isFos: true,
      })
    })

  const registered = new Map(users.map((u) => [u.email, u]))
  const accept = (email, storeId, storeName, name) => {
    if (!email) {
      return null
    }
    if (rows.has(email)) {
      return rows.get(email)
    }
    if (!inScope(storeId, storeName)) {
      return null
    }
    const reg = registered.get(email)
    return ensure(email, { name: reg?.name || name, storeName, isFos: false })
  }

  // 2. Quote attempts.
  const addQuotes = (list, field) =>
    list.forEach((q) => {
      const row = accept(q.email, '', q.storeName, q.name)
      if (row) {
        row[field] += q.quotes
      }
    })
  quotes.recent.forEach((list) => addQuotes(list, 'recentQuoted'))
  addQuotes(quotes.month, 'monthQuoted')

  // 3. Conversions (sold prospects), counted by sale date.
  sold.forEach((r) => {
    if (Number.isNaN(r.date.getTime()) || r.date < windows.monthFrom) {
      return
    }
    const row = accept(convertedBy(r), r.storeId, r.storeName, r.staff)
    if (!row) {
      return
    }
    row.monthConverted++
    if (r.date >= windows.recentFrom && r.date < windows.recentTo) {
      row.recentConverted++
    }
  })

  const list = [...rows.values()].map((r) => {
    const availDays = r.isFos ? windows.monthDays : 0
    return {
      ...r,
      recentConv: ratio(r.recentConverted, r.recentQuoted),
      fosAvailable: r.isFos ? 1 : 0,
      monthConv: ratio(r.monthConverted, r.monthQuoted),
      availDays,
      avgConv: ratio(r.monthConverted, availDays),
    }
  })

  // Store order like the sheet; FOS without an assigned store go last.
  const noStore = (r) => (r.storeName === '—' ? 1 : 0)
  list.sort(
    (a, b) =>
      noStore(a) - noStore(b) ||
      a.storeName.localeCompare(b.storeName) ||
      a.name.localeCompare(b.name)
  )
  return list
}

export const trackerTotals = (rows) => {
  const t = rows.reduce(
    (s, r) => ({
      recentQuoted: s.recentQuoted + r.recentQuoted,
      recentConverted: s.recentConverted + r.recentConverted,
      fosAvailable: s.fosAvailable + r.fosAvailable,
      monthQuoted: s.monthQuoted + r.monthQuoted,
      monthConverted: s.monthConverted + r.monthConverted,
      availDays: s.availDays + r.availDays,
    }),
    {
      recentQuoted: 0,
      recentConverted: 0,
      fosAvailable: 0,
      monthQuoted: 0,
      monthConverted: 0,
      availDays: 0,
    }
  )
  return {
    ...t,
    recentConv: ratio(t.recentConverted, t.recentQuoted),
    monthConv: ratio(t.monthConverted, t.monthQuoted),
    avgConv: ratio(t.monthConverted, t.availDays),
  }
}
