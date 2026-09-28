const DAY_MS = 24 * 60 * 60 * 1000

// Local-date YYYY-MM-DD (avoids the UTC shift of toISOString()).
export const toYMD = (date) => {
  if (!date) {
    return ''
  }
  const d = new Date(date)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

const startOfDay = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'mtd', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'custom', label: 'Custom' },
]

export const resolvePreset = (key, custom = {}) => {
  const today = startOfDay(new Date())
  switch (key) {
    case 'today':
      return { from: today, to: today }
    case '7d':
      return { from: new Date(today.getTime() - 6 * DAY_MS), to: today }
    case 'mtd':
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today }
    case 'lastMonth':
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      }
    case '90d':
      return { from: new Date(today.getTime() - 89 * DAY_MS), to: today }
    case 'custom':
      return {
        from: custom.from ? startOfDay(custom.from) : today,
        to: custom.to ? startOfDay(custom.to) : today,
      }
    case '30d':
    default:
      return { from: new Date(today.getTime() - 29 * DAY_MS), to: today }
  }
}

export const daysBetween = (from, to) =>
  Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS) + 1

const HOUR_MS = 60 * 60 * 1000

/** Hour key, e.g. 2026-09-23T14. */
const hourKey = (d) => `${toYMD(d)}T${String(d.getHours()).padStart(2, '0')}`

/**
 * Builds the empty x-axis buckets for the trend chart. A single day is
 * bucketed hourly, ranges up to 62 days daily, longer ones weekly (weeks
 * start Monday).
 */
export const buildBuckets = (from, to) => {
  const span = daysBetween(from, to)
  if (span === 1) {
    const dayStart = startOfDay(from)
    const isToday = toYMD(dayStart) === toYMD(new Date())
    // Today stops at the current hour; a past day shows all 24.
    const lastHour = isToday ? new Date().getHours() : 23
    const buckets = []
    for (let h = 0; h <= lastHour; h++) {
      const date = new Date(dayStart.getTime() + h * HOUR_MS)
      buckets.push({ key: hourKey(date), date, count: 0, value: 0 })
    }
    return { buckets, granularity: 'hour' }
  }
  const granularity = span > 62 ? 'week' : 'day'
  const buckets = []
  let cursor = startOfDay(from)
  if (granularity === 'week') {
    const offset = (cursor.getDay() + 6) % 7
    cursor = new Date(cursor.getTime() - offset * DAY_MS)
  }
  const step = granularity === 'week' ? 7 * DAY_MS : DAY_MS
  const end = startOfDay(to).getTime()
  while (cursor.getTime() <= end) {
    buckets.push({ key: toYMD(cursor), date: new Date(cursor), count: 0, value: 0 })
    cursor = new Date(cursor.getTime() + step)
    // Re-anchor to midnight in case a DST change shifted the clock.
    cursor = startOfDay(new Date(cursor.getTime() + 2 * 60 * 60 * 1000))
  }
  return { buckets, granularity }
}

export const bucketKeyFor = (date, granularity) => {
  if (granularity === 'hour') {
    return hourKey(new Date(date))
  }
  const d = startOfDay(date)
  if (granularity === 'week') {
    const offset = (d.getDay() + 6) % 7
    return toYMD(new Date(d.getTime() - offset * DAY_MS))
  }
  return toYMD(d)
}
