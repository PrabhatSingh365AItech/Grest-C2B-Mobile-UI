import React from 'react'

const NoDataMessage = ({ message, subMessage }) => {
  return (
    <div className='m-2 md:m-5 flex justify-center items-center py-10'>
      <div className='text-center'>
        <p className='text-lg text-gray-500 font-medium'>
          {message || 'No data available'}
        </p>
        <p className='text-sm text-gray-400 mt-2'>
          {subMessage || 'Try adjusting your filters or search criteria'}
        </p>
      </div>
    </div>
  )
}

export default NoDataMessage
