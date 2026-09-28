import React, { useState } from 'react'
import { formatCount, formatINR, formatINRCompact, formatPct } from '../utils/format'
import { CATEGORICAL } from '../utils/palette'
import { describeRule, rulesFor } from '../utils/commission'

const Tile = ({ label, value, hint, title, onClick, expanded }) => {
  const body = (
    <>
      <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>{label}</p>
      <p className='text-2xl font-semibold text-gray-900 mt-1 truncate'>{value}</p>
      {hint && <p className='text-xs text-gray-500 mt-1 truncate'>{hint}</p>}
    </>
  )
  const base = 'bg-white rounded-xl border shadow-sm px-4 py-3 min-w-0 text-left'
  if (!onClick) {
    return (
      <div className={`${base} border-gray-200`} title={title}>
        {body}
      </div>
    )
  }
  return (
    <button
      type='button'
      onClick={onClick}
      aria-expanded={expanded}
      title={title}
      className={`${base} transition-colors ${
        expanded ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      {body}
    </button>
  )
}

// Purchase value components, in the order they build up the customer price.
// Commission is not one of them: it is an estimate, and it is paid to the
// partner rather than the customer, so it is shown as a separate memo row.
const PARTS = [
  { key: 'devicePrice', label: 'Device price', hint: 'Price before add-ons' },
  { key: 'slabBonus', label: 'Slab bonus', hint: 'Dynamic-pricing bonus' },
  { key: 'negotiation', label: 'Negotiation', hint: 'Extra agreed at the counter' },
  { key: 'coupon', label: 'Coupon', hint: 'Coupon discounts' },
  { key: 'adjustment', label: 'Other', hint: 'Difference in the recorded final price' },
]

const PurchaseBreakdown = ({ kpis, onClose }) => {
  const total = kpis.value || 0
  const rows = PARTS.map((p, i) => ({
    ...p,
    color: CATEGORICAL[i],
    amount: kpis.parts?.[p.key]?.amount || 0,
    devices: kpis.parts?.[p.key]?.devices || 0,
  }))
  const visible = rows.filter((r) => r.amount > 0)

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 flex flex-col gap-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold text-gray-900'>Purchase value breakdown</h2>
          <p className='text-xs text-gray-500 mt-0.5'>
            Device price plus every add-on paid to customers · {formatCount(kpis.count)} devices
          </p>
        </div>
        <div className='flex gap-2 shrink-0'>
          <button
            type='button'
            onClick={onClose}
            className='text-xs font-medium text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50'
          >
            Close
          </button>
        </div>
      </div>

      {/* Composition bar: segments separated by a 2px surface gap. */}
      <div
        className='flex h-3 w-full overflow-hidden rounded-full bg-gray-100 gap-[2px]'
        role='img'
        aria-label='Purchase value composition'
      >
        {visible.map((r) => (
          <div
            key={r.key}
            title={`${r.label}: ${formatINR(r.amount)}`}
            style={{ width: `${total ? (r.amount / total) * 100 : 0}%`, backgroundColor: r.color }}
          />
        ))}
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200'>
              <th className='py-2 pr-3 font-medium'>Component</th>
              <th className='py-2 pr-3 font-medium text-right'>Amount</th>
              <th className='py-2 pr-3 font-medium text-right'>Share</th>
              <th className='py-2 pr-3 font-medium text-right whitespace-nowrap'>Devices</th>
              <th className='py-2 font-medium text-right whitespace-nowrap'>Avg per device</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className='border-b border-gray-100'>
                <td className='py-2 pr-3'>
                  <div className='flex items-center gap-2'>
                    <span
                      aria-hidden='true'
                      className='w-2.5 h-2.5 rounded-sm shrink-0'
                      style={{ backgroundColor: r.color }}
                    />
                    <span className='text-gray-900 font-medium'>{r.label}</span>
                    <span className='text-xs text-gray-400 hidden sm:inline'>{r.hint}</span>
                  </div>
                </td>
                <td className='py-2 pr-3 text-right tabular-nums text-gray-900'>
                  {formatINR(r.amount)}
                </td>
                <td className='py-2 pr-3 text-right tabular-nums text-gray-500'>
                  {formatPct(total ? (r.amount / total) * 100 : 0)}
                </td>
                <td className='py-2 pr-3 text-right tabular-nums text-gray-700'>
                  {formatCount(r.devices)}
                </td>
                <td className='py-2 text-right tabular-nums text-gray-700'>
                  {r.devices ? formatINR(r.amount / r.devices) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className='font-semibold'>
              <td className='py-2 pr-3 text-gray-900'>Purchase value</td>
              <td className='py-2 pr-3 text-right tabular-nums text-gray-900'>{formatINR(total)}</td>
              <td className='py-2 pr-3 text-right tabular-nums text-gray-500'>100%</td>
              <td className='py-2 pr-3 text-right tabular-nums text-gray-700'>
                {formatCount(kpis.count)}
              </td>
              <td className='py-2 text-right tabular-nums text-gray-700'>
                {formatINR(kpis.avgTicket)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

const CommissionBreakdown = ({ kpis, rows, rates, onClose, onEditRates }) => {
  const total = kpis.parts?.commission?.amount || 0
  const earning = rows.filter((r) => r.commission > 0)

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 flex flex-col gap-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold text-gray-900'>Approx commission by company</h2>
          <p className='text-xs text-gray-500 mt-0.5'>
            Each company&apos;s rate applied to its device price · paid to the partner, not the
            customer
          </p>
        </div>
        <div className='flex gap-2 shrink-0'>
          <button
            type='button'
            onClick={onEditRates}
            className='text-xs font-medium text-gray-700 px-2.5 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50'
          >
            Commission rates
          </button>
          <button
            type='button'
            onClick={onClose}
            className='text-xs font-medium text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50'
          >
            Close
          </button>
        </div>
      </div>

      {!earning.length && (
        <p className='text-sm text-gray-500'>
          No commission for these purchases. Set a rate with{' '}
          <span className='font-medium'>Commission rates</span>.
        </p>
      )}

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200'>
              <th className='py-2 pr-3 font-medium'>Company</th>
              <th className='py-2 pr-3 font-medium'>Rate</th>
              <th className='py-2 pr-3 font-medium text-right'>Devices</th>
              <th className='py-2 pr-3 font-medium text-right whitespace-nowrap'>Device value</th>
              <th className='py-2 pr-3 font-medium text-right'>Commission</th>
              <th className='py-2 font-medium text-right'>Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const rules = rulesFor(r.id, r.label, rates)
              return (
                <tr key={r.id} className='border-b border-gray-100'>
                  <td className='py-2 pr-3 text-gray-900 font-medium max-w-[220px] truncate'>
                    {r.label}
                  </td>
                  <td className='py-2 pr-3 text-gray-600 text-xs'>
                    {rules.length ? rules.map(describeRule).join(' · ') : 'No rate set'}
                  </td>
                  <td className='py-2 pr-3 text-right tabular-nums text-gray-700'>
                    {formatCount(r.devices)}
                  </td>
                  <td className='py-2 pr-3 text-right tabular-nums text-gray-700'>
                    {formatINR(r.devicePrice)}
                  </td>
                  <td className='py-2 pr-3 text-right tabular-nums text-gray-900'>
                    {formatINR(r.commission)}
                  </td>
                  <td className='py-2 text-right tabular-nums text-gray-500'>
                    {formatPct(total ? (r.commission / total) * 100 : 0)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className='font-semibold'>
              <td className='py-2 pr-3 text-gray-900' colSpan={2}>
                Total
              </td>
              <td className='py-2 pr-3 text-right tabular-nums text-gray-900'>
                {formatCount(kpis.count)}
              </td>
              <td className='py-2 pr-3 text-right tabular-nums text-gray-900'>
                {formatINR(kpis.parts?.devicePrice?.amount || 0)}
              </td>
              <td className='py-2 pr-3 text-right tabular-nums text-gray-900'>
                {formatINR(total)}
              </td>
              <td className='py-2 text-right tabular-nums text-gray-500'>100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

const KpiTiles = ({ kpis, totalStores, commissionRows = [], commissionRates = {}, onEditRates }) => {
  // null | 'value' | 'commission'
  const [panel, setPanel] = useState(null)
  const toggle = (which) => setPanel((p) => (p === which ? null : which))

  return (
    <div className='flex flex-col gap-3'>
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3'>
        <Tile label='Devices purchased' value={formatCount(kpis.count)} />
        <Tile
          label='Purchase value'
          value={formatINRCompact(kpis.value)}
          title={`${formatINR(kpis.value)} · click for breakdown`}
          hint={panel === 'value' ? 'Hide breakdown ▴' : 'Incl. all add-ons · breakdown ▾'}
          onClick={() => toggle('value')}
          expanded={panel === 'value'}
        />
        <Tile
          label='Avg ticket'
          value={formatINRCompact(kpis.avgTicket)}
          title={formatINR(kpis.avgTicket)}
          hint='Per device, incl. add-ons'
        />
        <Tile
          label='Active stores'
          value={formatCount(kpis.activeStores)}
          hint={
            totalStores
              ? `of ${formatCount(totalStores)} stores · ${formatCount(kpis.activeCompanies)} companies`
              : `${formatCount(kpis.activeCompanies)} companies`
          }
        />
        <Tile
          label='Received at warehouse'
          value={formatPct(kpis.receivedPct)}
          hint={`${formatCount(kpis.pendingReceipt)} devices not yet received`}
        />
        <Tile
          label='Approx commission'
          value={formatINRCompact(kpis.parts?.commission?.amount || 0)}
          title={`${formatINR(kpis.parts?.commission?.amount || 0)} · click for breakdown`}
          hint={panel === 'commission' ? 'Hide breakdown ▴' : 'Company rates · breakdown ▾'}
          onClick={() => toggle('commission')}
          expanded={panel === 'commission'}
        />
      </div>
      {panel === 'value' && <PurchaseBreakdown kpis={kpis} onClose={() => setPanel(null)} />}
      {panel === 'commission' && (
        <CommissionBreakdown
          kpis={kpis}
          rows={commissionRows}
          rates={commissionRates}
          onClose={() => setPanel(null)}
          onEditRates={onEditRates}
        />
      )}
    </div>
  )
}

export default KpiTiles
