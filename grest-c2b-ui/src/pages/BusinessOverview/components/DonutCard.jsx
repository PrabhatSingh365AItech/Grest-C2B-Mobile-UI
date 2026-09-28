import React, { useMemo, useState } from 'react'
import { formatCount, formatINR, formatINRCompact, formatPct } from '../utils/format'
import { CATEGORICAL, ORDINAL, OTHER_COLOR } from '../utils/palette'

const SIZE = 180
const R_OUT = 86
const R_IN = 58
const GAP_DEG = 1.6 // surface gap between slices
// Top N named slices; the rest fold into "Others (n …)".
const TOP = 4

const polar = (r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return [SIZE / 2 + r * Math.cos(rad), SIZE / 2 + r * Math.sin(rad)]
}

const arcPath = (start, end) => {
  if (end - start >= 359.99) {
    // A full ring can't be one arc: draw two halves, outer then inner.
    const [a, b] = polar(R_OUT, 0)
    const [c, d] = polar(R_OUT, 180)
    const [e, f] = polar(R_IN, 0)
    const [g, h] = polar(R_IN, 180)
    return `M${a},${b} A${R_OUT},${R_OUT} 0 1 1 ${c},${d} A${R_OUT},${R_OUT} 0 1 1 ${a},${b} M${e},${f} A${R_IN},${R_IN} 0 1 0 ${g},${h} A${R_IN},${R_IN} 0 1 0 ${e},${f} Z`
  }
  const large = end - start > 180 ? 1 : 0
  const [x1, y1] = polar(R_OUT, start)
  const [x2, y2] = polar(R_OUT, end)
  const [x3, y3] = polar(R_IN, end)
  const [x4, y4] = polar(R_IN, start)
  return `M${x1},${y1} A${R_OUT},${R_OUT} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${R_IN},${R_IN} 0 ${large} 0 ${x4},${y4} Z`
}

/**
 * Compact share card: small donut, top 4 + "Others", own Devices/Value switch.
 * Clicking a named slice or legend row cross-filters the page.
 *
 * `noun` names the folded tail ("Others (5 companies)").
 * `scale="ordinal"` colours ordered dimensions (grades) with a one-hue ramp.
 */
const DonutCard = ({
  title,
  rows,
  noun = 'items',
  scale = 'categorical',
  defaultMetric = 'count',
  focusId,
  onSelect,
}) => {
  const [metric, setMetric] = useState(defaultMetric)
  const [hover, setHover] = useState(null)
  const value = (r) => (metric === 'value' ? r.value : r.count)
  const fmt = metric === 'value' ? formatINRCompact : formatCount

  const { slices, total } = useMemo(() => {
    const byValue = [...rows].sort((a, b) => value(b) - value(a))
    const sum = byValue.reduce((s, r) => s + value(r), 0)
    const folded = byValue.length > TOP + 1
    let shown = folded ? byValue.slice(0, TOP) : byValue
    // Ordered dimensions keep their natural order among the shown slices.
    if (scale === 'ordinal') {
      shown = [...shown].sort((a, b) => String(a.label).localeCompare(String(b.label)))
    }
    const ramp = scale === 'ordinal' ? ORDINAL : CATEGORICAL
    const list = shown.map((row, i) => ({ row, color: ramp[i % ramp.length] }))
    if (folded) {
      const rest = byValue.slice(TOP)
      list.push({
        row: {
          id: '__others__',
          label: `Others (${rest.length} ${noun})`,
          count: rest.reduce((s, r) => s + r.count, 0),
          value: rest.reduce((s, r) => s + r.value, 0),
          isOther: true,
        },
        color: OTHER_COLOR,
      })
    }
    let angle = 0
    return {
      total: sum,
      slices: list.map((s) => {
        const share = sum ? value(s.row) / sum : 0
        const start = angle
        angle += share * 360
        return { ...s, share, start, end: angle }
      }),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, metric, scale, noun])

  const active = hover !== null ? slices[hover] : null

  return (
    <div className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 min-w-0'>
      <div className='flex items-center justify-between gap-2'>
        <h3 className='text-sm font-semibold text-gray-900 truncate'>{title}</h3>
        <select
          aria-label={`${title} metric`}
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className='text-xs border border-gray-300 rounded-full pl-2.5 pr-1 py-1 bg-white text-gray-700'
          style={{ fontSize: '12px' }}
        >
          <option value='count'>Devices</option>
          <option value='value'>Value</option>
        </select>
      </div>

      {!rows.length || total <= 0 ? (
        <p className='py-8 text-center text-xs text-gray-400'>No purchases in this view</p>
      ) : (
        <>
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className='self-center'
            role='img'
            aria-label={`${title} share`}
            onMouseLeave={() => setHover(null)}
          >
            {slices.map((s, i) => {
              const gap = slices.length > 1 ? Math.min(GAP_DEG, (s.end - s.start) / 3) : 0
              const isFocused = focusId === s.row.id
              return (
                <path
                  key={s.row.id}
                  d={arcPath(s.start, Math.max(s.end - gap, s.start + 0.01))}
                  fill={s.color}
                  opacity={focusId && !isFocused ? 0.35 : 1}
                  className={s.row.isOther ? '' : 'cursor-pointer'}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => !s.row.isOther && onSelect?.(s.row)}
                >
                  <title>{`${s.row.label}: ${fmt(value(s.row))} (${formatPct(s.share * 100)})`}</title>
                </path>
              )
            })}
            <text
              x={SIZE / 2}
              y={SIZE / 2 - 2}
              textAnchor='middle'
              fontSize='19'
              fontWeight='600'
              fill='#0b0b0b'
            >
              {active ? formatPct(active.share * 100) : fmt(total)}
            </text>
            <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor='middle' fontSize='11' fill='#898781'>
              {active
                ? active.row.label.length > 14
                  ? `${active.row.label.slice(0, 13)}…`
                  : active.row.label
                : metric === 'value'
                  ? 'value'
                  : 'devices'}
            </text>
          </svg>

          <ul className='flex flex-col gap-0.5'>
            {slices.map((s, i) => (
              <li key={s.row.id}>
                <button
                  type='button'
                  disabled={s.row.isOther}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onSelect?.(s.row)}
                  title={`${s.row.label}: ${formatCount(s.row.count)} devices · ${formatINR(s.row.value)}`}
                  className={`w-full flex items-center gap-2 rounded px-1 py-0.5 text-xs text-left ${
                    focusId === s.row.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } ${s.row.isOther ? 'cursor-default' : ''}`}
                >
                  <span
                    aria-hidden='true'
                    className='w-2 h-2 rounded-full shrink-0'
                    style={{ backgroundColor: s.color }}
                  />
                  <span className='truncate text-gray-700'>{s.row.label}</span>
                  <span className='ml-auto shrink-0 font-semibold text-gray-900 tabular-nums'>
                    {fmt(value(s.row))}
                  </span>
                  <span className='shrink-0 w-10 text-right text-gray-400 tabular-nums'>
                    {formatPct(s.share * 100)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default DonutCard
