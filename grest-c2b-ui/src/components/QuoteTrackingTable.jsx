import React from 'react'
import { FaEye } from 'react-icons/fa'
import NoDataMessage from './NoDataMessage'

const QuoteTrackingTable = ({
  data,
  pagination,
  onPageChange,
  onViewActivity,
}) => {
  if (!data || data.length === 0) {
    return <NoDataMessage />
  }

  const { currentPage, totalPages, totalRecords } = pagination
  const limit = 10
  return (
    <div className='m-2 md:m-5'>
      <div className='overflow-x-auto border border-gray-300 rounded-md'>
        <table className='w-full'>
          <thead className='bg-primary text-white'>
            <tr className='align-top'>
              <th className='px-4 py-2 text-sm font-medium text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                S.No.
              </th>
              <th className='px-4 py-2 text-sm font-medium text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                User ID
              </th>
              <th className='px-4 py-2 text-sm font-medium text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                Role
              </th>
              <th className='px-4 py-2 text-sm font-medium text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                Store Name
              </th>
              <th className='px-4 py-2 text-sm font-medium text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                Total Quotes Count
              </th>
              <th className='px-4 py-2 text-sm font-medium text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                Quick Quotes
              </th>
              <th className='px-4 py-2 text-sm font-medium text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                Sum of all Quote Amounts
              </th>
              <th className='px-4 py-2 text-sm font-medium text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                Last Activity
              </th>
              <th className='px-4 py-2 text-sm font-medium text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                Device Name
              </th>
              <th className='px-4 py-2 text-sm font-medium text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                Brand
              </th>
              <th className='px-4 py-2 text-sm font-medium text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                Device Details
              </th>
              <th className='px-4 py-2 text-sm font-medium text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                View Activity Log
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.userId + index}
                className={index % 2 === 0 ? 'bg-gray-200' : 'bg-white'}
              >
                <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {(currentPage - 1) * limit + index + 1}
                </td>
                <td className='px-4 py-2 text-sm text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {row.email}
                </td>
                <td className='px-4 py-2 text-sm text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {row.role}
                </td>
                <td className='px-4 py-2 text-sm text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {row.storeName || '-'}
                </td>
                <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {row.totalQuotes}
                </td>
                <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {row.totalQuickQuotes}
                </td>
                <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  ₹{row.sumOfAllQuotes.toLocaleString('en-IN')}
                </td>
                <td className='px-4 py-2 text-sm text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {new Date(row.lastActivityDate).toLocaleString('en-IN')}
                </td>
                <td className='px-4 py-2 text-sm text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {row.deviceNameAndCategory || 'N/A'}
                </td>
                <td className='px-4 py-2 text-sm text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {row.brand || 'N/A'}
                </td>
                <td className='px-4 py-2 text-sm text-left md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  {`RAM: ${row.deviceDetails?.ram || 'N/A'}, ROM: ${
                    row.deviceDetails?.rom || 'N/A'
                  }`}
                </td>
                <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
                  <h
                    onClick={() => onViewActivity(row)}
                    className={`flex cursor-pointer items-center gap-2 px-2 py-1 text-md text-primary 
  rounded-lg hover:bg-opacity-90 focus:ring-2 focus:outline-none focus:ring-purple-300`}
                  >
                    <FaEye />
                    <span>View Log</span>
                  </h>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='flex justify-center items-center mt-4'>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === 1
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer'
          }`}
        >
          Previous
        </button>
        <span className='mx-4'>
          Page {currentPage} of {totalPages} (Total: {totalRecords})
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default QuoteTrackingTable
