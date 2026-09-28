import React, { useEffect, useMemo, useState } from 'react'
import { IoMdSearch } from 'react-icons/io'
import { formatCount, formatINR, formatPct } from '../utils/format'
import { EmptyState } from './Panel'
import Pagination from './Pagination'
import { paginate } from '../utils/paginate'

const PAGE_SIZE = 10

const DEFAULT_COLUMNS = [
  { key: 'count', label: 'Devices', format: formatCount },
  { key: 'value', label: 'Value', format: formatINR },
  { key: 'avgTicket', label: 'Avg ticket', format: formatINR },
  { key: 'receivedPct', label: 'Received', format: formatPct },
]

/**
 * Sortable, searchable, paginated breakdown table. Rows are clickable to
 * cross-filter the page.
 */
const LeaderTable = ({
  rows,
  labelHeader,
  extraHeader,
  columns = DEFAULT_COLUMNS,
  metric = 'count',
  focusId,
  onSelect,
  searchPlaceholder = 'Search…',
  // e.g. 'brands' - adds an "All brands" dropdown filtering the extra column.
  filterNoun,
}) => {
  const [sortKey, setSortKey] = useState(metric)
  const [sortDir, setSortDir] = useState('desc')
  const [query, setQuery] = useState('')
  const [filterValue, setFilterValue] = useState('')

  // Dropdown options: distinct values of the extra column, most devices first.
  const filterOptions = useMemo(() => {
    if (!filterNoun || !extraHeader) {
      return []
    }
    const counts = new Map()
    rows.forEach((r) => {
      if (r.extra) {
        counts.set(r.extra, (counts.get(r.extra) || 0) + r.count)
      }
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value)
  }, [rows, filterNoun, extraHeader])
  const [page, setPage] = useState(0)

  // Follow the page-level "By devices / By value" toggle.
  useEffect(() => {
    setSortKey(metric)
    setSortDir('desc')
    setPage(0)
  }, [metric])

  const totalCount = rows.reduce((s, r) => s + r.count, 0)
  const maxCount = rows.reduce((m, r) => Math.max(m, r.count), 1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const byFilter = filterValue ? rows.filter((r) => r.extra === filterValue) : rows
    const list = q
      ? byFilter.filter(
          (r) =>
            String(r.label).toLowerCase().includes(q) ||
            String(r.extra || '')
              .toLowerCase()
              .includes(q),
        )
      : byFilter
    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'label') {
        return String(a.label).localeCompare(String(b.label)) * dir
      }
      return ((a[sortKey] || 0) - (b[sortKey] || 0)) * dir
    })
  }, [rows, query, sortKey, sortDir, filterValue])

  const { pageCount, safePage, visible } = paginate(filtered, page, PAGE_SIZE)

  const sortBy = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'label' ? 'asc' : 'desc')
    }
  }

  const arrow = (key) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '')

  if (!rows.length) {
    return <EmptyState />
  }

  return (
    <div className='flex flex-col gap-3 min-w-0'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='flex items-center gap-2 border border-gray-300 rounded-md px-2 max-w-xs flex-1 min-w-[180px]'>
          <IoMdSearch className='text-gray-400 shrink-0' size={18} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder={searchPlaceholder}
            className='w-full py-1.5 outline-none bg-transparent'
            style={{ fontSize: '14px' }}
          />
        </div>
        {filterOptions.length > 1 && (
          <select
            aria-label={`Filter by ${extraHeader}`}
            value={filterValue}
            onChange={(e) => {
              setFilterValue(e.target.value)
              setPage(0)
            }}
            className='text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white max-w-[220px]'
            style={{ fontSize: '14px' }}
          >
            <option value=''>All {filterNoun}</option>
            {filterOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200'>
              <th className='py-2 pr-3 font-medium w-8'>#</th>
              <th
                className='py-2 pr-3 font-medium cursor-pointer select-none'
                onClick={() => sortBy('label')}
              >
                {labelHeader}
                {arrow('label')}
              </th>
              {extraHeader && <th className='py-2 pr-3 font-medium'>{extraHeader}</th>}
              {columns.map((c) => (
                <th
                  key={c.key}
                  className='py-2 pr-3 font-medium text-right cursor-pointer select-none whitespace-nowrap'
                  onClick={() => sortBy(c.key)}
                >
                  {c.label}
                  {arrow(c.key)}
                </th>
              ))}
              <th className='py-2 font-medium text-right whitespace-nowrap'>Share</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => {
              const share = totalCount ? (row.count / totalCount) * 100 : 0
              const isFocused = focusId === row.id
              return (
                <tr
                  key={row.id}
                  onClick={() => onSelect?.(row)}
                  className={`border-b border-gray-100 cursor-pointer ${
                    isFocused ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className='py-2 pr-3 text-gray-400 tabular-nums'>
                    {safePage * PAGE_SIZE + i + 1}
                  </td>
                  <td className='py-2 pr-3 text-gray-900 font-medium max-w-[240px] truncate'>
                    {row.label}
                  </td>
                  {extraHeader && (
                    <td className='py-2 pr-3 text-gray-600 whitespace-nowrap'>{row.extra}</td>
                  )}
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className='py-2 pr-3 text-right tabular-nums text-gray-800 whitespace-nowrap'
                    >
                      {c.format(row[c.key])}
                    </td>
                  ))}
                  <td className='py-2 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <div className='w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{
                            width: `${(row.count / maxCount) * 100}%`,
                            backgroundColor: '#2a78d6',
                          }}
                        />
                      </div>
                      <span className='text-xs text-gray-500 tabular-nums w-11 text-right'>
                        {formatPct(share)}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!visible.length && <EmptyState text='No matches' />}
      </div>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        total={filtered.length}
        onChange={setPage}
      />
    </div>
  )
}

export default LeaderTable
