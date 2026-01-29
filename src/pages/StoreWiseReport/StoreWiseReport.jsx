import React, { useEffect, useState } from 'react'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import StoreWiseTable from '../../components/StoreWiseTable/StoreWiseTable'
import axios from 'axios'
import styles from './StoreWiseReport.module.css'
import { FaDownload } from 'react-icons/fa6'
import * as XLSX from 'xlsx'
import { BeatLoader } from 'react-spinners'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import TechFilter from './components/TechFilter'
import GrestFilter from './components/GrestFilter'
import RegionStoreFilter from './components/RegionStoreFilter'
import DateFilters from './components/DateFilters'

const ALLstore = 'All Stores'
const isSelled = 'true'
const pageLimit = 10
const startDateFillter = '2023-01-01'

const downloadExcelStoreWise = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    console.error('Invalid data provided for Excel download')
    return
  }

  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'
  const formattedData = apiData.map((item) => {
    // Filter device report to show only selected issues
    let deviceReportSummary = 'N/A'
    if (item.deviceReport && typeof item.deviceReport === 'object') {
      const selectedIssues = Object.entries(item.deviceReport)
        .filter(
          ([key, value]) =>
            value === true || value === 'Yes' || value === 'true'
        )
        .map(([key]) => key)
      deviceReportSummary =
        selectedIssues.length > 0 ? selectedIssues.join(', ') : 'No Issues'
    }

    return {
      'Purchase Date': new Date(item.createdAt).toLocaleDateString('en-IN'),
      Technicians: item.userId?.firstName,
      Category: item.categoryInfo?.categoryName,
      'IMEI No.': item.documentId?.IMEI,
      'Product Details': item.modelId?.name,
      Location: item?.store?.storeName,
      Company: item?.companyInfo?.name,
      Grade: item?.grade,
      'Device Issues': deviceReportSummary,
      Price: item?.actualPrice,
      'Price Offered To Customer': item?.price,
      'Unique ID': item?.uniqueCode,
      [`${import.meta.env.VITE_WEBSITE_TITLE} Received`]:
        item?.grestReceived || 'NA',
      'Receiving Date': item?.grestRecDate || 'NA',
      'New Prices As Per New Range': 'NA',
      'Store Payment Status': 'NA',
      'Payment Date': 'NA',
      'Store Payment UTR Number': 'NA',
    }
  })
  const wsStoreWise = XLSX.utils.json_to_sheet(formattedData)
  const wbStoreWise = { Sheets: { data: wsStoreWise }, SheetNames: ['data'] }
  const excelBufferStoreWise = XLSX.write(wbStoreWise, {
    bookType: 'xlsx',
    type: 'array',
  })
  const dataFileStoreWise = new Blob([excelBufferStoreWise], {
    type: fileType,
  })
  saveAs(dataFileStoreWise, 'StoreWise_Report' + fileExtension)
}

