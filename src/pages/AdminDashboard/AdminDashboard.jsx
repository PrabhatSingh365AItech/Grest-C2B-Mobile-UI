import React, { useState } from 'react'
import DashboardTable from '../../components/DashboardTable/DashboardTable'
import styles from '../CompanyListingDetails/CompanyListingDetails.module.css'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import { FaDownload } from 'react-icons/fa'
import SideMenu from '../../components/SideMenu'
import AdminNavbar from '../../components/Admin_Navbar'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { BeatLoader } from 'react-spinners'
import { useAdminReport } from './hooks/useAdminReport'
import { formatDateToString } from './utils/dateUtils'

const AdminDashboard = () => {
  const [sideMenu, setsideMenu] = useState(false)
  const {
    tableData,
    isLoading,
    flag,
    searchValue,
    setSearchValue,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    setFromDateDup,
    setToDateDup,
    fetchTableData,
    handleDownload,
    resetFilters,
  } = useAdminReport()

  const handleFromDateChange = (date) => {
    setFromDate(date)
    setFromDateDup(formatDateToString(date))
  }

  const handleToDateChange = (date) => {
    setToDate(date)
    setToDateDup(formatDateToString(date))
  }

  return (
    <div>
      {isLoading && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isLoading}
            size={15}
          />
        </div>
      )}
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>

      <div className='flex gap-2 items-center justify-center mt-5 w-full'>
        <div className={styles.search_bar_wrap}>
          <input
            className='text-sm'
            placeholder='Search...'
            type='text'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <IoMdSearch size={25} onClick={fetchTableData} />
        </div>
        <div className={styles.icons_box}>
          <IoRefresh onClick={resetFilters} size={25} />
        </div>
        <button onClick={handleDownload} className={styles.bulkdown_button}>
          <FaDownload /> Bulk Download
        </button>
        <DatePicker
          onChange={handleFromDateChange}
          selected={fromDate}
          className='mt-1 p-[6px] w-[150px] sm:w-[250px] border rounded-md'
          dateFormat='yyyy-MM-dd'
          placeholderText='Select from date'
          isClearable
        />
        <DatePicker
          onChange={handleToDateChange}
          selected={toDate}
          className='mt-1 p-[6px] w-[150px] sm:w-[250px] border rounded-md'
          dateFormat='yyyy-MM-dd'
          placeholderText='Select to date'
          minDate={fromDate}
          isClearable
        />
      </div>

      {flag && <DashboardTable tableData={tableData} />}
    </div>
  )
}

export default AdminDashboard
