import React, { useEffect, useState } from 'react'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import styles from './QuotesCreatedAdmin.module.css'
import { FaAngleDown, FaDownload } from 'react-icons/fa6'
import { IoRefresh } from 'react-icons/io5'
import { IoMdSearch } from 'react-icons/io'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import NavigateListing from '../../components/NavigateListing/NavigateListing'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'
import QuotesCreatedAdminTable from '../../components/QuotesCreatedAdminTable/QuotesCreatedAdminTable'
import * as XLSX from 'xlsx'
const ALLstore = 'All Stores'
const initDate = '2023-01-01'

const formatDateToISO = (date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0]
}

const SearchBar = ({ searchValue, setSearchValue, getTableData }) => (
  <div className='flex gap-2 mx-2 items-center justify-center outline-none mt-5 w-[100%]'>
    <div className={styles.search_bar_wrap}>
      <input
        onChange={(e) => setSearchValue(e.target.value)}
        className='text-sm'
        type='text'
        value={searchValue}
        placeholder='Search....'
      />
      <IoMdSearch onClick={getTableData} size={25} />
    </div>
  </div>
)

const DateRangePicker = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}) => (
  <>
    <div className='[bg-[#F5F4F9]'>
      <DatePicker
        selected={fromDate}
        onChange={onFromDateChange}
        dateFormat='yyyy-MM-dd'
        className='mt-1 p-[6px] w-[150px] sm:w-[250px] border rounded-md'
        placeholderText='Select from date'
      />
    </div>
    <div>
      <DatePicker
        selected={toDate}
        onChange={onToDateChange}
        dateFormat='yyyy-MM-dd'
        className='mt-1 p-[6px] w-[150px] sm:w-[250px] border rounded-md'
        placeholderText='Select to date'
      />
    </div>
  </>
)

const StoreDropdown = ({
  storeData,
  storeDrop,
  setStoreDrop,
  searchTerm,
  setSearchTerm,
  filteredStores,
  handleSearch,
  handleStoreChange,
}) => (
  <div className='relative w-[250px]'>
    <div
      className={styles.filter_button}
      onClick={() => setStoreDrop(!storeDrop)}
    >
      <p className='truncate'>
        {searchTerm === '' ? 'Select Store' : searchTerm}
      </p>
      <FaAngleDown size={17} className={`${storeDrop && 'rotate-180'}`} />
    </div>
    {storeDrop && (
      <div className='absolute w-full bg-white shadow-md'>
        <input
          type='text'
          onChange={handleSearch}
          className='w-full p-2 border-b border-gray-300'
          placeholder='Search store...'
          value={searchTerm}
        />
        <div
          className={`overflow-y-scroll max-h-[200px] ${styles.filter_drop}`}
        >
          <div
            className={styles.filter_option}
            onClick={() => {
              handleStoreChange({ _id: '', storeName: ALLstore })
              setSearchTerm(ALLstore)
            }}
          >
            <p className='truncate'>{ALLstore}</p>
          </div>
          {filteredStores.length > 0 ? (
            filteredStores.map((item5, index) => (
              <div
                key={index}
                onClick={() => {
                  handleStoreChange(item5)
                  setSearchTerm(item5.storeName)
                  setStoreDrop(false)
                }}
                className={styles.filter_option}
              >
                <p className='truncate'>{item5.storeName}</p>
              </div>
            ))
          ) : (
            <p className='p-2 text-gray-500'>No stores found</p>
          )}
        </div>
      </div>
    )}
  </div>
)

const Pagination = ({ currentPage, setCurrentPage, maxPages }) => (
  <div className='flex justify-center mt-0 mb-4'>
    <button
      onClick={() => setCurrentPage(currentPage - 1)}
      disabled={currentPage === 0}
      className={`mx-2 px-4 py-2 rounded-lg ${
        currentPage === 0
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
          : 'bg-primary text-white cursor-pointer'
      }`}
    >
      Previous
    </button>
    <button
      onClick={() => setCurrentPage(currentPage + 1)}
      disabled={currentPage >= maxPages - 1 || maxPages === 0}
      className={`mx-2 px-4 py-2 rounded-lg ${
        currentPage >= maxPages - 1 || maxPages === 0
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
          : 'bg-primary text-white cursor-pointer'
      }`}
    >
      Next
    </button>
  </div>
)

const downloadExcelQuotesAdminCreated = (apiData) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const formattedData = apiData.map((item) => {
    let questionsKeys = ''
    let index = 1
    console.log(item?.lead?.QNA[0])
    if (item?.lead?.QNA?.[0] && typeof item.lead.QNA[0] === 'object') {
      for (const group in item.lead.QNA[0]) {
        if (Array.isArray(item.lead.QNA[0][group])) {
          item.lead.QNA[0][group].forEach((qna) => {
            questionsKeys += `${index}. ${qna?.quetion} - ${qna?.key}\n`
            index++
          })
        }
      }
    }
    return {
      'Date Created': new Date(item.createdAt).toLocaleDateString('en-IN'),
      'User Name': item.user?.name,
      'Product Name': item.lead?.model?.name,
      'Final Price Offered to Custoemr': item.lead?.price,
      'Unique Id': item.lead?.uniqueCode,
      'Customer Name': item.lead?.name,
      'Phone Number': item.lead?.phoneNumber,
      'Email Id': item.lead?.emailId,
      'Question/Ans': questionsKeys,
    }
  })

  const quotesAdminData = XLSX.utils.json_to_sheet(formattedData)
  const quotesAdminRes = {
    Sheets: { data: quotesAdminData },
    SheetNames: ['data'],
  }
  const excelAdminBuffer = XLSX.write(quotesAdminRes, {
    bookType: 'xlsx',
    type: 'array',
  })

  const dataAdminQuotesCreatedFile = new Blob([excelAdminBuffer], {
    type: fileType,
  })
  saveAs(dataAdminQuotesCreatedFile, 'Quotes_Created' + fileExtension)
}

