import React from 'react'
import { FaDownload } from 'react-icons/fa'

const Panel = ({ title, subtitle, action, onDownload, children, className = '' }) => (
  <section
    className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 flex flex-col min-w-0 ${className}`}
  >
    <header className='flex items-start justify-between gap-3 mb-4'>
      <div className='min-w-0'>
        <h2 className='text-base font-semibold text-gray-900'>{title}</h2>
        {subtitle && <p className='text-xs text-gray-500 mt-0.5'>{subtitle}</p>}
      </div>
      <div className='flex items-center gap-2 shrink-0'>
        {action}
        {onDownload && (
          <button
            type='button'
            onClick={onDownload}
            title={`Download ${title} as Excel`}
            className='flex items-center gap-1.5 text-xs font-medium text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50'
          >
            <FaDownload size={11} />
            Download
          </button>
        )}
      </div>
    </header>
    {children}
  </section>
)

export const EmptyState = ({ text = 'No purchases in this view' }) => (
  <div className='flex-1 flex items-center justify-center py-10 text-sm text-gray-400'>
    {text}
  </div>
)

export default Panel
