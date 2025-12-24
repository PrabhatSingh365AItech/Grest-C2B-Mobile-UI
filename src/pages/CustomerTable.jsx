import React, { useEffect, useState } from 'react'
import UserTable from '../components/UserTable'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { BeatLoader } from 'react-spinners'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import NavigateListing from '../components/NavigateListing/NavigateListing'
import { FaAngleDown, FaDownload } from 'react-icons/fa'
import styles from './CompanyListingDetails/CompanyListingDetails.module.css'
import * as XLSX from 'xlsx'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import styless from '../pages/QuotesCreatedAdmin/QuotesCreatedAdmin.module.css'
import { saveAs } from 'file-saver' // make sure file-saver is installed

const ALL_STORES = 'All Stores'
const iniDate = '2023-01-01'
const salesPageSize = 10

const getStore = async () => {
  const token = sessionStorage.getItem('authToken')
  try {
    const res = await axios.get(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/findAll?page=0&limit=9999`,
      { headers: { Authorization: token } }
    )
    return res.data.result.map((s) => ({ storeName: s.storeName, _id: s._id }))
  } catch (err) {
    console.log(err)
    return []
  }
}

const formatDate = (date) =>
  date
    ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0]
    : ''

const fetchTableData = async ({
  page,
  limit,
  toDate,
  fromDate,
  search,
  storeId,
}) => {
  const userToken = sessionStorage.getItem('authToken')
  return axios.get(
    `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/prospects/findAll/ordercreated?page=${page}&limit=${limit}&todate=${toDate}&fromdate=${fromDate}&search=${search}&store=${storeId}`,
    { headers: { authorization: userToken } }
  )
}

const formatDownloadData = (apiData) =>
  apiData.map((ele) => {
    let index = 1
    let questions = ''

    if (ele?.lead?.QNA?.[0] && typeof ele.lead.QNA[0] === 'object') {
      for (const grp in ele.lead.QNA[0]) {
        if (Array.isArray(ele.lead.QNA[0][grp])) {
          ele.lead.QNA[0][grp].forEach((q) => {
            questions += `${index}. ${q?.quetion} - ${q?.key}\n`
            index++
          })
        }
      }
    }

    return {
      'Date Created': new Date(ele?.createdAt).toLocaleDateString('en-IN'),
      'User Name': ele?.user?.name,
      category: ele?.categoryInfo?.categoryName,
      'Product Name': ele?.lead?.model?.name,
      Variant: ele?.lead?.storage,
      Price: ele?.lead?.actualPrice,
      'Final Price Offered to Customer': ele?.lead?.price,
      'Unique Id': ele?.lead?.uniqueCode,
      'Customer Name': ele?.lead?.name,
      'Phone Number': ele?.lead?.phoneNumber,
      'Email Id': ele?.lead?.emailId,
      'Question/Ans': questions,
    }
  })

const downloadExcelCustomerTable = (apiData) => {
  const ws = XLSX.utils.json_to_sheet(formatDownloadData(apiData))
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  })
  saveAs(file, 'Leads_Created.xlsx')
}

const fetchDownloadData = async (
  toDateDup,
  fromDateDup,
  search,
  selStoreId,
  totalCount,
  setDownloading
) => {
  setDownloading(true)
  const userToken = sessionStorage.getItem('authToken')

  try {
    const res = await axios.get(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/prospects/findAll/ordercreated?page=0&limit=${
        totalCount || 9999
      }&todate=${toDateDup}&fromdate=${fromDateDup}&search=${search}&store=${selStoreId}`,
      { headers: { authorization: userToken } }
    )
    downloadExcelCustomerTable(res.data.data.orderData.data)
  } catch (err) {
    console.log(err)
  }
  setDownloading(false)
}

const filterStores = (stores, keyword) =>
  keyword
    ? stores.filter((s) =>
        s.storeName.toLowerCase().includes(keyword.toLowerCase())
      )
    : stores