const fetchDownloadData = (str) => {
  const userToken1 = sessionStorage.getItem('authToken')
  axios
    .get(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/prospects/findAll/quotecreated?fromdate=2020-01-01&todate=${
        new Date().toISOString().split('T')[0]
      }&search=$&store=${str}`,
      {
        headers: {
          authorization: userToken1,
        },
      }
    )
    .then((res) => {
      downloadExcelQuotesAdminCreated(res.data.data.quoteData.data)
    })
    .catch((err) => {
      console.log(err)
    })
}

const getStore = async () => {
  const token = sessionStorage.getItem('authToken')
  const config = {
    method: 'get',
    url: `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/store/findAll?page=0&limit=9999`,
    headers: { Authorization: token },
  }
  let storeNamesArr = []
  await axios
    .request(config)
    .then((response) => {
      storeNamesArr = response.data.result.map((store1) => ({
        storeName: store1.storeName,
        _id: store1._id,
      }))
    })
    .catch((error) => {
      console.log(error)
    })
  return storeNamesArr
}

const QuotesCreatedAdmin = () => {
  const userToken = sessionStorage.getItem('authToken')
  const [sideMenu, setsideMenu] = useState(false)
  const [tableData, setTableData] = useState()
  const [isTableLoaded, setIsTableLoaded] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [storeData, setStoreData] = useState([])
  const [storeName, setStoreName] = useState(ALLstore)
  const [storeDrop, setStoreDrop] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [toDate, setToDate] = useState(null)
  const [fromDate, setFromDate] = useState(null)
  const [filFlag, setFilFlag] = useState(true)
  const [fromDateDup, setFromDateDup] = useState(initDate)
  const [toDateDup, setToDateDup] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStores, setFilteredStores] = useState(storeData)
  const [currentPage, setCurrentPage] = useState(0)
  const [maxPages, setMaxPages] = useState(0)
  const pageLimit = 10
  const getTableData = () => {
    setIsTableLoaded(true)
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll/quotecreated?page=${currentPage}&limit=${pageLimit}&fromdate=${fromDateDup}&todate=${toDateDup}&search=${searchValue}&store=${storeId}`,
        { headers: { authorization: userToken } }
      )
      .then((res) => {
        setTableData(res.data.data.quoteData.data)
        const total = res.data.data.quoteData.count || 0
        setMaxPages(Math.ceil(total / pageLimit))
        setIsTableLoaded(false)
      })
      .catch((err) => {
        console.log('error', err)
        setIsTableLoaded(false)
      })
  }
  useEffect(() => {
    getTableData()
  }, [storeId, fromDateDup, toDateDup, filFlag, currentPage])
  const saveStore = async () => {
    const temparr = await getStore()
    setStoreData(temparr)
    setFilteredStores(temparr)
  }
  useEffect(() => {
    saveStore()
  }, [])
  const handleSearchClear = () => {
    setSearchValue('')
    setStoreId('')
    setStoreName(ALLstore)
    setToDate('')
    setToDateDup(new Date().toISOString().split('T')[0])
    setFromDate('')
    setFromDateDup(initDate)
    setFilFlag(!filFlag)
  }
  useEffect(() => {
    if (
      searchValue === '' &&
      storeName === ALLstore &&
      storeId === '' &&
      fromDateDup === initDate
    ) {
      getTableData()
    }
  }, [searchValue, storeName, storeId, fromDateDup])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value === '') {
      setFilteredStores(storeData)
    } else {
      const filtered = storeData.filter((store) =>
        store.storeName.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredStores(filtered)
    }
  }
  const handleStoreChange = (value) => {
    setStoreDrop(false)
    setStoreName(value.storeName)
    setStoreId(value._id)
  }
  const handleFromDateChange = (date) => {
    if (date !== null) {
      setFromDate(date)
      setFromDateDup(formatDateToISO(date))
    }
  }
  const handleToDateChange = (date) => {
    if (date !== null) {
      setToDate(date)
      setToDateDup(formatDateToISO(date))
    }
  }
  return (
    <div>
      {isTableLoaded && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isTableLoaded}
            size={15}
          />
        </div>
      )}
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <NavigateListing />
      <div className='flex gap-2 mx-2 items-center justify-center outline-none mt-5 w-[100%]'>
        <div className={styles.search_bar_wrap}>
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            className='text-sm'
            type='text'
            value={searchValue}
            placeholder='Search....'
          />
          <IoMdSearch onClick={getTableData} size={25} />
        </div>
        <div className={styles.icons_box}>
          <IoRefresh onClick={handleSearchClear} size={25} />
        </div>
        <button
          className={styles.bulkdown_button}
          onClick={() => fetchDownloadData(storeId)}
        >
          <FaDownload />
          Bulk Download
        </button>
        <DateRangePicker
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={handleFromDateChange}
          onToDateChange={handleToDateChange}
        />
        {storeData && storeData.length > 0 && (
          <StoreDropdown
            storeData={storeData}
            storeDrop={storeDrop}
            setStoreDrop={setStoreDrop}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredStores={filteredStores}
            handleSearch={handleSearch}
            handleStoreChange={handleStoreChange}
          />
        )}
      </div>
      <QuotesCreatedAdminTable
        tableData={tableData}
        currentPage={currentPage}
      />
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        maxPages={maxPages}
      />
    </div>
  )
}

export default QuotesCreatedAdmin
