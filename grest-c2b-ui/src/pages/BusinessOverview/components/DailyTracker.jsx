import React, { useMemo, useState } from 'react'
import { IoMdSearch } from 'react-icons/io'
import { formatCount } from '../utils/format'
import { paginate } from '../utils/paginate'
import { EmptyState } from './Panel'
import Pagination from './Pagination'

const PAGE_SIZE = 10

const fmtConv = (v) => (v === null ? '—' : `${Math.round(v * 100)}%`)
const fmtAvg = (v) => (v === null ? '—' : v.toFixed(1))
const fmtFos = (v) => (v ? formatCount(v) : '—')

const COLS = [
  { key: 'recentQuoted', label: 'Quote Given', group: 'recent', fmt: formatCount },
  { key: 'recentConverted', label: 'Converted', group: 'recent', fmt: formatCount },
  { key: 'recentConv', label: 'Conv%', group: 'recent', fmt: fmtConv },
  { key: 'fosAvailable', label: 'FOS Available', group: 'month', fmt: fmtFos },
  { key: 'monthQuoted', label: 'Quoted', group: 'month', fmt: formatCount },
  { key: 'monthConverted', label: 'Converted', group: 'month', fmt: formatCount },
  { key: 'monthConv', label: 'Conv%', group: 'month', fmt: fmtConv },
  { key: 'availDays', label: 'FOS Total Avail. Days', group: 'month', fmt: fmtFos },
  { key: 'avgConv', label: 'AVG Conv', group: 'month', fmt: fmtAvg },
]

// Columns that depend on conversions (sold records) - shown as pending until
// their window has loaded, rather than as misleading zeros.
const RECENT_CONVERSION_KEYS = new Set(['recentConverted', 'recentConv'])
const MONTH_CONVERSION_KEYS = new Set(['monthConverted', 'monthConv', 'avgConv'])

const progressText = ({ loaded, total }) =>
  total ? ` ${formatCount(loaded)} of ${formatCount(total)} records` : ''

const th = 'px-3 py-2 text-xs font-semibold text-gray-700 whitespace-nowrap'
const td = 'px-3 py-2 text-sm tabular-nums whitespace-nowrap'

const DailyTracker = ({
  rows,
  totals,
  recentLabel,
  isLoading,
  recentReady,
  monthReady,
  recentProgress,
  monthProgress,
  error,
  conversionsError,
}) => {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? rows.filter((r) => `${r.storeName} ${r.name}`.toLowerCase().includes(q))
      : rows
  }, [rows, query])

  if (isLoading && !rows.length) {
    return <EmptyState text='Loading FOS and quotes…' />
  }
  const pending = (key) =>
    (!recentReady && RECENT_CONVERSION_KEYS.has(key)) ||
    (!monthReady && MONTH_CONVERSION_KEYS.has(key))
  const cell = (c, source) => (pending(c.key) ? '…' : c.fmt(source[c.key]))
  if (!rows.length) {
    return <EmptyState text={error || 'No FOS or quote activity for this selection'} />
  }

  const { pageCount, safePage, visible } = paginate(filtered, page, PAGE_SIZE)

  return (
    <div className={`flex flex-col gap-3 min-w-0 ${isLoading ? 'opacity-60' : ''}`}>
      {(!recentReady || !monthReady) && (
        <p className='text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded px-3 py-2'>
          {!recentReady
            ? `Loading ${recentLabel.toLowerCase()} conversions…${progressText(recentProgress)}`
            : `Loading last-month conversions in the background…${progressText(monthProgress)}`}{' '}
          Columns marked … fill in when done.
        </p>
      )}
      {[error, conversionsError].filter(Boolean).map((msg) => (
        <p
          key={msg}
          className='text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2'
        >
          {msg}
        </p>
      ))}
      <div className='flex items-center gap-2 border border-gray-300 rounded-md px-2 max-w-xs'>
        <IoMdSearch className='text-gray-400 shrink-0' size={18} />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          placeholder='Search store or FOS…'
          className='w-full py-1.5 outline-none bg-transparent'
        />
      </div>

      <div className='overflow-x-auto border border-gray-200 rounded-lg'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-100 border-b border-gray-200'>
              <th colSpan={3} className={`${th} text-left`} />
              <th colSpan={3} className={`${th} text-center border-l border-gray-300`}>
                {recentLabel}
              </th>
              <th colSpan={6} className={`${th} text-center border-l border-gray-300`}>
                Last 1 month
              </th>
            </tr>
            <tr className='bg-gray-50 border-b border-gray-200'>
              <th className={`${th} text-left`}>S.N</th>
              <th className={`${th} text-left`}>Store Name</th>
              <th className={`${th} text-left`}>Technician Name</th>
              {COLS.map((c, i) => (
                <th
                  key={c.key}
                  className={`${th} text-right ${
                    i === 0 || c.key === 'fosAvailable' ? 'border-l border-gray-300' : ''
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={r.email} className='border-b border-gray-100 hover:bg-gray-50'>
                <td className={`${td} text-gray-400`}>{safePage * PAGE_SIZE + i + 1}</td>
                <td className={`${td} text-gray-900 font-medium max-w-[220px] truncate`}>
                  {r.storeName}
                </td>
                <td className={`${td} text-gray-800 max-w-[200px] truncate`} title={r.email}>
                  {r.name}
                  {!r.isFos && (
                    <span className='ml-1.5 text-[10px] uppercase tracking-wide text-gray-400'>
                      not FOS
                    </span>
                  )}
                </td>
                {COLS.map((c, ci) => (
                  <td
                    key={c.key}
                    className={`${td} text-right text-gray-800 ${
                      ci === 0 || c.key === 'fosAvailable' ? 'border-l border-gray-200' : ''
                    }`}
                  >
                    {cell(c, r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className='bg-gray-50 border-t-2 border-gray-300 font-semibold'>
              <td className={td} />
              <td className={`${td} text-gray-900`} colSpan={2}>
                Total ({formatCount(rows.length)} rows)
              </td>
              {COLS.map((c, ci) => (
                <td
                  key={c.key}
                  className={`${td} text-right text-gray-900 ${
                    ci === 0 || c.key === 'fosAvailable' ? 'border-l border-gray-200' : ''
                  }`}
                >
                  {cell(c, totals)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
        {!visible.length && <EmptyState text='No matches' />}
      </div>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        total={filtered.length}
        onChange={setPage}
        noun='rows'
      />
    </div>
  )
}

export default DailyTracker
