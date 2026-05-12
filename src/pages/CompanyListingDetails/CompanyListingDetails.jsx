import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdAdd, IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import { FaDownload } from 'react-icons/fa6'
import styles from './CompanyListingDetails.module.css'
import NoDataMessage from '../../components/NoDataMessage'
import CompanyTable from './CompanyTable'
import CompanyListingModals from './CompanyListingModals'
import { handleDownload } from './excelUtils'

const pageLimit = 10

const CompanyListingDetails = () => {
  const token = sessionStorage.getItem('authToken')
  const navigate = useNavigate()

  const [tableData, setTableData] = useState()
  const [currentPage, setCurrentPage] = useState(0)
  const [maxPages, setMaxPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isTableLoading, setIsTableLoading] = useState(false)

  const [searchValue, setSearchValue] = useState('')
  const [categories, setCategories] = useState([])

  const [selectedCompany, setSelectedCompany] = useState()
  const [companyEditData, setCompanyEditData] = useState()
  const [companyDocsData, setCompanyDocsData] = useState()
  const [editSuccess, setEditSuccess] = useState(false)
  const [editBoxOpen, setEditBoxOpen] = useState(false)
  const [confBox, setConfBox] = useState(false)
  const [sucBox, setSucBox] = useState(false)
  const [failBox, setFailBox] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [viewDocsModalOpen, setViewDocsModalOpen] = useState(false)
  const [uploadPriceModalOpen, setUploadPriceModalOpen] = useState(false)
  const [selectedCompanyForPricing, setSelectedCompanyForPricing] =
    useState(null)

  const fetchTableData = () => {
    setIsTableLoading(true)
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll?page=${currentPage}&limit=${pageLimit}`,
        { headers: { Authorization: token } },
      )
      .then((res) => {
        setTableData(res.data.result)
        setTotalCount(res.data.totalRecords)
        setMaxPages(Math.ceil(res.data.totalCounts / pageLimit))
      })
      .finally(() => setIsTableLoading(false))
  }

  const getDataBySearch = () => {
    setIsTableLoading(true)
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll?page=0&limit=${totalCount}&search=${searchValue}`,
        { headers: { Authorization: token } },
      )
      .then((res) => setTableData(res.data.result))
      .finally(() => setIsTableLoading(false))
  }

  useEffect(() => {
    if (editSuccess) {
      if (searchValue === '') {
        fetchTableData()
      } else {
        getDataBySearch()
      }
      setEditSuccess(false)
      setEditBoxOpen(false)
    }
  }, [editSuccess])

  const editHandler = (companyData) => {
    setCompanyEditData(companyData)
    setEditBoxOpen(true)
  }

  const deleteConfHandler = (companyData) => {
    setSelectedCompany(companyData)
    setConfBox(true)
  }

  const openViewDocsModal = (data) => {
    setCompanyDocsData(data)
    setViewDocsModalOpen(true)
  }

  const openUploadPriceModal = (companyData) => {
    setSelectedCompanyForPricing(companyData)
    setUploadPriceModalOpen(true)
  }

  useEffect(() => {
    fetchTableData()
  }, [currentPage])

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/getAll`, {
        headers: { Authorization: token },
      })
      .then((res) => setCategories(res.data.data))
  }, [])

  return (
    <div>
      <CompanyListingModals
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
        uploadPriceModalOpen={uploadPriceModalOpen}
        setUploadPriceModalOpen={setUploadPriceModalOpen}
        selectedCompanyForPricing={selectedCompanyForPricing}
        categories={categories}
      />

      <div className='flex gap-2 justify-center mt-5'>
        <button
          className={styles.bulkdown_button}
          onClick={() => navigate('/companylisting')}
        >
          <IoMdAdd size={24} /> Add Company
        </button>

        <div className={styles.search_bar_wrap}>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder='Search...'
          />
          <IoMdSearch size={25} onClick={getDataBySearch} />
        </div>

        <div className={styles.icons_box}>
          <IoRefresh onClick={fetchTableData} className='' size={25} />
        </div>
        <button
          className={styles.bulkdown_button}
          onClick={() => handleDownload(totalCount)}
        >
          <FaDownload /> Bulk Download
        </button>
      </div>

      {tableData?.length ? (
        <CompanyTable
          tableData={tableData}
          editHandler={editHandler}
          deleteConfHandler={deleteConfHandler}
          openViewDocsModal={openViewDocsModal}
          openUploadPriceModal={openUploadPriceModal}
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