const fetchDownloadDataStoreWise = (
  deviceCategory,
  fromDate,
  toDate,
  storeId,
  companyId,
  purchaseGrade,
  token
) => {
  if (!fromDate || !toDate) {
    alert('Set dates before Downloading')
    return
  }
  const userToken = sessionStorage.getItem('authToken')
  let url = `${
    import.meta.env.VITE_REACT_APP_ENDPOINT
  }/api/prospects/findAll?page=${0}&limit=${9999}&is_selled=${isSelled}&deviceType=${deviceCategory}&startDate=${fromDate}&endDate=${toDate}&store=${storeId}`

  if (companyId) {
    url += `&companyId=${companyId}`
  }
  if (purchaseGrade) {
    url += `&purchaseGrade=${purchaseGrade}`
  }

  axios
    .get(url, {
      headers: {
        authorization: `${userToken}`,
      },
    })
    .then((res) => {
      downloadExcelStoreWise(res.data.data)
    })
    .catch((err) => {
      console.log(err)
    })
}
const useStoreWiseData = (token, config) => {
  const [tableData, setTableData] = useState()
  const [isTableLoaded, setIsTableLoaded] = useState(false)
  const [maxPages, setMaxPages] = useState(0)

  const fetchStoreData = () => {
    setIsTableLoaded(true)
    const queryParams = new URLSearchParams({
      page: config.currentPage,
      limit: pageLimit,
      is_selled: isSelled,
      store: config.storeId,
      rid: config.searchValue,
      grestRec: config.grestRec,
      endDate: config.toDateDup,
      startDate: config.fromDateDup,
      userId: config.techId,
      deviceType: config.deviceCategory,
    })

    // Add optional filters
    if (config.companyId) {
      queryParams.append('companyId', config.companyId)
    }
    if (config.purchaseGrade) {
      queryParams.append('purchaseGrade', config.purchaseGrade)
    }

    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll?${queryParams.toString()}`,
        { headers: { Authorization: token } }
      )
      .then((res) => {
        setMaxPages(Math.ceil(res.data.totalCounts / 10))
        setTableData(res.data.data || [])
        setIsTableLoaded(false)
      })
      .catch((err) => {
        console.error('Failed to fetch store data:', err)
        setIsTableLoaded(false)
      })
  }

  return {
    tableData,
    isTableLoaded,
    maxPages,
    fetchStoreData,
    setTableData,
    setIsTableLoaded,
    setMaxPages,
  }
}

const useStoreMetadata = (token) => {
  const [storeData, setStoreData] = useState([])
  const [regionalData, setRegionalData] = useState([])
  const [entireStore, setEntireStore] = useState([])
  const [allUser, setAllUser] = useState([])
  const [categories, setCategories] = useState([])
  const [companies, setCompanies] = useState([])

  const getStore = () => {
    const config = {
      method: 'get',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/findAll?page=0&limit=9999`,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        const allData = response.data.result || []
        const storeNamesArray = allData.map((store) => store.storeName)
        const uniqueRegionsArray = [
          ...new Set(allData.map((store) => store.region)),
        ]
        setEntireStore(allData)
        setStoreData(storeNamesArray)
        setRegionalData(uniqueRegionsArray)
      })
      .catch((error) => {
        console.error('Failed to fetch store data:', error)
      })
  }

  const getAllUser = () => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/user/find`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setAllUser(res.data.data || [])
      })
      .catch((err) => {
        console.error('Failed to fetch users:', err)
      })
  }

  const getCategories = () => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/getAll`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setCategories(res.data.data || [])
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err)
      })
  }

  const getCompanies = () => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setCompanies(res.data.result || [])
      })
      .catch((err) => {
        console.error('Failed to fetch companies:', err)
      })
  }

  return {
    storeData,
    regionalData,
    entireStore,
    allUser,
    categories,
    companies,
    getStore,
    getAllUser,
    getCategories,
    getCompanies,
    setStoreData,
  }
}

