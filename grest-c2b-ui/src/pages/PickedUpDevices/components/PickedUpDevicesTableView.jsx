import React from 'react'
import { TABLE_CELL_BASE, TABLE_CELL_CENTER } from '../constants'

const renderTableRow = (val, index, renderActionCell) => (
  <tr key={index} className={index % 2 === 0 ? 'bg-gray-200' : ''}>
    {renderActionCell(val)}
    <td className={TABLE_CELL_CENTER}>{val?.status}</td>
    <td className={TABLE_CELL_CENTER}>
      {new Date(val.createdAt).toLocaleDateString('en-GB')}
    </td>
    <td className={TABLE_CELL_CENTER}>{val?.uniqueCode || val?._id}</td>
    <td className={TABLE_CELL_CENTER}>{val?.totalDevice}</td>
    <td className={TABLE_CELL_CENTER}>{val?.totalAmount}</td>
    <td className={TABLE_CELL_CENTER}>{val?.remarks || ''}</td>
    <td className={TABLE_CELL_CENTER}>{val?.location || ''}</td>
  </tr>
)

const PickedUpDevicesTableView = ({ data, renderActionCell }) => {
  return (
    <table className='w-full border border-primary'>
      <thead className='bg-primary text-white'>
        <tr>
          <th className={TABLE_CELL_BASE}>Action</th>
          <th className={TABLE_CELL_BASE}>Status</th>
          <th className={TABLE_CELL_BASE}>Date</th>
          <th className={TABLE_CELL_BASE}>Lot Number</th>
          <th className={TABLE_CELL_BASE}>Number Of Device</th>
          <th className={TABLE_CELL_BASE}>Amount</th>
          <th className={TABLE_CELL_BASE}>Reason</th>
          <th className={TABLE_CELL_BASE}>Location</th>
        </tr>
      </thead>
      <tbody>
        {data.map((val, index) => renderTableRow(val, index, renderActionCell))}
      </tbody>
    </table>
  )
}

export default PickedUpDevicesTableView
