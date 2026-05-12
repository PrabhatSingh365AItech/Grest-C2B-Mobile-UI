import React, { useEffect, useState } from 'react'
import GradePricingTable from '../components/GradePricingTable'
import Footer from '../components/Footer'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import PriceSheetUploadModal from '../components/PriceSheetUploadModal'
import * as XLSX from 'xlsx'
import styles from './CompanyListingDetails/CompanyListingDetails.module.css'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'
import { IoMdSearch } from 'react-icons/io'
import { FaDownload, FaUpload } from 'react-icons/fa6'
import { IoRefresh } from 'react-icons/io5'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

const pageLimit = 10

const downloadExcelGradePricingSheet = (apiData) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'
  const formattedData = apiData.map((item) => {
    const baseData = {
      'More Details': item.model?.name,
      'A+WARRANTY': item.grades?.A_PLUS,
      A: item.grades?.A,
      B: item.grades?.B,
      'B-': item.grades?.B_MINUS,
      'C+': item.grades?.C_PLUS,
      C: item.grades?.C,
      'C-': item.grades?.C_MINUS,
      'D+': item.grades?.D_PLUS,
      D: item.grades?.D,
      'D-': item.grades?.D_MINUS,
      E: item.grades?.E,
    }

    // Add new format grades if they exist
    if (item.grades?.A_MINUS !== undefined) {
      baseData['A-'] = item.grades.A_MINUS
    }
    if (item.grades?.A_MINUS_LIMITED !== undefined) {
      baseData['A-Limited'] = item.grades.A_MINUS_LIMITED
    }
    if (item.grades?.B_PLUS !== undefined) {
      baseData['B+'] = item.grades.B_PLUS
    }
    if (item.grades?.B_MINUS_LIMITED !== undefined) {
      baseData['B-Limited'] = item.grades.B_MINUS_LIMITED
    }
    if (item.grades?.C_MINUS_LIMITED !== undefined) {
      baseData['C-Limited'] = item.grades.C_MINUS_LIMITED
    }

    return baseData
  })
  const wsGradePricingSheet = XLSX.utils.json_to_sheet(formattedData)
  const wbGradePricingSheet = {
    Sheets: { data: wsGradePricingSheet },
    SheetNames: ['data'],
  }
  const excelBufferGradePricingSheet = XLSX.write(wbGradePricingSheet, {
    bookType: 'xlsx',
    type: 'array',
  })
  const dataFileGradePricingSheet = new Blob([excelBufferGradePricingSheet], {
    type: fileType,
  })
  saveAs(dataFileGradePricingSheet, 'GradePricingSheet' + fileExtension)
}

const GradePricingSheet = () => {
  const userToken = sessionStorage.getItem('authToken')
  const [sideMenu, setsideMenu] = useState(false)
  const [maxPages, setMaxPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [uploadBox, setUploadBox] = useState(false)
  const [deviceCategory, setDeviceCategory] = useState('CTG1')
  const [categories, setCategories] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchData = () => {
    setIsTableLoading(true)
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/grades/modelPriceList?page=${currentPage}&limit=${pageLimit}&deviceType=${deviceCategory}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        },
      )
      .then((res) => {
        setMaxPages(Math.ceil(res.data.totalRecords / 10))
        setTableData(res.data.result)
        setTotalCount(res.data.totalRecords)
        setIsTableLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setIsTableLoading(false)
      })
  }

  useEffect(() => {
    if (searchValue === '') {
      fetchData()
    } else {
      getDataBySearch()
    }
  }, [currentPage, pageLimit, deviceCategory])
  useEffect(() => {
    getCategories()
  }, [])
  const getDataBySearch = () => {
    setIsTableLoading(true)
    const config = {
      method: 'get',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/grades/modelPriceList?page=${currentPage}&limit=${pageLimit}&search=${searchValue}&deviceType=${deviceCategory}`,
      headers: { Authorization: userToken },
    }
    axios
      .request(config)
      .then((res) => {
        setTableData(res.data.result)
        setIsTableLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setIsTableLoading(false)
      })
  }
  const getCategories = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/getAll`,
        {
          headers: { Authorization: userToken },
        },
      )
      setCategories(data.data)
    } catch (err) {
      console.log(err)
    }
  }
  const handleSearchClick = () => {
    getDataBySearch()
  }

  const fetchDownloadDataGradePricingSheet = () => {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/grades/modelPriceList?page=${0}&limit=${totalCount}&deviceType=${deviceCategory}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        },
      )
      .then((res) => {
        downloadExcelGradePricingSheet(res.data.result)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleSearchClear = () => {
    setSearchValue('')
    fetchData()
  }

  const handleBulkSubmit = (file, category) => {
    setIsFileUploading(true)
    setUploadProgress(0)
    const token = sessionStorage.getItem('authToken')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)

    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/grades/global/upload`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            )
            setUploadProgress(percentCompleted)
          },
        },
      )
      .then(() => {
        toast.success('Price sheet uploaded successfully')
        setUploadBox(false)
        fetchData()
      })
      .catch((err) => {
        console.log(err)
        toast.error('Failed to submit')
      })
      .finally(() => {
        setIsFileUploading(false)
        setUploadProgress(0)
      })
  }

  const handleDeviceCategory = (e) => {
    setDeviceCategory(e.target.value)
  }

  const handleCloseModal = () => {
    setUploadBox(false)
  }
  return (
    <div>
      <GradePricingSheetSub
        setsideMenu={setsideMenu}
        sideMenu={sideMenu}
        isTableLoading={isTableLoading}
        uploadBox={uploadBox}
        handleBulkSubmit={handleBulkSubmit}
        isFileUploading={isFileUploading}
        setUploadBox={setUploadBox}
        handleDeviceCategory={handleDeviceCategory}
        setSearchValue={setSearchValue}
        searchValue={searchValue}
        handleSearchClick={handleSearchClick}
        handleSearchClear={handleSearchClear}
        fetchDownloadDataGradePricingSheet={fetchDownloadDataGradePricingSheet}
        deviceCategory={deviceCategory}
        tableData={tableData}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        maxPages={maxPages}
        categories={categories}
        handleCloseModal={handleCloseModal}
        uploadProgress={uploadProgress}
      />
    </div>
  )
}

const GradePricingSheetSub = ({
  setsideMenu,
  sideMenu,
  isTableLoading,
  uploadBox,
  handleBulkSubmit,
  isFileUploading,
  setUploadBox,
  handleDeviceCategory,
  setSearchValue,
  searchValue,
  handleSearchClick,
  handleSearchClear,
  fetchDownloadDataGradePricingSheet,
  deviceCategory,
  tableData,
  setCurrentPage,
  currentPage,
  maxPages,
  categories,
  handleCloseModal,
  uploadProgress,
}) => {
  return (
    <div>
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      {/* <Searchbar /> */}
      {isTableLoading && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isTableLoading}
            size={15}
          />
        </div>
      )}

      <PriceSheetUploadModal
        isOpen={uploadBox}
        onClose={handleCloseModal}
        onSubmit={handleBulkSubmit}
        categories={categories}
        title='Upload Global Price Sheet'
        isUploading={isFileUploading}
        uploadProgress={uploadProgress}
      />

      <div className='flex gap-2 items-center justify-center outline-none mt-5 w-[100%]'>
        <div className='flex gap-2'>
          <p className='font-medium'>Select Category</p>
          <select
            name=''
            id=''
            className='bg-primary text-white rounded-lg outline-none px-2 py-1'
            onChange={handleDeviceCategory}
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
        <div className={`${styles.search_bar_wrap}`}>
          <input
            className='text-sm'
            onChange={(e) => setSearchValue(e.target.value)}
            type='text'
            value={searchValue}
            placeholder='Search...'
          />
          <IoMdSearch size={25} onClick={handleSearchClick} />
        </div>
        <div className={styles.icons_box}>
          <IoRefresh onClick={handleSearchClear} size={25} className='' />
        </div>
        <button
          onClick={fetchDownloadDataGradePricingSheet}
          className={`${styles.bulkdown_button}`}
        >
          <FaDownload /> Bulk Download
        </button>
        <button
          className={`${styles.bulkdown_button}`}
          onClick={() => {
            setUploadBox(true)
          }}
        >
          <FaUpload /> Upload Price Sheet
        </button>
      </div>
      <div className='tableconatiner flex justify-center items-center'>
        <GradePricingTable
          deviceCategory={deviceCategory}
          tableData={tableData}
        />
      </div>
      <div className='mt-0 mb-4 flex justify-center '>
        <button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(currentPage - 1)}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === 0
              ? ' text-gray-600 cursor-not-allowed bg-gray-400'
              : ' text-white cursor-pointer bg-primary'
          }`}
        >
          Previous
        </button>
        <button
          disabled={currentPage === maxPages - 1}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === maxPages - 1
              ? 'text-gray-600 bg-gray-400  cursor-not-allowed'
              : 'bg-primary  cursor-pointer text-white'
          }`}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
      <Footer />
    </div>
  )
}

export default GradePricingSheet
