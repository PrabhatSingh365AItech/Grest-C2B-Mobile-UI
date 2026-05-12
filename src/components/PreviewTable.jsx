import React from 'react'

const PreviewTable = ({ headers, data }) => {
  if (!data.length) {
    return null
  }

  return (
    <div className='mt-6'>
      <h4 className='font-semibold text-gray-700 mb-2'>
        File Preview ({data.length} rows)
      </h4>

      <div className='overflow-x-auto border border-primary rounded-lg max-h-96 overflow-y-auto'>
        <table className='w-full text-sm text-left'>
          <thead className='bg-primary text-white sticky top-0'>
            <tr>
              {headers.map((header, index) => (
                <th key={index} className='p-2 md:p-3 font-medium'>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white'>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className='p-2 md:p-3 text-gray-700 truncate max-w-xs'
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PreviewTable
