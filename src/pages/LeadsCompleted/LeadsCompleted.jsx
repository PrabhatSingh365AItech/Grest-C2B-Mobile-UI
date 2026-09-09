import React, { useEffect, useState, useSyncExternalStore } from 'react'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import { BeatLoader } from 'react-spinners'
import styles from '../CompanyListingDetails/CompanyListingDetails.module.css'
import axios from 'axios'
import LeadsCompletedTable from '../../components/LeadsCompletedTable/LeadsCompletedTable'
import DatePicker from 'react-datepicker'
import { FaDownload, FaAngleDown } from 'react-icons/fa'
import NavigateListing from '../../components/NavigateListing/NavigateListing'
import styless from '../QuotesCreatedAdmin/QuotesCreatedAdmin.module.css'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import ReactDOMServer from 'react-dom/server'
import html2pdf from 'html2pdf.js'
import PurchaseReceipt from '../../components/PurchaseReceipt'
import { fetchSignatureAsBase64 } from '../../utils/fetchSignatureAsBase64'
import { leadDownloadManager } from '../../utils/leadDownloadManager'
const pageLimit = 10
const ALLstore = 'All Stores'
const iniDate = '2023-01-01'

const getStore = async () => {
  let storeNamesArray = []
  const token = sessionStorage.getItem('authToken')
  const config = {
    method: 'get',
    url: `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/store/findAll?page=0&limit=9999`,
    headers: { Authorization: token },
  }
  await axios
    .request(config)
    .then((response) => {
      console.log(response.data.result)
      storeNamesArray = response.data.result.map((store1) => ({
        storeName: store1.storeName,
        _id: store1._id,
      }))
      console.log(storeNamesArray)
    })
    .catch((error) => {
      console.log(error)
    })
  return storeNamesArray
}