const TopFilterBar = ({
  search,
  setSearch,
  loadTable,
  handleSearchClear,
  downloading,
  onDownload,
  toDateDup,
  fromDateDup,
  selStoreId,
  totalCount,
  setDownloading,

  fromDate,
  setFromDate,
  toDate,
  setToDate,
  setFromDateDup,
  setToDateDup,

  storeData,
  storeDrop,
  setStoreDrop,
  storeName,
  setStoreName,
  setSelStoreId,
  searchTerm,
  setSearchTerm,
  filteredStores,
  handleSearchStore,
}) => {
  return (
    <div className='flex gap-2 items-center justify-center mt-5'>
      {/* Search */}
      <div className={styles.search_bar_wrap}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='text-sm'
          placeholder='Search...'
        />
        <IoMdSearch size={25} onClick={loadTable} />
      </div>

      {/* Refresh */}
      <div className={styles.icons_box}>
        <IoRefresh size={25} onClick={handleSearchClear} />
      </div>

      {/* Download */}
      <button
        disabled={downloading}
        onClick={() =>
          onDownload(
            toDateDup,
            fromDateDup,
            search,
            selStoreId,
            totalCount,
            setDownloading
          )
        }
        className={styles.bulkdown_button}
      >
        {downloading ? (
          <>
            <BeatLoader color='white' size={8} /> Downloading...
          </>
        ) : (
          <>
            <FaDownload /> Bulk Download
          </>
        )}
      </button>

      {/* From date */}
      <DatePicker
        selected={fromDate}
        onChange={(d) => {
          setFromDate(d)
          setFromDateDup(formatDate(d))
        }}
        dateFormat='yyyy-MM-dd'
        className='py-[6px] px-[15px] border rounded-md'
        placeholderText='Select from date'
      />

      {/* To date */}
      <DatePicker
        selected={toDate}
        onChange={(d) => {
          setToDate(d)
          setToDateDup(formatDate(d))
        }}
        dateFormat='yyyy-MM-dd'
        className='py-[6px] px-[15px] border rounded-md'
        placeholderText='Select to date'
      />

      {/* Store Dropdown */}
      {storeData.length > 1 && (
        <div className='relative w-[250px]'>
          <div
            className={styless.filter_button}
            onClick={() => setStoreDrop(!storeDrop)}
          >
            <p className='truncate'>
              {storeName === ALL_STORES ? 'Select Store' : storeName}
            </p>
            <FaAngleDown size={17} className={storeDrop ? 'rotate-180' : ''} />
          </div>

          {storeDrop && (
            <div className='absolute w-full bg-white shadow-md'>
              <input
                value={searchTerm}
                onChange={handleSearchStore}
                className='w-full p-2 border-b'
                placeholder='Search store...'
              />

              <div
                className={`${styless.filter_drop} max-h-[200px] overflow-y-scroll`}
              >
                <div
                  className={styles.filter_option}
                  onClick={() => {
                    setSelStoreId('')
                    setStoreName(ALL_STORES)
                    setSearchTerm('')
                    setStoreDrop(false)
                  }}
                >
                  {ALL_STORES}
                </div>

                {filteredStores.length ? (
                  filteredStores.map((s, i) => (
                    <div
                      key={i}
                      className={styles.filter_option}
                      onClick={() => {
                        setSelStoreId(s._id)
                        setStoreName(s.storeName)
                        setSearchTerm(s.storeName)
                        setStoreDrop(false)
                      }}
                    >
                      {s.storeName}
                    </div>
                  ))
                ) : (
                  <p className='p-2 text-gray-500'>No stores found</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const CustomerTable = () => {
  const [tableDataDup, setTableDataDup] = useState([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [sideMenu, setsideMenu] = useState(false)

  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const [fromDateDup, setFromDateDup] = useState(iniDate)
  const [toDateDup, setToDateDup] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [storeDrop, setStoreDrop] = useState(false)
  const [storeName, setStoreName] = useState(ALL_STORES)
  const [selStoreId, setSelStoreId] = useState('')
  const [storeData, setStoreData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStores, setFilteredStores] = useState([])

  const [currentPage, setCurrentPage] = useState(0)
  const [maxPages, setMaxPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  /* Load stores */
  useEffect(() => {
    getStore().then((data) => {
      setStoreData(data)
      setFilteredStores(data)
    })
  }, [])

  /* Fetch table data */
  const loadTable = async () => {
    setLoading(true)
    try {
      const res = await fetchTableData({
        page: currentPage,
        limit: salesPageSize,
        toDate: toDateDup,
        fromDate: fromDateDup,
        search,
        storeId: selStoreId,
      })

      const r = res.data.data.orderData
      setTableDataDup(r.data)
      setTotalCount(r.count || 0)
      setMaxPages(Math.ceil((r.count || 0) / salesPageSize))
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTable()
  }, [toDate, fromDate, selStoreId, currentPage])

  /* Search clear */
  const handleSearchClear = () => {
    setSearch('')
    setStoreName(ALL_STORES)
    setSelStoreId('')
    setFromDate('')
    setFromDateDup(iniDate)
    setToDate('')
    setToDateDup(new Date().toISOString().split('T')[0])
    loadTable()
  }

  /* Store dropdown search */
  const handleSearchStore = (e) => {
    const v = e.target.value
    setSearchTerm(v)
    setFilteredStores(filterStores(storeData, v))
  }

  return (
    <div>
      {loading && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <BeatLoader color='var(--primary-color)' size={15} />
        </div>
      )}

      <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
      <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      <NavigateListing />

      {/* TOP FILTER BAR (now component) */}
      <TopFilterBar
        search={search}
        setSearch={setSearch}
        loadTable={loadTable}
        handleSearchClear={handleSearchClear}
        downloading={downloading}
        onDownload={fetchDownloadData}
        toDateDup={toDateDup}
        fromDateDup={fromDateDup}
        selStoreId={selStoreId}
        totalCount={totalCount}
        setDownloading={setDownloading}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        setFromDateDup={setFromDateDup}
        setToDateDup={setToDateDup}
        storeData={storeData}
        storeDrop={storeDrop}
        setStoreDrop={setStoreDrop}
        storeName={storeName}
        setStoreName={setStoreName}
        setSelStoreId={setSelStoreId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredStores={filteredStores}
        handleSearchStore={handleSearchStore}
      />

      <UserTable data={tableDataDup} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        maxPages={maxPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  )
}

export default CustomerTable

const Pagination = ({ currentPage, maxPages, setCurrentPage }) => {
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
        disabled={currentPage >= maxPages - 1}
        onClick={() => setCurrentPage((p) => p + 1)}
        className={`mx-2 px-4 py-2 rounded-lg ${
          currentPage >= maxPages - 1
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-primary text-white'
        }`}
      >
        Next
      </button>
    </div>
  )
}
