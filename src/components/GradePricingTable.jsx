import React from 'react'

const GradePricingTable = ({ deviceCategory, tableData }) => {
  const gradeColumns = [
    { key: 'A_PLUS', display: 'A+', percentage: '(0.00%)' },
    { key: 'A', display: 'A', percentage: '(10.00%)' },
    { key: 'A_MINUS', display: 'A-', percentage: '(12.00%)' },
    { key: 'A_MINUS_LIMITED', display: 'A-Limited', percentage: '(15.00%)' },
    { key: 'B_PLUS', display: 'B+', percentage: '(18.00%)' },
    { key: 'B', display: 'B', percentage: '(20.00%)' },
    { key: 'B_MINUS', display: 'B-', percentage: '(25.00%)' },
    { key: 'B_MINUS_LIMITED', display: 'B-Limited', percentage: '(30.00%)' },
    { key: 'C_PLUS', display: 'C+', percentage: '(40.00%)' },
    { key: 'C', display: 'C', percentage: '(50.00%)' },
    { key: 'C_MINUS', display: 'C-', percentage: '(60.00%)' },
    { key: 'C_MINUS_LIMITED', display: 'C-Limited', percentage: '(65.00%)' },
    { key: 'D_PLUS', display: 'D+', percentage: '(70.00%)' },
    { key: 'D', display: 'D', percentage: '(75.00%)' },
    { key: 'D_MINUS', display: 'D-', percentage: '(80.00%)' },
    { key: 'E', display: 'E', percentage: '(90.00%)' },
  ]

  // Determine which grade columns have data - only show A+ column
  const availableGradeColumns = gradeColumns.filter((column) =>
    column.key === 'A_PLUS'
  )

  return (
    <div className='m-2  w-[90%] md:m-5 overflow-x-auto'>
      <div className='min-w-full'>
        <table className='w-full border border-primary'>
          <thead className='bg-primary text-white'>
            <tr>
              <th className='p-2 text-sm md:p-3 md:text-base'>Model Details</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Brand</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Updated At</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Storage</th>
              {availableGradeColumns.map((column) => (
                <th
                  key={column.key}
                  className='p-2 text-sm md:p-3 md:text-base'
                >
                  <p>{column.display}</p>
                  <p>{column.percentage}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((listItem, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-200' : ''}>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {listItem.model?.name}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {listItem.model.name.split(' ')[0]}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {new Date(listItem.updatedAt).toLocaleDateString('en-GB')}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {listItem.storage}
                </td>
                {availableGradeColumns.map((column) => (
                  <td
                    key={column.key}
                    className='p-2 text-sm text-center md:p-3 md:text-base'
                  >
                    {listItem.grades?.[column.key] || '-'}
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

export default GradePricingTable
