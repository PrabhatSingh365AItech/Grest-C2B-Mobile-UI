import React from 'react'

const PickupAvail = 'Available For Pickup'

const StatusSelector = ({
  selectedStatus,
  handleStatusUpdate,
  confHandler,
}) => (
  <div className='mx-2 flex gap-2'>
    <select
      className='border-2 w-1/2 outline-none border-primary bg-primary text-white text-[12px] px-4 py-2 rounded'
      value={selectedStatus}
      onChange={handleStatusUpdate}
    >
      <option value=''>Status</option>
      <option value={PickupAvail}>Available For Pickup</option>
      <option value='QC Done'>QC Done</option>
      <option value='Pending in QC'>Pending in QC</option>
      <option value='On Hold'>On Hold</option>
      <option value='Cancelled'>Cancelled</option>
    </select>
    <button
      onClick={confHandler}
      className='border-2 w-1/2 border-primary bg-primary text-white text-[12px] px-4 py-2 rounded'
    >
      Request For Payment
    </button>
  </div>
)

export default StatusSelector
