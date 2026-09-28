import React, { useMemo, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { describeRule, rulesFor } from '../utils/commission'

const EMPTY_RULE = { platform: 'any', min: null, max: null, type: 'percent', value: 0 }

const numberOrNull = (v) => {
  if (v === '' || v == null) {
    return null
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const inputClass = 'border border-gray-300 rounded-md px-2 py-1 text-sm w-full'

const RuleRow = ({ rule, onChange, onRemove }) => (
  <div className='grid grid-cols-2 sm:grid-cols-12 gap-2 items-center'>
    <select
      aria-label='Applies to'
      value={rule.platform || 'any'}
      onChange={(e) => onChange({ ...rule, platform: e.target.value })}
      className={`${inputClass} sm:col-span-3`}
      style={{ fontSize: '14px' }}
    >
      <option value='any'>Apple + Android</option>
      <option value='apple'>Apple only</option>
      <option value='android'>Android only</option>
    </select>
    <input
      aria-label='Price from'
      type='number'
      placeholder='From ₹'
      value={rule.min ?? ''}
      onChange={(e) => onChange({ ...rule, min: numberOrNull(e.target.value) })}
      className={`${inputClass} sm:col-span-2`}
      style={{ fontSize: '14px' }}
    />
    <input
      aria-label='Price under'
      type='number'
      placeholder='Under ₹'
      value={rule.max ?? ''}
      onChange={(e) => onChange({ ...rule, max: numberOrNull(e.target.value) })}
      className={`${inputClass} sm:col-span-2`}
      style={{ fontSize: '14px' }}
    />
    <select
      aria-label='Commission type'
      value={rule.type}
      onChange={(e) => onChange({ ...rule, type: e.target.value })}
      className={`${inputClass} sm:col-span-2`}
      style={{ fontSize: '14px' }}
    >
      <option value='percent'>% of device price</option>
      <option value='flat'>₹ per device</option>
    </select>
    <input
      aria-label='Commission value'
      type='number'
      step='0.1'
      value={rule.value}
      onChange={(e) => onChange({ ...rule, value: Number(e.target.value) })}
      className={`${inputClass} sm:col-span-2`}
      style={{ fontSize: '14px' }}
    />
    <button
      type='button'
      onClick={onRemove}
      title='Remove rule'
      className='sm:col-span-1 text-xs text-gray-500 hover:text-red-600 justify-self-start px-2 py-1'
    >
      Remove
    </button>
  </div>
)

const CompanyRules = ({ company, rules, isDefault, onChange, onReset }) => (
  <div className='border border-gray-200 rounded-lg p-3 flex flex-col gap-2'>
    <div className='flex flex-wrap items-center justify-between gap-2'>
      <div className='min-w-0'>
        <p className='text-sm font-semibold text-gray-900 truncate'>{company.name}</p>
        <p className='text-xs text-gray-500'>
          {rules.length ? rules.map(describeRule).join(' · ') : 'No commission'}
          {isDefault && rules.length ? ' · agreed default' : ''}
        </p>
      </div>
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={() => onChange([...rules, { ...EMPTY_RULE }])}
          className='text-xs font-medium text-gray-700 px-2.5 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50'
        >
          Add rule
        </button>
        <button
          type='button'
          onClick={onReset}
          disabled={isDefault}
          className='text-xs font-medium text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40'
        >
          Reset
        </button>
      </div>
    </div>
    {rules.length > 0 && (
      <div className='flex flex-col gap-2'>
        <p className='text-[11px] uppercase tracking-wide text-gray-400'>
          First matching rule applies · blank price = no limit
        </p>
        {rules.map((rule, i) => (
          <RuleRow
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            rule={rule}
            onChange={(next) => onChange(rules.map((r, j) => (i === j ? next : r)))}
            onRemove={() => onChange(rules.filter((_, j) => j !== i))}
          />
        ))}
      </div>
    )}
  </div>
)

/**
 * Editor for per-company commission rules. Starts from the agreed rates
 * (matched by company name) and saves overrides in this browser.
 */
const CommissionRates = ({ companies, rates, onSave, onClose }) => {
  const [draft, setDraft] = useState(rates)

  const list = useMemo(
    () => [...companies].sort((a, b) => String(a.name).localeCompare(String(b.name))),
    [companies]
  )

  const rulesOf = (c) => rulesFor(c._id, c.name, draft)
  const isDefaultFor = (c) => !draft[c._id]

  const setRules = (c, rules) => setDraft({ ...draft, [c._id]: { name: c.name, rules } })
  const reset = (c) => {
    const next = { ...draft }
    delete next[c._id]
    setDraft(next)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 flex flex-col'>
        <header className='flex items-start justify-between gap-3 p-4 border-b border-gray-200'>
          <div>
            <h2 className='text-base font-semibold text-gray-900'>Commission rates</h2>
            <p className='text-xs text-gray-500 mt-0.5'>
              Percentages apply to the device price before add-ons. Commission is added to
              Purchase value and Add-ons paid.
            </p>
          </div>
          <button type='button' onClick={onClose} aria-label='Close' className='p-1'>
            <IoClose size={22} />
          </button>
        </header>

        <div className='p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto'>
          {list.length === 0 && (
            <p className='text-sm text-gray-500'>No companies in the current view.</p>
          )}
          {list.map((c) => (
            <CompanyRules
              key={c._id}
              company={c}
              rules={rulesOf(c)}
              isDefault={isDefaultFor(c)}
              onChange={(rules) => setRules(c, rules)}
              onReset={() => reset(c)}
            />
          ))}
        </div>

        <footer className='flex items-center justify-between gap-3 p-4 border-t border-gray-200'>
          <p className='text-xs text-gray-500'>Saved in this browser only.</p>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='text-sm px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={() => {
                onSave(draft)
                onClose()
              }}
              className='text-sm px-3 py-2 rounded-md bg-primary text-white hover:opacity-90'
            >
              Save rates
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default CommissionRates