const handleBulkDownloadReceipts = async (fromDate, toDate, tableData) => {
  if (!fromDate || !toDate) {
    alert('Please select and search valid date range Leads.')
    return
  }

  for (const item of tableData) {
    const dateString = item?.updatedAt
    const formattedDate = new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const signatureUrl = item?.documentId?.signature
    const signatureBase64 = signatureUrl
      ? await fetchSignatureAsBase64(signatureUrl)
      : null

    const printElement = ReactDOMServer.renderToString(
      <PurchaseReceipt
        phoneNumber={item?.phoneNumber}
        aadharNumber={item?.aadharNumber}
        uniqueCode={item?.uniqueCode}
        emailId={item?.emailId}
        name={item?.name}
        imeiNumber={item?.documentId?.IMEI}
        phoneName={item?.modelId?.name}
        type={item?.categoryInfo?.categoryName}
        storeName={item?.store?.storeName}
        region={item?.store?.region}
        address={item?.store?.address}
        storage={item?.storage}
        RAM={item?.ram}
        formattedDate={formattedDate}
        price={item?.price}
        signatureUrl={signatureBase64 || signatureUrl}
        companyName={item?.companyInfo?.name}
        companyGstin={item?.companyInfo?.gstNumber}
        companyAddress={item?.companyInfo?.address}
      />,
    )
    html2pdf()
      .set({
        margin: 10,
        filename: `purchase_receipt_${tableData.indexOf(item) + 1}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(printElement)
      .save()
  }
}

const LeadsCompleted = () => {
  const [deviceType, setDeviceType] = useState('CTG1')
  const userToken = sessionStorage.getItem('authToken')
  const [loading, setLoading] = useState(false)
  const downloadStatus = useSyncExternalStore(
    leadDownloadManager.subscribe,
    leadDownloadManager.getSnapshot,
  )
  const downloading = downloadStatus?.status === 'running'
  const downloadProgress = downloadStatus?.progressText || ''
  const [sideMenu, setsideMenu] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [tableData, setTableData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [maxPages, setMaxPages] = useState(0)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [fromDateDup, setFromDateDup] = useState(iniDate)
  const [toDateDup, setToDateDup] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [search, setSearch] = useState('')
  const [search1, setSearch1] = useState('')
  const [storeDrop, setStoreDrop] = useState(false)
  const [storeName, setStoreName] = useState(ALLstore)
  const [selStoreId, setSelStoreId] = useState('')
  const [storeData, setStoreData] = useState([])
  const [categories, setCategories] = useState([])
  const [reset, setReset] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStores, setFilteredStores] = useState(storeData)
  const saveStore = async () => {
    const temparr = await getStore()
    setStoreData(temparr)
    setFilteredStores(temparr)
  }
  useEffect(() => {
    saveStore()
    getCategories()
  }, [])
  const getCategories = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/getAll`,
        {
          headers: { Authorization: userToken },
        },
      )
      setCategories(data.data)
    } catch (err) {}
  }
  function getSalesData() {
    setLoading(true)
    const baseUrl = `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/prospects/findAllSelled`
    const queryParams = new URLSearchParams({
      page: currentPage,
      limit: pageLimit,
      startDate: fromDateDup,
      endDate: toDateDup,
      store: selStoreId,
      rid: search,
      customerPhone: search1,
      deviceType: deviceType,
    })
    const endpoint = `${baseUrl}?${queryParams.toString()}`
    axios
      .get(endpoint, {
        headers: { authorization: userToken },
      })
      .then((response) => {
        setMaxPages(Math.ceil(response.data.totalCounts / 10))
        setTableData(response.data.data)
        setTotalCount(response.data.totalCounts)
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  const handleSearchClear = () => {
    setSearch('')
    setSearch1('')
    setStoreName(ALLstore)
    setSelStoreId('')
    setFromDate('')
    setFromDateDup(iniDate)
    setToDate('')
    setToDateDup(new Date().toISOString().split('T')[0])
    setReset(!reset)
  }

  const handleStoreChange = (value) => {
    setStoreDrop(false)
    console.log(value._id)
    setSelStoreId(value._id)
    setStoreName(value.storeName)
  }

  useEffect(() => {
    getSalesData()
  }, [
    currentPage,
    pageLimit,
    selStoreId,
    fromDateDup,
    toDateDup,
    reset,
    deviceType,
  ])

  const handleFromDateChange = (DateTemp, e) => {
    if (DateTemp === null) {
      setFromDate('')
    } else {
      setFromDate(DateTemp)
      const formattedDate = new Date(
        DateTemp.getTime() - DateTemp.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split('T')[0]
      setFromDateDup(formattedDate)
    }
  }

  const handleToDateChange = (DateTemp) => {
    if (DateTemp === null) {
      setToDate('')
    } else {
      setToDate(DateTemp)
      const formattedDate = new Date(
        DateTemp.getTime() - DateTemp.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split('T')[0]
      setToDateDup(formattedDate)
    }
  }

  useEffect(() => {
    if (
      search === '' &&
      search1 === '' &&
      storeName === ALLstore &&
      selStoreId === '' &&
      fromDateDup === iniDate
    ) {
      getSalesData()
    }
  }, [search, search1, storeName, selStoreId, fromDateDup])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value === '') {
      setFilteredStores(storeData)
    } else {
      const filtered = storeData.filter((store) =>
        store.storeName.toLowerCase().includes(value.toLowerCase()),
      )
      setFilteredStores(filtered)
    }
  }

  return (
    <SubLeadsCompleted
      loading={loading}
      downloading={downloading}
      downloadProgress={downloadProgress}
      setsideMenu={setsideMenu}
      sideMenu={sideMenu}
      totalCount={totalCount}
      fromDate={fromDate}
      handleFromDateChange={handleFromDateChange}
      toDate={toDate}
      handleToDateChange={handleToDateChange}
      tableData={tableData}
      setCurrentPage={setCurrentPage}
      currentPage={currentPage}
      maxPages={maxPages}
      search={search}
      setSearch={setSearch}
      search1={search1}
      setSearch1={setSearch1}
      storeDrop={storeDrop}
      setStoreDrop={setStoreDrop}
      storeName={storeName}
      storeData={storeData}
      handleSearchClear={handleSearchClear}
      handleStoreChange={handleStoreChange}
      getSalesData={getSalesData}
      deviceType={deviceType}
      setDeviceType={setDeviceType}
      selStoreId={selStoreId}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      handleSearch={handleSearch}
      filteredStores={filteredStores}
      categories={categories}
      fromDateDup={fromDateDup}
      toDateDup={toDateDup}
    />
  )
}

const SubLeadsCompleted = ({
  loading,
  downloading,
  downloadProgress,
  setsideMenu,
  sideMenu,
  totalCount,
  fromDate,
  handleFromDateChange,
  toDate,
  handleToDateChange,
  tableData,
  setCurrentPage,
  currentPage,
  maxPages,
  search,
  setSearch,
  search1,
  setSearch1,
  storeDrop,
  setStoreDrop,
  storeName,
  storeData,
  handleSearchClear,
  handleStoreChange,
  getSalesData,
  deviceType,
  setDeviceType,
  selStoreId,
  searchTerm,
  setSearchTerm,
  handleSearch,
  filteredStores,
  categories,
  fromDateDup,
  toDateDup,
  ...props
}) => {
  return (
    <div className='overflow-y-hidden'>
      {loading && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={loading}
            size={15}
          />
        </div>
      )}
      {downloading && (
        <div className='flex items-center gap-3 w-full px-5 py-2 bg-blue-50 border-b border-blue-200 text-sm'>
          <BeatLoader color='var(--primary-color)' size={8} />
          <p className='font-medium text-blue-700'>Please wait, your file is downloading. This may take a few minutes. Do not  refresh the page.</p>
          {downloadProgress && (
            <span className='ml-auto font-medium text-blue-600 whitespace-nowrap'>{downloadProgress}</span>
          )}
        </div>
      )}
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <NavigateListing />
      <SubLeadsCompletedBtns
        handleFromDateChange={handleFromDateChange}
        fromDate={fromDate}
        totalCount={totalCount}
        deviceType={deviceType}
        selStoreId={selStoreId}
        toDate={toDate}
        handleToDateChange={handleToDateChange}
        setStoreDrop={setStoreDrop}
        storeDrop={storeDrop}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        filteredStores={filteredStores}
        handleStoreChange={handleStoreChange}
        setSearchTerm={setSearchTerm}
        setDeviceType={setDeviceType}
        categories={categories}
        tableData={tableData}
        storeData={storeData}
        downloading={downloading}
        downloadProgress={downloadProgress}
        fromDateDup={fromDateDup}
        toDateDup={toDateDup}
      />
      <div className='flex gap-2 items-center justify-center outline-none mt-5 w-[100%]'>
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setSearch(e.target.value)}
            className='text-sm'
            type='text'
            placeholder='Search Model Name/Unique Id/Imei/UserName'
            value={search}
          />
          <IoMdSearch size={25} onClick={() => getSalesData()} />
        </div>
        <div className={styles.icons_box}>
          <IoRefresh onClick={() => handleSearchClear()} size={25} />
        </div>
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setSearch1(e.target.value)}
            className='text-sm'
            type='text'
            placeholder='Search Customer Name/Mobile No./Email'
            value={search1}
          />
          <IoMdSearch size={25} onClick={() => getSalesData()} />
        </div>
      </div>
      <LeadsCompletedTable data={tableData} />
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
          disabled={currentPage === maxPages - 1}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === maxPages - 1
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}
const SubLeadsCompletedBtns = ({
  handleFromDateChange,
  fromDate,
  totalCount,
  deviceType,
  selStoreId,
  toDate,
  handleToDateChange,
  setStoreDrop,
  storeDrop,
  searchTerm,
  handleSearch,
  filteredStores,
  handleStoreChange,
  setSearchTerm,
  setDeviceType,
  categories,
  tableData,
  storeData,
  downloading,
  downloadProgress,
  fromDateDup,
  toDateDup,
}) => {
  const handleDownload = () => {
    const result = leadDownloadManager.startDownload({
      totalCount,
      deviceType,
      store: selStoreId,
      fromDate: fromDateDup,
      toDate: toDateDup,
    })

    if (result === 'empty') {
      alert('No records found to download.')
    } else if (result === 'duplicate') {
      alert('A download is already in progress.')
    }
  }

  return (
    <div className='flex gap-2 items-center justify-center outline-none mt-5 w-[100%]'>
      <div className='flex gap-4'>
        <button
          className={`${styles.bulkdown_button}`}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <BeatLoader color='white' size={8} />{' '}
              {downloadProgress || 'Downloading...'}
            </>
          ) : (
            <>
              <FaDownload /> Bulk Download
            </>
          )}
        </button>
        <div className='mt-2 ml-4'>
          <button
            className={`${styles.bulkdown_button}`}
            onClick={() => handleBulkDownloadReceipts(fromDate, toDate, tableData)}
          >
            <FaDownload /> Download Receipts
          </button>
        </div>
      </div>
      <div className='[bg-[#F5F4F9]'>
        <DatePicker
          selected={fromDate}
          onChange={handleFromDateChange}
          dateFormat='yyyy-MM-dd'
          className={` mt-1 py-[6px] border px-[15px]  rounded-md`}
          placeholderText='Select from date'
        />
      </div>
      <div>
        <DatePicker
          selected={toDate}
          dateFormat='yyyy-MM-dd'
          onChange={handleToDateChange}
          className='mt-1 py-[6px] px-[15px]  border rounded-md'
          placeholderText='Select to date'
        />
      </div>
      {storeData && storeData.length > 0 && (
        <div className='w-[250px] relative'>
          <div
            className={`${styless.filter_button}`}
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
                placeholder='Search store...'
                type='text'
                value={searchTerm}
                onChange={handleSearch}
                className='w-full   p-2   border-b border-gray-300'
              />
              <div
                className={`overflow-y-scroll   max-h-[200px]   ${styless.filter_drop}`}
              >
                <div
                  className={`${styles.filter_option}`}
                  onClick={() => {
                    handleStoreChange({ _id: '', storeName: ALLstore })
                    setSearchTerm(ALLstore)
                  }}
                >
                  <p className=' truncate '>{ALLstore}</p>
                </div>
                {filteredStores.length > 0 ? (
                  filteredStores.map((item3, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        handleStoreChange(item3)
                        setSearchTerm(item3.storeName)
                        setStoreDrop(false)
                      }}
                      className={`  ${styles.filter_option}`}
                    >
                      <p className=' truncate '>{item3.storeName}</p>
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
      <div className='w-[250px] h-[35px] relative'>
        <select
          name=''
          id=''
          className='bg-primary text-white rounded-lg outline-none px-2 py-1 w-full h-full'
          onChange={(e) => {
            setDeviceType(e.target.value)
          }}
        >
          {categories.map((cat) => (
            <option
              className='bg-white text-primary font-medium'
              key={cat?._id}
              value={cat?.categoryCode}
            >
              {cat?.categoryName}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
export default LeadsCompleted
