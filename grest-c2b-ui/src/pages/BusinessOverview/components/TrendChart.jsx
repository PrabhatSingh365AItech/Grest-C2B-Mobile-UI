import React, { useEffect, useMemo, useRef, useState } from 'react'
import { formatCount, formatINR, formatINRCompact, formatShortDate } from '../utils/format'

// x-axis tick label for a bucket.
const tickLabel = (date, granularity) =>
  granularity === 'hour'
    ? date.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true }).replace(' ', '')
    : formatShortDate(date)
import { EmptyState } from './Panel'

const HEIGHT = 220
const PAD = { top: 12, right: 8, bottom: 26, left: 52 }
const BAR_COLOR = '#2a78d6'
const BAR_HOVER = '#184f95'

const niceMax = (v) => {
  if (v <= 0) {
    return 1
  }
  const exp = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / exp
  const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return step * exp
}

const TrendChart = ({ buckets, granularity, metric }) => {
  const [hover, setHover] = useState(null)
  const [width, setWidth] = useState(800)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return undefined
    }
    setWidth(node.clientWidth || 800)
    if (typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width) || 800)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const accessor = metric === 'value' ? (b) => b.value : (b) => b.count
  const fmt = metric === 'value' ? formatINRCompact : formatCount

  const geom = useMemo(() => {
    const max = niceMax(Math.max(0, ...buckets.map(accessor)))
    const innerW = Math.max(width - PAD.left - PAD.right, 50)
    const innerH = HEIGHT - PAD.top - PAD.bottom
    const slot = innerW / Math.max(buckets.length, 1)
    const gap = Math.min(Math.max(slot * 0.2, 2), 8)
    const barW = Math.max(slot - gap, 1)
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: PAD.top + innerH - t * innerH,
      label: fmt(t * max),
    }))
    const labelEvery = Math.ceil(buckets.length / Math.max(Math.floor(innerW / 64), 1))
    return { max, innerH, slot, gap, barW, ticks, labelEvery }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buckets, width, metric])

  const hovered = hover !== null ? buckets[hover] : null
  const hasData = buckets.some((b) => b.count > 0)

  return (
    <div ref={ref} className='relative w-full'>
      {!hasData && <EmptyState />}
      {hasData && (
        <svg
          width='100%'
          height={HEIGHT}
          role='img'
          aria-label={`Devices purchased per ${granularity}`}
          onMouseLeave={() => setHover(null)}
        >
          {geom.ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={t.y}
                y2={t.y}
                stroke={i === 0 ? '#c3c2b7' : '#e1e0d9'}
                strokeWidth='1'
              />
              <text
                x={PAD.left - 8}
                y={t.y + 4}
                textAnchor='end'
                fontSize='11'
                fill='#898781'
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {t.label}
              </text>
            </g>
          ))}
          {buckets.map((b, i) => {
            const h = (accessor(b) / geom.max) * geom.innerH
            const x = PAD.left + i * geom.slot + geom.gap / 2
            const y = PAD.top + geom.innerH - h
            const r = Math.min(4, geom.barW / 2, h)
            return (
              <g key={b.key} onMouseEnter={() => setHover(i)}>
                {/* Full-height hit target, wider than the mark */}
                <rect
                  x={PAD.left + i * geom.slot}
                  y={PAD.top}
                  width={geom.slot}
                  height={geom.innerH}
                  fill='transparent'
                />
                {h > 0 && (
                  <path
                    d={`M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + geom.barW - r} Q${x + geom.barW},${y} ${x + geom.barW},${y + r} V${y + h} Z`}
                    fill={hover === i ? BAR_HOVER : BAR_COLOR}
                  />
                )}
                {i % geom.labelEvery === 0 && (
                  <text
                    x={x + geom.barW / 2}
                    y={HEIGHT - 8}
                    textAnchor='middle'
                    fontSize='11'
                    fill='#898781'
                  >
                    {tickLabel(b.date, granularity)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
      {hasData && hovered && (
        <Tooltip
          bucket={hovered}
          granularity={granularity}
          left={Math.min(
            Math.max(PAD.left + hover * geom.slot + geom.slot / 2 - 80, 0),
            width - 170
          )}
        />
      )}
    </div>
  )
}

const Tooltip = ({ bucket, granularity, left }) => (
  <div
    className='absolute top-0 pointer-events-none bg-white border border-gray-200 shadow-md rounded-md px-3 py-2 text-xs whitespace-nowrap'
    style={{ left }}
  >
    <p className='font-semibold text-gray-900'>
      {granularity === 'week' ? 'Week of ' : ''}
      {bucket.date.toLocaleDateString('en-IN', {
        weekday: granularity === 'day' ? 'short' : undefined,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}
      {granularity === 'hour' &&
        `, ${tickLabel(bucket.date, 'hour')}–${tickLabel(
          new Date(bucket.date.getTime() + 60 * 60 * 1000),
          'hour'
        )}`}
    </p>
    <p className='text-gray-600 mt-1'>
      Devices:{' '}
      <span className='text-gray-900 font-medium'>{formatCount(bucket.count)}</span>
    </p>
    <p className='text-gray-600'>
      Value:{' '}
      <span className='text-gray-900 font-medium'>{formatINR(bucket.value)}</span>
    </p>
  </div>
)

export default TrendChart