const StoreWiseReport = () => {
  const token = sessionStorage.getItem('authToken')
  const LoggedInUser = JSON.parse(sessionStorage.getItem('profile'))
  const isSuperAdmin = LoggedInUser?.role === 'Super Admin'
  const [currentPage, setCurrentPage] = useState(0)
  const [storeName, setStoreName] = useState(ALLstore)
  const [storeId, setStoreId] = useState('')
  const [region, setRegion] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [fromDateDup, setFromDateDup] = useState(startDateFillter)
  const [toDate, setToDate] = useState('')
  const [toDateDup, setToDateDup] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [grestRec, setGrestRec] = useState('')
  const [techId, setTechId] = useState('')
  const [techName, setTechName] = useState('')
  const [deviceCategory, setDeviceCategory] = useState('CTG1')
  const [searchTerm, setSearchTerm] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [purchaseGrade, setPurchaseGrade] = useState('')

  const storeConfig = {
    currentPage,
    storeId,
    searchValue,
    grestRec,
    toDateDup,
    fromDateDup,
    techId,
    deviceCategory,
    companyId,
    purchaseGrade,
  }

  const { tableData, isTableLoaded, maxPages, fetchStoreData } =
    useStoreWiseData(token, storeConfig)

  const {
    storeData,
    regionalData,
    entireStore,
    allUser,
    categories,
    companies,
    getStore,
    getAllUser,
    getCategories,
    getCompanies,
    setStoreData,
  } = useStoreMetadata(token)

  useEffect(() => {
    getCategories()
    getCompanies()
    if (isSuperAdmin) {
      getStore()
      getAllUser()
    }
  }, [])

  useEffect(() => {
    fetchStoreData()
  }, [
    currentPage,
    pageLimit,
    grestRec,
    fromDateDup,
    toDateDup,
    techId,
    deviceCategory,
    companyId,
    purchaseGrade,
  ])

  useEffect(() => {
    if (storeId) {
      fetchStoreData()
    }
  }, [storeId])

  const handleSearchClear = () => {
    setStoreName(ALLstore)
    setStoreId('')
    setRegion('')
    setSearchValue('')
    setFromDate('')
    setFromDateDup(startDateFillter)
    setToDate('')
    setToDateDup(new Date().toISOString().split('T')[0])
    setGrestRec('')
    setTechId('')
    setTechName('')
    setSearchTerm('')
    setCompanyId('')
    setPurchaseGrade('')
  }
  useEffect(() => {
    if (
      storeId === '' &&
      region === '' &&
      searchValue === '' &&
      fromDate === '' &&
      fromDateDup === startDateFillter &&
      toDate === '' &&
      toDateDup === new Date().toISOString().split('T')[0] &&
      grestRec === '' &&
      techId === '' &&
      techName === '' &&
      searchTerm === ''
    ) {
      fetchStoreData()
    }
  }, [
    storeId,
    region,
    searchValue,
    fromDate,
    fromDateDup,
    toDate,
    toDateDup,
    grestRec,
    techId,
    techName,
    searchTerm,
  ])
  return (
    <div>
      <UpperFilter
        isTableLoaded={isTableLoaded}
        deviceCategory={deviceCategory}
        setDeviceCategory={setDeviceCategory}
        setSearchValue={setSearchValue}
        searchValue={searchValue}
        fromDate={fromDate}
        toDate={toDate}
        handleSearchClear={handleSearchClear}
        fetchStoreData={fetchStoreData}
        categories={categories}
        companies={companies}
        token={token}
        storeId={storeId}
        companyId={companyId}
        setCompanyId={setCompanyId}
        purchaseGrade={purchaseGrade}
        setPurchaseGrade={setPurchaseGrade}
      />
      <MainFilter
        techName={techName}
        setTechName={setTechName}
        setTechId={setTechId}
        allUser={allUser}
        grestRec={grestRec}
        region={region}
        regionalData={regionalData}
        storeName={storeName}
        setStoreName={setStoreName}
        setStoreId={setStoreId}
        setRegion={setRegion}
        setGrestRec={setGrestRec}
        storeData={storeData}
        setStoreData={setStoreData}
        toDate={toDate}
        fromDate={fromDate}
        entireStore={entireStore}
        setFromDateDup={setFromDateDup}
        setToDateDup={setToDateDup}
        setToDate={setToDate}
        setFromDate={setFromDate}
        handleSearchClear={handleSearchClear}
        isSuperAdmin={isSuperAdmin}
      />
      <TableCont
        currentPage={currentPage}
        tableData={tableData}
        setCurrentPage={setCurrentPage}
        maxPages={maxPages}
      />
    </div>
  )
}

export default StoreWiseReport

