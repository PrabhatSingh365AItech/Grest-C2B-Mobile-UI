import React from 'react'
import { IoClose } from 'react-icons/io5'

const LABELS = {
  category: 'Category',
  company: 'Company',
  store: 'Store',
  brand: 'Brand',
  model: 'Model',
  grade: 'Grade',
  staff: 'Staff',
  stage: 'Stage',
}

const FocusChips = ({ focus, onClear }) => {
  const active = Object.entries(focus).filter(([, f]) => f)
  if (!active.length) {
    return (
      <p className='text-xs text-gray-500'>
        Tip: click any row below to focus the whole dashboard on it.
      </p>
    )
  }
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <span className='text-xs text-gray-500'>Focused on:</span>
      {active.map(([dim, f]) => (
        <span
          key={dim}
          className='inline-flex items-center gap-1 text-sm bg-blue-50 text-blue-900 border border-blue-200 rounded-full pl-3 pr-1 py-0.5'
        >
          <span className='text-blue-700 text-xs'>{LABELS[dim]}:</span>
          <span className='max-w-[200px] truncate'>{f.label}</span>
          <button
            type='button'
            aria-label={`Remove ${LABELS[dim]} filter`}
            onClick={() => onClear(dim)}
            className='rounded-full p-0.5 hover:bg-blue-100'
          >
            <IoClose size={14} />
          </button>
        </span>
      ))}
      {active.length > 1 && (
        <button
          type='button'
          onClick={() => onClear()}
          className='text-xs font-medium text-primary hover:underline'
        >
          Clear all
        </button>
      )}
    </div>
  )
}

export default FocusChips
