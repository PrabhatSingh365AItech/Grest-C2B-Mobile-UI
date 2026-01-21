import React, { useCallback, useEffect, useState } from 'react'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import TechnicianWiseTable from '../../components/TechnicianWiseTable/TechnicianWiseTable'
import styles from './TechnicianWiseReport.module.css'
import { IoRefresh } from 'react-icons/io5'
import { IoMdSearch } from 'react-icons/io'
import { FaDownload } from 'react-icons/fa'
import axios from 'axios'
import * as XLSX from 'xlsx'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { BeatLoader } from 'react-spinners'

const TechnicianWiseReport = () => {
  const [sideMenu, setsideMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [toDate, setToDate] = useState(null)
  const [fromDate, setFromDate] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [fromDateDup, setFromDateDup] = useState(null)
  const [toDateDup, setToDateDup] = useState(null)
  const LoggedInUser = JSON.parse(sessionStorage.getItem('profile'))
  const isSuperAdmin = LoggedInUser?.role === 'Super Admin'

  const getTableData = () => {
    setLoading(true)
    const userToken = sessionStorage.getItem('authToken')
    const queryParams = new URLSearchParams()
    if (isSuperAdmin && searchValue !== null) {
      queryParams.append('search', searchValue)
    }
    if (toDate !== null) {
      queryParams.append('todate', toDateDup)
    }
    if (fromDate !== null) {
      queryParams.append('fromdate', fromDateDup)
    }
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/pickupDevices/technicianReport?&${queryParams.toString()}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        setTableData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    getTableData()
  }, [toDateDup, fromDateDup])

  const downloadExcelTechnicianWiseReport = (apiData) => {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const fileExtension = '.xlsx'
    const formattedData = apiData.map((item) => {
      return {
        Date: reverseDate(item?.date),
        Location: item.store?.storeName,
        Technician: item.user?.name,
        'No. of Devices Picked': item.totalDevice,
      }
    })

    const wsTechnicianWiseReport = XLSX.utils.json_to_sheet(formattedData)
    const wbTechnicianWiseReport = {
      Sheets: { data: wsTechnicianWiseReport },
      SheetNames: ['data'],
    }
    const excelBufferTechnicianWiseReport = XLSX.write(wbTechnicianWiseReport, {
      bookType: 'xlsx',
      type: 'array',
    })

    const dataFileTechnicianWiseReport = new Blob(
      [excelBufferTechnicianWiseReport],
      {
        type: fileType,
      }
    )
    saveAs(dataFileTechnicianWiseReport, 'Techninician_Report' + fileExtension)
  }

  const fetchTechnicianDownloadData = () => {
    const userToken = sessionStorage.getItem('authToken')
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/pickupDevices/technicianReport`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        downloadExcelTechnicianWiseReport(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleSearchClick = () => {
    getTableData()
  }

  const handleFromDateChange = (date) => {
    if (date !== null) {
      setFromDate(date)
      const formatDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]
      setFromDateDup(formatDate)
    }
  }
  const handleToDateChange = (date) => {
    if (date !== null) {
      setToDate(date)
      const formatDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]
      setToDateDup(formatDate)
    }
  }
  function reverseDate(itemDate) {
    if (!itemDate) {
      return 'N/A'
    }
    const dateArr = itemDate.split('-')
    return dateArr.reverse().join('-')
  }
  const handleSearchClear = useCallback(() => {
    setSearchValue('')
    setToDate('')
    setToDateDup('')
    setFromDate('')
    setFromDateDup('')
    getTableData()
  }, [])

  return (
    <div>
      {loading && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={loading}
            size={15}
          />
        </div>
      )}
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <div className='flex gap-2 items-center justify-center outline-none mt-5 w-[100%]'>
        <div className={`${styles.search_bar_wrap} `}>
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            className='text-sm'
            type='text'
            placeholder='Search...'
            value={searchValue}
          />
          <IoMdSearch
            onClick={handleSearchClick}
            className='cursor-pointer'
            size={25}
          />
        </div>
        <div className={`${styles.icons_box} cursor-pointer`}>
          <IoRefresh onClick={handleSearchClear} className='' size={25} />
        </div>
        <button
          className={`${styles.bulkdown_button}`}
          onClick={fetchTechnicianDownloadData}
        >
          <FaDownload /> Bulk Download
        </button>
        <div className='[bg-[#F5F4F9]'>
          <DatePicker
            selected={fromDate}
            onChange={handleFromDateChange}
            dateFormat='yyyy-MM-dd'
            className={` mt-1 p-[6px] w-[150px] sm:w-[250px] border rounded-md`}
            placeholderText='Select from date'
          />
        </div>
        <div>
          <DatePicker
            selected={toDate}
            onChange={handleToDateChange}
            dateFormat='yyyy-MM-dd'
            className='mt-1 p-[6px] w-[150px] sm:w-[250px] border rounded-md'
            placeholderText='Select to date'
          />
        </div>
      </div>
      <div className='flex justify-center min-w-[50%] '>
        <TechnicianWiseTable tableData={tableData} />
      </div>
    </div>
  )
}

export default TechnicianWiseReport
