import React from 'react'
const TechnicianWiseTable = ({ tableData }) => {
  function reverseDate(itemDate) {
    const dateArr = itemDate.split('-')
    return dateArr.reverse().join('-')
  }
  return (
    <div className=''>
      <div className='m-2 w-full  md:m-5 '>
        <table className='border border-primary w-[130vh]'>
          <thead className='bg-primary text-white'>
            <tr className=''>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base  '>
                Date
              </th>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base '>
                Location
              </th>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base '>
                Technician
              </th>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base '>
                No. Of Devices Picked
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr className={index % 2 === 0 ? 'bg-gray-200' : ''} key={index}>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {reverseDate(item?.date)}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {item.store?.storeName}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {item.user?.firstName} {item.user?.lastName}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {item.totalDevice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TechnicianWiseTable
