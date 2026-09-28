import React, { useMemo, useState } from 'react'
import Panel from './Panel'
import LeaderTable from './LeaderTable'
import { groupBy } from '../utils/aggregate'
import { breakdownRows, downloadSheet } from '../utils/exportExcel'
import { formatCount } from '../utils/format'
import { toYMD } from '../utils/dateRange'
import { useWindowRecords } from '../hooks/useWindowRecords'

const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const endOfDay = (d) => {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

const PRESETS = [
  { key: 'all', label: 'Page range' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'month', label: 'This month' },
  { key: 'custom', label: 'Custom' },
]

/** Card date window; `all` means whatever the page has loaded. */
const resolveWindow = (key, custom, pageRange) => {
  const today = startOfDay(new Date())
  switch (key) {
    case 'today':
      return { from: today, to: endOfDay(today) }
    case 'yesterday': {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return { from: y, to: endOfDay(y) }
    }
    case 'month':
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: endOfDay(today) }
    case 'custom':
      return {
        from: custom.from ? startOfDay(new Date(custom.from)) : pageRange.from,
        to: custom.to ? endOfDay(new Date(custom.to)) : endOfDay(pageRange.to),
      }
    default:
      return { from: pageRange.from, to: endOfDay(pageRange.to) }
  }
}

/**
 * A breakdown card with its own date filter. It applies to this card only: it
 * never changes the page filters, and clicking a row doesn't cross-filter the
 * dashboard. Dates the page hasn't loaded are fetched by the card itself, on
 * the background request lane.
 */
const FilteredBreakdown = ({
  title,
  records,
  dimension,
  labelHeader,
  extraHeader,
  columns,
  searchPlaceholder,
  range,
  sheetName,
  categories,
  companyKey,
  scopeRecords,
}) => {
  const [preset, setPreset] = useState('all')
  const [custom, setCustom] = useState({ from: '', to: '' })

  const window = useMemo(() => resolveWindow(preset, custom, range), [preset, custom, range])

  // Days outside the page's loaded range are fetched by the card itself.
  const outsideLoaded =
    preset !== 'all' && (window.from < startOfDay(range.from) || window.to > endOfDay(range.to))
  const own = useWindowRecords({
    categories,
    companyKey,
    from: window.from,
    to: window.to,
    enabled: outsideLoaded,
  })

  const filtered = useMemo(() => {
    if (preset === 'all') {
      return records
    }
    const source = outsideLoaded ? scopeRecords(own.records) : records
    const from = window.from.getTime()
    const to = window.to.getTime()
    return source.filter((r) => {
      const t = r.date.getTime()
      return t >= from && t <= to
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, preset, window, outsideLoaded, own.records, scopeRecords])

  const rows = useMemo(() => groupBy(filtered, dimension), [filtered, dimension])

  return (
    <Panel
      title={title}
      subtitle={
        preset === 'all'
          ? undefined
          : `${toYMD(window.from)} to ${toYMD(window.to)} · ${formatCount(filtered.length)} devices`
      }
      onDownload={() =>
        downloadSheet(sheetName, breakdownRows(rows, labelHeader, extraHeader), {
          from: window.from,
          to: window.to,
        })
      }
    >
      <div className='flex flex-col gap-3 min-w-0'>
        <div className='flex flex-wrap items-center gap-2'>
          <div
            role='group'
            aria-label={`${title} date range`}
            className='inline-flex flex-wrap rounded-md border border-gray-300 bg-white overflow-hidden'
          >
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type='button'
                onClick={() => setPreset(p.key)}
                aria-pressed={preset === p.key}
                className={`px-2.5 py-1.5 text-xs border-r last:border-r-0 border-gray-200 ${
                  preset === p.key ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className='flex items-center gap-2'>
              <input
                type='date'
                aria-label='From date'
                value={custom.from}
                max={custom.to || undefined}
                onChange={(e) => setCustom({ ...custom, from: e.target.value })}
                className='text-sm border border-gray-300 rounded-md px-2 py-1'
                style={{ fontSize: '14px' }}
              />
              <span className='text-xs text-gray-400'>to</span>
              <input
                type='date'
                aria-label='To date'
                value={custom.to}
                min={custom.from || undefined}
                onChange={(e) => setCustom({ ...custom, to: e.target.value })}
                className='text-sm border border-gray-300 rounded-md px-2 py-1'
                style={{ fontSize: '14px' }}
              />
            </div>
          )}
        </div>

        {outsideLoaded && own.loading && (
          <p className='text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded px-3 py-2'>
            Loading {toYMD(window.from)} to {toYMD(window.to)}…
            {own.progress.total
              ? ` ${formatCount(own.progress.loaded)} of ${formatCount(own.progress.total)} records`
              : ''}
          </p>
        )}
        {outsideLoaded && own.error && (
          <p className='text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded px-3 py-2'>
            {own.error}
          </p>
        )}

        {own.loading && !rows.length ? (
          <p className='py-10 text-center text-sm text-gray-400'>Loading…</p>
        ) : (
          <LeaderTable
            rows={rows}
            labelHeader={labelHeader}
            extraHeader={extraHeader}
            columns={columns}
            searchPlaceholder={searchPlaceholder}
          />
        )}
      </div>
    </Panel>
  )
}

export default FilteredBreakdown
