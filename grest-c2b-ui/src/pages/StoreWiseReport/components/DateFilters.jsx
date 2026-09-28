import React from 'react'
import DatePicker from 'react-datepicker'

const DateFilters = ({
  fromDate,
  handleFromDateChange,
  toDate,
  handleToDateChange,
}) => (
  <>
    <div className='w-[15%]'>
      <DatePicker
        selected={fromDate}
        onChange={handleFromDateChange}
        dateFormat='yyyy-MM-dd'
        className='outline-none p-2 w-[100%] border rounded-md text-sm text-center'
        placeholderText='Select from date'
      />
    </div>
    <div className='w-[15%]'>
      <DatePicker
        selected={toDate}
        onChange={handleToDateChange}
        dateFormat='yyyy-MM-dd'
        className='outline-none p-2 w-[100%] border rounded-md text-sm text-center'
        placeholderText='Select to date'
      />
    </div>
  </>
)

export default DateFilters