const UpperFilter = ({
  isTableLoaded,
  deviceCategory,
  setDeviceCategory,
  setSearchValue,
  searchValue,
  fromDate,
  toDate,
  handleSearchClear,
  fetchStoreData,
  categories,
  companies,
  storeId,
  companyId,
  setCompanyId,
  purchaseGrade,
  setPurchaseGrade,
  token,
}) => {
  const [sideMenu, setsideMenu] = useState(false)
  return (
    <React.Fragment>
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
      <div className='flex flex-col gap-3 px-4'>
        <div className='flex flex-row gap-2 items-center justify-center'>
          <div className='flex gap-2'>
            <p className='font-medium'>Select Category</p>
            <select
              name=''
              id=''
              value={deviceCategory}
              className='bg-primary text-white rounded-lg outline-none px-2 py-1'
              onChange={(e) => setDeviceCategory(e.target.value)}
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
          <div className='flex gap-2'>
            <p className='font-medium'>Company</p>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className='bg-primary text-white rounded-lg outline-none px-2 py-1'
            >
              <option className='bg-white text-primary font-medium' value=''>
                All Companies
              </option>
              {companies.map((company) => (
                <option
                  className='bg-white text-primary font-medium'
                  key={company._id}
                  value={company._id}
                >
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div className='flex gap-2'>
            <p className='font-medium'>Purchase Grade</p>
            <select
              value={purchaseGrade}
              onChange={(e) => setPurchaseGrade(e.target.value)}
              className='bg-primary text-white rounded-lg outline-none px-2 py-1'
            >
              <option className='bg-white text-primary font-medium' value=''>
                All Grades
              </option>
              <option className='bg-white text-primary font-medium' value='A+'>
                A+
              </option>
              <option className='bg-white text-primary font-medium' value='A'>
                A
              </option>
              <option className='bg-white text-primary font-medium' value='B'>
                B
              </option>
              <option className='bg-white text-primary font-medium' value='B-'>
                B-
              </option>
              <option className='bg-white text-primary font-medium' value='C+'>
                C+
              </option>
              <option className='bg-white text-primary font-medium' value='C'>
                C
              </option>
              <option className='bg-white text-primary font-medium' value='C-'>
                C-
              </option>
              <option className='bg-white text-primary font-medium' value='D+'>
                D+
              </option>
              <option className='bg-white text-primary font-medium' value='D'>
                D
              </option>
              <option className='bg-white text-primary font-medium' value='D-'>
                D-
              </option>
              <option className='bg-white text-primary font-medium' value='E'>
                E
              </option>
            </select>
          </div>
          <div className={`${styles.search_bar_wrap}`}>
            <input
              onChange={(e) => setSearchValue(e.target.value)}
              className='text-sm'
              type='text'
              placeholder='Search Store Name/Email/Id/Region'
              value={searchValue}
            />
            <IoMdSearch onClick={() => fetchStoreData()} size={25} />
          </div>
          <div className={styles.icons_box}>
            <IoRefresh onClick={handleSearchClear} className='' size={25} />
          </div>
          <div>
            <button
              className={`${styles.bulkdown_button}`}
              onClick={() =>
                fetchDownloadDataStoreWise(
                  deviceCategory,
                  fromDate,
                  toDate,
                  storeId,
                  companyId,
                  purchaseGrade,
                  token
                )
              }
            >
              <FaDownload /> Bulk Download
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

const MainFilter = ({
  techName,
  setTechName,
  setTechId,
  allUser,
  grestRec,
  region,
  regionalData,
  storeName,
  setStoreName,
  setStoreId,
  setRegion,
  setGrestRec,
  storeData,
  setStoreData,
  toDate,
  fromDate,
  entireStore,
  setFromDateDup,
  setToDateDup,
  setToDate,
  setFromDate,
  handleSearchClear,
  isSuperAdmin,
}) => {
  const [regionDrop, setRegionDrop] = useState(false)
  const [storeDrop, setStoreDrop] = useState(false)
  const [grestDrop, setGrestDrop] = useState(false)
  const [techDrop, setTechDrop] = useState(false)
  const handleFromDateChange = (date) => {
    if (date === null) {
      setFromDate('')
    } else {
      setFromDate(date)
      const formattedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]
      const today = new Date()
      const formattedToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]
      if (toDate === '') {
        setToDateDup(formattedToday)
      }
      setFromDateDup(formattedDate)
    }
  }
  const handleToDateChange = (date) => {
    if (date === null) {
      setToDate('')
    } else {
      setToDate(date)
      const formattedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]
      setToDateDup(formattedDate)
      if (fromDate === '') {
        const fromDateOneYearBefore = new Date(date)
        fromDateOneYearBefore.setFullYear(
          fromDateOneYearBefore.getFullYear() - 1
        )
        const formattedFromDate = new Date(
          fromDateOneYearBefore.getTime() -
            fromDateOneYearBefore.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[0]
        setFromDateDup(formattedFromDate)
      }
    }
  }
  const handleRegionChange = (value) => {
    setRegionDrop(false)
    setStoreName('')
    const filteredStores = entireStore.filter((store) => store.region === value)
    const storeNamesArray = filteredStores.map((store) => ({
      storeName: store.storeName,
      _id: store._id,
    }))
    setStoreData(storeNamesArray)
    setRegion(value)
  }
  const handleStoreChange = (value) => {
    setStoreDrop(false)
    const filteredStores = entireStore.filter(
      (store) => store._id === value._id
    )
    const newRegion = filteredStores[0].region
    setRegion(newRegion)
    setStoreName(value.storeName)
    setStoreId(value._id)
  }
  const handleTechChange = (value) => {
    setTechName(value.userName)
    setTechId(value._id)
    setTechDrop(false)
  }
  const handleGrestRecChange = (value) => {
    setGrestRec(value)
    setGrestDrop(false)
  }
  return (
    <div className='flex flex-row w-100 gap-2 items-center justify-center'>
      <MainFilterSub
        setTechDrop={setTechDrop}
        techDrop={techDrop}
        techName={techName}
        setTechName={setTechName}
        setTechId={setTechId}
        allUser={allUser}
        handleTechChange={handleTechChange}
        setGrestDrop={setGrestDrop}
        grestDrop={grestDrop}
        grestRec={grestRec}
        handleGrestRecChange={handleGrestRecChange}
        setRegionDrop={setRegionDrop}
        regionDrop={regionDrop}
        region={region}
        regionalData={regionalData}
        handleRegionChange={handleRegionChange}
        setStoreDrop={setStoreDrop}
        storeDrop={storeDrop}
        storeName={storeName}
        storeData={storeData}
        handleStoreChange={handleStoreChange}
        fromDate={fromDate}
        handleFromDateChange={handleFromDateChange}
        toDate={toDate}
        handleToDateChange={handleToDateChange}
        handleSearchClear={handleSearchClear}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  )
}

const MainFilterSub = ({
  setTechDrop,
  techDrop,
  techName,
  setTechName,
  setTechId,
  allUser,
  handleTechChange,
  setGrestDrop,
  grestDrop,
  grestRec,
  handleGrestRecChange,
  setRegionDrop,
  regionDrop,
  region,
  regionalData,
  handleRegionChange,
  setStoreDrop,
  storeDrop,
  storeName,
  storeData,
  handleStoreChange,
  fromDate,
  handleFromDateChange,
  toDate,
  handleToDateChange,
  handleSearchClear,
  isSuperAdmin,
}) => (
  <div className='flex flex-row px-5 gap-2 w-[100%] justify-center items-center'>
    <TechFilter
      techDrop={techDrop}
      setTechDrop={setTechDrop}
      techName={techName}
      setTechName={setTechName}
      setTechId={setTechId}
      allUser={allUser}
      handleTechChange={handleTechChange}
    />
    <GrestFilter
      grestDrop={grestDrop}
      setGrestDrop={setGrestDrop}
      grestRec={grestRec}
      handleGrestRecChange={handleGrestRecChange}
    />
    {isSuperAdmin && (
      <RegionStoreFilter
        regionDrop={regionDrop}
        setRegionDrop={setRegionDrop}
        region={region}
        regionalData={regionalData}
        handleRegionChange={handleRegionChange}
        storeDrop={storeDrop}
        setStoreDrop={setStoreDrop}
        storeData={storeData}
        handleStoreChange={handleStoreChange}
        handleSearchClear={handleSearchClear}
      />
    )}
    <DateFilters
      fromDate={fromDate}
      handleFromDateChange={handleFromDateChange}
      toDate={toDate}
      handleToDateChange={handleToDateChange}
    />
  </div>
)

const TableCont = ({ currentPage, tableData, setCurrentPage, maxPages }) => {
  return (
    <React.Fragment>
      <div className='max-w-full min-h-screen'>
        <StoreWiseTable currentPage={currentPage} tableData={tableData} />
      </div>
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
    </React.Fragment>
  )
}
