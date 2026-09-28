import React from 'react'

const PAGE_SIZE = 10

const PaginationControls = ({ currentPage, setCurrentPage, totalCount }) => {
  return (
    <div className='flex justify-center my-4'>
      <button
        disabled={currentPage === 0}
        onClick={() => setCurrentPage((p) => p - 1)}
        className={`mx-2 px-4 py-2 rounded-lg ${
          currentPage === 0
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-primary text-white'
        }`}
      >
        Previous
      </button>
      <button
        disabled={currentPage >= Math.ceil((totalCount || 0) / PAGE_SIZE) - 1}
        onClick={() => setCurrentPage((p) => p + 1)}
        className={`mx-2 px-4 py-2 rounded-lg ${
          currentPage >= Math.ceil((totalCount || 0) / PAGE_SIZE) - 1
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-primary text-white'
        }`}
      >
        Next
      </button>
    </div>
  )
}

export default PaginationControls
