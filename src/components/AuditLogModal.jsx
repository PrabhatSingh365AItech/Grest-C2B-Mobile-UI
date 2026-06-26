import React from 'react'

const actionStyles = {
  Created: { badge: 'bg-green-100 text-green-800', border: 'border-green-200' },
  Updated: { badge: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
  Deleted: { badge: 'bg-red-100 text-red-800', border: 'border-red-200' },
  FeatureEnabled: { badge: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-200' },
  FeatureDisabled: { badge: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
  SlabUpdated: { badge: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
}

const defaultStyle = { badge: 'bg-gray-100 text-gray-800', border: 'border-gray-200' }

const formatAction = (action) => {
  switch (action) {
    case 'FeatureEnabled': return 'Enabled'
    case 'FeatureDisabled': return 'Disabled'
    default: return action
  }
}

const DiffRow = ({ label, before, after, render }) => (
  <div className='text-xs mb-1.5'>
    <span className='text-gray-500 font-medium'>{label}: </span>
    {render ? (
      render(before, after)
    ) : (
      <>
        <span className='text-gray-400 line-through'>{before ?? '(empty)'}</span>
        <span className='text-gray-300 mx-1'>→</span>
        <span className='text-gray-800 font-medium'>{after ?? '(empty)'}</span>
      </>
    )}
  </div>
)

const SlabDiff = ({ before, after }) => {
  if (!before?.length && !after?.length) return null
  return (
    <details className='mt-2'>
      <summary className='cursor-pointer text-xs text-gray-500 font-medium hover:text-gray-700'>
        Slab changes ({before?.length || 0} → {after?.length || 0} slabs)
      </summary>
      <div className='mt-2 grid grid-cols-2 gap-4'>
        <div>
          <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1'>Before</p>
          {!before?.length ? (
            <p className='text-xs text-gray-400 italic'>No slabs</p>
          ) : (
            <div className='space-y-0.5'>
              <div className='flex gap-2 text-[10px] font-medium text-gray-400'>
                <span className='w-10'>Min</span>
                <span className='w-10'>Max</span>
                <span className='w-10'>Bonus</span>
              </div>
              {before.map((s, i) => (
                <div key={i} className='flex gap-2 text-[10px] text-gray-500'>
                  <span className='w-10'>{s.minValue}</span>
                  <span className='w-10'>{s.maxValue}</span>
                  <span className='w-10'>₹{s.bonusAmount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1'>After</p>
          {!after?.length ? (
            <p className='text-xs text-gray-400 italic'>No slabs</p>
          ) : (
            <div className='space-y-0.5'>
              <div className='flex gap-2 text-[10px] font-medium text-gray-400'>
                <span className='w-10'>Min</span>
                <span className='w-10'>Max</span>
                <span className='w-10'>Bonus</span>
              </div>
              {after.map((s, i) => (
                <div key={i} className='flex gap-2 text-[10px] text-gray-700'>
                  <span className='w-10'>{s.minValue}</span>
                  <span className='w-10'>{s.maxValue}</span>
                  <span className='w-10'>₹{s.bonusAmount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </details>
  )
}

const AuditLogEntry = ({ entry }) => {
  const style = actionStyles[entry.action] || defaultStyle
  const { before, after } = entry.changes || {}

  return (
    <div className={`border rounded-lg p-3.5 text-sm ${style.border} bg-white shadow-sm`}>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2.5'>
          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${style.badge}`}>
            {formatAction(entry.action)}
          </span>
          <span className='text-xs text-gray-400'>
            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '-'}
          </span>
        </div>
      </div>

      {before && after && (
        <div className='mt-1.5 border-t border-gray-100 pt-2.5 space-y-1'>
          {before.isEnabled !== undefined && after.isEnabled !== undefined && before.isEnabled !== after.isEnabled && (
            <DiffRow
              label='Status'
              before={before.isEnabled ? 'ON' : 'OFF'}
              after={after.isEnabled ? 'ON' : 'OFF'}
              render={(b, a) => (
                <>
                  <span className={b === 'ON' ? 'text-green-600' : 'text-red-600'}>{b}</span>
                  <span className='text-gray-300 mx-1'>→</span>
                  <span className={a === 'ON' ? 'text-green-600' : 'text-red-600'}>{a}</span>
                </>
              )}
            />
          )}
          {before.effectiveFrom && after.effectiveFrom && before.effectiveFrom !== after.effectiveFrom && (
            <DiffRow
              label='Effective From'
              before={new Date(before.effectiveFrom).toLocaleDateString()}
              after={new Date(after.effectiveFrom).toLocaleDateString()}
            />
          )}
          {before.notes !== undefined && after.notes !== undefined && before.notes !== after.notes && (
            <DiffRow label='Notes' before={before.notes || '(empty)'} after={after.notes || '(empty)'} />
          )}
          {(before.slabs || after.slabs) && JSON.stringify(before.slabs) !== JSON.stringify(after.slabs) && (
            <SlabDiff before={before.slabs} after={after.slabs} />
          )}
        </div>
      )}
    </div>
  )
}

const AuditLogModal = ({ isOpen, onClose, title, subtitle, entries }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <div className='bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col'>
        <div className='flex items-start justify-between p-5 border-b border-gray-200'>
          <div className='min-w-0 flex-1 pr-4'>
            <h2 className='text-lg font-bold text-gray-900 truncate'>{title || 'Audit Log'}</h2>
            {subtitle && (
              <p className='text-sm text-gray-500 truncate mt-0.5'>{subtitle}</p>
            )}
          </div>
          <button
            type='button'
            onClick={onClose}
            className='text-gray-400 hover:text-gray-700 text-2xl leading-none shrink-0'
            aria-label='Close'
          >
            &times;
          </button>
        </div>

        <div className='p-5 overflow-y-auto flex-1'>
          <p className='text-sm font-semibold text-gray-600 mb-3'>
            Change History ({entries?.length || 0} entries)
          </p>

          {!entries || entries.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-lg'>
              <svg className='w-10 h-10 text-gray-300 mb-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
              <p className='text-sm text-gray-400'>No audit log entries found</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {[...entries].reverse().map((entry, idx) => (
                <AuditLogEntry key={entry._id || idx} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuditLogModal
