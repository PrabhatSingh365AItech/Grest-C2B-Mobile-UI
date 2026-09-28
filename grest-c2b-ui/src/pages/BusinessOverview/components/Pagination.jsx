import React from 'react'
import { formatCount } from '../utils/format'

const Pagination = ({ page, pageCount, total, onChange, noun = 'rows' }) => {
  if (pageCount <= 1) {
    return null
  }
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 mt-1'>
      <span className='whitespace-nowrap'>
        {formatCount(total)} {noun} · {page + 1}/{pageCount}
      </span>
      <div className='flex gap-2'>
        <button
          type='button'
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className='px-3 py-1 rounded border border-gray-300 disabled:opacity-40'
        >
          Prev
        </button>
        <button
          type='button'
          disabled={page >= pageCount - 1}
          onClick={() => onChange(page + 1)}
          className='px-3 py-1 rounded border border-gray-300 disabled:opacity-40'
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination
