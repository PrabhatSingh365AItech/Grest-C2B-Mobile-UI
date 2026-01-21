import axios from 'axios'
import React, { useEffect, useState } from 'react'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import { BeatLoader } from 'react-spinners'
import { FaDownload } from 'react-icons/fa6'
import { IoRefresh } from 'react-icons/io5'
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdAdd,
  IoMdSearch,
} from 'react-icons/io'
import styles from './CompanyListingDetails.module.css'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import EditCompany from '../../components/EditCompany/EditCompany'
import { AiOutlineFile } from 'react-icons/ai'
import NoDataMessage from '../../components/NoDataMessage'

const downloadExcel = (apiData) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const formattedData = apiData.map((item) => {
    return {
      'Company Name': item.name,
      'Company Code': item.companyCode,
      Address: item.address,
      'Contact Number': item.contactNumber,
      'GST Number': item.gstNumber,
      'PAN Number': item.panNumber,
      Remarks: item.remarks,
    }
  })

  const ws = XLSX.utils.json_to_sheet(formattedData)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  const dataFile = new Blob([excelBuffer], { type: fileType })
  saveAs(dataFile, 'Company_Listing' + fileExtension)
}

const handleDownload = (totalCount) => {
  const userToken1 = sessionStorage.getItem('authToken')
  axios
    .get(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/company/findAll?page=${0}&limit=${totalCount}`,
      {
        headers: {
          authorization: `${userToken1}`,
        },
      }
    )
    .then((res) => {
      downloadExcel(res.data.result)
    })
    .catch((err) => {
      console.log(err)
    })
}

const getTextColorClass = (isSuccess) =>
  isSuccess ? 'text-green-500' : 'text-primary'
const pageLimit = 10

const CompanyListingDetails = () => {
  const userToken = sessionStorage.getItem('authToken')
  const [maxPages, setMaxPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [tableData, setTableData] = useState()
  const [totalCount, setTotalCount] = useState(0)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState()
  const [confBox, setConfBox] = useState(false)
  const [sucBox, setSucBox] = useState(false)
  const [failBox, setFailBox] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [companyEditData, setCompanyEditData] = useState()
  const [companyDocsData, setCompanyDocsData] = useState()
  const [searchValue, setSearchValue] = useState('')
  const [editBoxOpen, setEditBoxOpen] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [viewDocsModalOpen, setViewDocsModalOpen] = useState(false)
  const navigate = useNavigate()

  const fetchTableData = () => {
    setIsTableLoading(true)
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/company/findAll?page=${currentPage}&limit=${pageLimit}`,
        { headers: { Authorization: userToken } }
      )
      .then((res) => {
        setMaxPages(Math.ceil(res.data.totalCounts / 10))
        setTableData(res.data.result)
        setTotalCount(res.data.totalRecords)
        setIsTableLoading(false)
      })
      .catch((err) => {
        setIsTableLoading(false)
      })
  }

  useEffect(() => {
    fetchTableData()
  }, [currentPage, pageLimit])

  const deleteConfHandler = (conpanyId) => {
    setSelectedCompany(conpanyId)
    setConfBox(true)
  }

  const getDataBySearch = () => {
    setIsTableLoading(true)
    const config = {
      method: 'get',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/company/findAll?page=${0}&limit=${totalCount}&search=${searchValue}`,
      headers: { Authorization: userToken },
    }
    axios
      .request(config)
      .then((response) => {
        setTableData(response.data.result)
        setIsTableLoading(false)
      })
      .catch((error) => {
        setErrMsg('Failed to load data')
        setFailBox(true)
        setIsTableLoading(false)
      })
  }

  const handleSearchClear = () => {
    setSearchValue('')
    fetchTableData()
  }

  useEffect(() => {
    if (editSuccess) {
      if (searchValue === '') {
        fetchTableData()
      } else {
        getDataBySearch()
      }
      setErrMsg('Succesfully updated store details')
      setSucBox(true)
      setEditSuccess(false)
      setEditBoxOpen(false)
    }
  }, [editSuccess])

  const editHandler = (companyData) => {
    setCompanyEditData(companyData)
    setEditBoxOpen(true)
  }

  const openViewDocsModal = (data) => {
    setCompanyDocsData(data)
    setViewDocsModalOpen(true)
  }
  return (
    <div>
      <ExtComps
        editBoxOpen={editBoxOpen}
        setEditBoxOpen={setEditBoxOpen}
        companyEditData={companyEditData}
        setEditSuccess={setEditSuccess}
        isTableLoading={isTableLoading}
        setIsTableLoading={setIsTableLoading}
        sucBox={sucBox}
        errMsg={errMsg}
        failBox={failBox}
        setSucBox={setSucBox}
        setFailBox={setFailBox}
        confBox={confBox}
        selectedCompany={selectedCompany}
        setConfBox={setConfBox}
        viewDocsModalOpen={viewDocsModalOpen}
        companyDocsData={companyDocsData}
        setViewDocsModalOpen={setViewDocsModalOpen}
        searchValue={searchValue}
        fetchTableData={fetchTableData}
        getDataBySearch={getDataBySearch}
        setErrMsg={setErrMsg}
      />
      <div className='m-2 flex flex-col gap-2 items-center w-[100%]'>
        <div className='flex gap-2 items-center justify-center outline-none mt-5 w-[100%]'>
          <button
            className={`${styles.bulkdown_button}`}
            onClick={() => {
              navigate('/companylisting')
            }}
          >
            <IoMdAdd size={24} /> Add Company
          </button>
          <div className={`${styles.search_bar_wrap}`}>
            <input
              onChange={(e) => setSearchValue(e.target.value)}
              className='text-sm'
              placeholder='Search...'
              value={searchValue}
              type='text'
            />
            <IoMdSearch size={25} onClick={() => getDataBySearch()} />
          </div>
          <div className={styles.icons_box}>
            <IoRefresh onClick={handleSearchClear} className='' size={25} />
          </div>
          <button
            className={`${styles.bulkdown_button}`}
            onClick={() => handleDownload(totalCount)}
          >
            <FaDownload /> Bulk Download
          </button>
        </div>
      </div>
      {tableData?.length > 0 ? (
        <CompanyTable
          tableData={tableData}
          editHandler={editHandler}
          deleteConfHandler={deleteConfHandler}
          openViewDocsModal={openViewDocsModal}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          maxPages={maxPages}
        />
      ) : (
        <NoDataMessage />
      )}
    </div>
  )
}

export default CompanyListingDetails

const ExtComps = ({
  editBoxOpen,
  setEditBoxOpen,
  companyEditData,
  setEditSuccess,
  isTableLoading,
  setIsTableLoading,
  sucBox,
  errMsg,
  failBox,
  setSucBox,
  setFailBox,
  confBox,
  selectedCompany,
  setConfBox,
  viewDocsModalOpen,
  companyDocsData,
  setViewDocsModalOpen,
  searchValue,
  fetchTableData,
  getDataBySearch,
  setErrMsg,
}) => {
  const userToken2 = sessionStorage.getItem('authToken')
  const [sideMenu, setsideMenu] = useState(false)
  const deleteHandler = (companyId) => {
    setIsTableLoading(true)
    setConfBox(false)
    const config = {
      method: 'delete',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/company/deleteById?id=${companyId}`,
      headers: { Authorization: userToken2 },
    }
    axios
      .request(config)
      .then((response) => {
        if (searchValue === '') {
          fetchTableData()
        } else {
          getDataBySearch()
        }
        setErrMsg(
          'Succesfully deleted company - ' + response.data.result.companyName
        )
        setSucBox(true)
        setIsTableLoading(false)
      })
      .catch((error) => {
        setErrMsg('Failed to deleted company')
        setFailBox(true)
        setIsTableLoading(false)
      })
  }

  return (
    <React.Fragment>
      {editBoxOpen && (
        <div className={`${styles.edit_page}`}>
          <EditCompany
            companyData={companyEditData}
            setEditBoxOpen={setEditBoxOpen}
            setEditSuccess={setEditSuccess}
          />
        </div>
      )}
      {isTableLoading && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isTableLoading}
            size={15}
          />
        </div>
      )}
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      {sucBox && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${getTextColorClass(sucBox)}`}>
            <IoIosCheckmarkCircle
              className={getTextColorClass(sucBox)}
              size={90}
            />
            <h6 className={getTextColorClass(sucBox)}>Success!</h6>
            <p className='text-slate-500'>{errMsg}</p>
            <button
              onClick={() => {
                setSucBox(false)
              }}
              className={'bg-green-500 text-white'}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {failBox && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${getTextColorClass(sucBox)}`}>
            <IoIosCloseCircle className={getTextColorClass(sucBox)} size={90} />
            <h6 className={getTextColorClass(sucBox)}>Error!</h6>
            <p className='text-slate-500'>{errMsg}</p>
            <button
              onClick={() => {
                setFailBox(false)
              }}
              className={'bg-primary text-white'}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confBox && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${getTextColorClass(sucBox)}`}>
            <h6 className={`${getTextColorClass(sucBox)}`}>Confirmation!</h6>
            <p className='text-slate-500'>
              {`Do you want to delete store ${selectedCompany.companyName} ?`}
            </p>
            <div className='flex flex-row gap-2'>
              <button
                onClick={() => deleteHandler(selectedCompany?._id)}
                className={'bg-primary text-white'}
              >
                Okay
              </button>
              <button
                onClick={() => {
                  setConfBox(false)
                  setIsTableLoading(false)
                }}
                className='bg-white text-primary'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {viewDocsModalOpen && (
        <div className='fixed mx-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-50'>
          <div className='absolute top-0 left-0 w-full h-full bg-gray-800 opacity-50'></div>
          <div className='bg-white border border-gray-300 p-6 w-96 max-w-[90%] mx-auto rounded-md z-10'>
            <p className='mb-4 text-lg font-semibold'>Documents</p>
            <div className=' flex gap-4 m-2'>
              {companyDocsData?.attachedDocuments?.map((document, index) => (
                <div key={index} className=''>
                  <a
                    href={document.fileUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <p className='text-xs font-medium'> Document {index + 1}</p>
                    <div className='flex flex-col items-center'>
                      <AiOutlineFile size={60} />
                    </div>
                  </a>
                </div>
              ))}
            </div>
            <button
              onClick={() => setViewDocsModalOpen(false)}
              className='border border-primary text-primary px-4 py-2 rounded'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

const CompanyTable = ({
  tableData,
  editHandler,
  deleteConfHandler,
  openViewDocsModal,
  setCurrentPage,
  currentPage,
  maxPages,
}) => {
  return (
    <React.Fragment>
      <div className='m-2 overflow-x-auto md:m-5'>
        <table className='w-full border border-primary'>
          <thead className='bg-primary text-white'>
            <tr>
              <th className='p-2 text-sm md:p-3 md:text-base'>Action</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Company Name</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Company Code</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Address</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                Contact Number
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>GST Number</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>PAN Number</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Remarks</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Documents</th>
            </tr>
          </thead>
          <tbody>
            {tableData !== undefined &&
              [...tableData]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((data, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-200' : ''}
                  >
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      <div className='flex flex-col gap-1'>
                        <button
                          className={`${styles.view_btn}`}
                          onClick={() => {
                            editHandler(data)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={`${styles.acpt_btn}`}
                          onClick={() => {
                            deleteConfHandler(data)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.name}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.companyCode}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.address}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.contactNumber}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.gstNumber}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.panNumber}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.remarks}
                    </td>
                    <td
                      className='p-2 text-sm text-center md:p-3 md:text-base'
                      onClick={() => openViewDocsModal(data)}
                      style={{ cursor: 'pointer' }}
                    >
                      View Docs
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className='flex justify-center mt-0 mb-4'>
        <button
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer'
          }`}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <button
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === maxPages - 1
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer'
          }`}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === maxPages - 1}
        >
          Next
        </button>
      </div>
    </React.Fragment>
  )
}
