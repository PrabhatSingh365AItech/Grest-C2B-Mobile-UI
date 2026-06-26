import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IoMdAdd, IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import { FaDownload, FaToggleOn, FaToggleOff } from 'react-icons/fa6'
import styles from './CompanyListingDetails.module.css'
import NoDataMessage from '../../components/NoDataMessage'
import CompanyTable from './CompanyTable'
import CompanyListingModals from './CompanyListingModals'
import { handleDownload } from './excelUtils'
import { toast } from 'react-hot-toast'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [pricingFilter, setPricingFilter] = useState(searchParams.get('pricing') || 'all')

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

  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const [pricingStatusMap, setPricingStatusMap] = useState({})
  const [bulkConfirmAction, setBulkConfirmAction] = useState(null)

  const fetchPricingStatuses = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/all?limit=500`,
        { headers: { Authorization: token } }
      )
      const configs = res.data.data || []
      const map = {}
      configs.forEach(c => {
        const companyId = c.companyId?._id || c.companyId
        if (c.isEnabled) {
          map[companyId] = c.slabs?.length ? 'ON' : 'Config Pending'
        } else {
          map[companyId] = 'OFF'
        }
      })
      setPricingStatusMap(map)
    } catch (err) {
      console.error('Failed to fetch pricing statuses', err)
    }
  }

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
      fetchPricingStatuses()
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
    fetchPricingStatuses()
  }, [])

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/getAll`, {
        headers: { Authorization: token },
      })
      .then((res) => setCategories(res.data.data))
  }, [])

  const handleBulkToggle = (isEnabled) => {
    if (selectedIds.length === 0) return
    setBulkConfirmAction(isEnabled)
  }

  const doBulkToggle = async () => {
    if (bulkConfirmAction === null) return
    setIsBulkLoading(true)
    setBulkConfirmAction(null)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/bulk-toggle`,
        { companyIds: selectedIds, isEnabled: bulkConfirmAction },
        { headers: { Authorization: token } }
      )
      toast.success(res.data.message)
      setSelectedIds([])
      fetchTableData()
      fetchPricingStatuses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk operation failed')
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleExportConfig = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/export`,
        { headers: { Authorization: token }, responseType: 'blob' }
      )
      const contentType = res.headers['content-type']
      if (contentType && contentType.includes('json')) {
        const text = await res.data.text()
        const json = JSON.parse(text)
        toast.error(json.message || 'No data to export')
        return
      }
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'dynamic_pricing_config.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Pricing configuration exported successfully')
    } catch (err) {
      const msg = err.response?.data?.message
        ? err.response.data.message
        : err.message || 'Export failed'
      toast.error(msg)
    }
  }
  const sectionTitle = (text) => (
    <span className='font-semibold text-base text-gray-800'>{text}</span>
  )

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

      <div className='flex gap-2 justify-center mt-5 flex-wrap'>
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

        <select
          className='border-2 px-2 py-1 rounded-lg outline-none bg-white'
          value={pricingFilter}
          onChange={(e) => {
            const value = e.target.value
            setPricingFilter(value)
            const params = new URLSearchParams(searchParams)
            if (value === 'all') params.delete('pricing')
            else params.set('pricing', value)
            setSearchParams(params, { replace: true })
          }}
        >
          <option value="all">All</option>
          <option value="ON">Dynamic Pricing: ON</option>
          <option value="OFF">Dynamic Pricing: OFF</option>
          <option value="Config Pending">Config Pending</option>
        </select>

        <div className={styles.icons_box}>
          <IoRefresh onClick={() => { fetchTableData(); fetchPricingStatuses() }} className='' size={25} />
        </div>

        <button
          className={styles.bulkdown_button}
          onClick={handleExportConfig}
        >
          <FaDownload /> Export Pricing Config
        </button>

        <button
          className={styles.bulkdown_button}
          onClick={() => handleDownload(totalCount)}
        >
          <FaDownload /> Bulk Download
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className='flex gap-2 justify-center mt-2 flex-wrap'>
          <button
            onClick={() => handleBulkToggle(true)}
            disabled={isBulkLoading}
            className='bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1'
          >
            <FaToggleOn size={16} /> Enable Dynamic Pricing
          </button>
          <button
            onClick={() => handleBulkToggle(false)}
            disabled={isBulkLoading}
            className='bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1'
          >
            <FaToggleOff size={16} /> Disable Dynamic Pricing
          </button>
          <button
            onClick={() => setSelectedIds([])}
            disabled={isBulkLoading}
            className='bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-50'
          >
            Clear Selection
          </button>
        </div>
      )}

      {bulkConfirmAction !== null && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl'>
            <p className='text-lg font-semibold mb-2'>{bulkConfirmAction ? 'Enable' : 'Disable'} Dynamic Pricing?</p>
            <p className='text-sm text-gray-600 mb-4'>
              This will {bulkConfirmAction ? 'enable' : 'disable'} dynamic pricing for <strong>{selectedIds.length}</strong> selected {selectedIds.length === 1 ? 'company' : 'companies'}. Continue?
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                type='button'
                onClick={() => setBulkConfirmAction(null)}
                className='border-2 border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={doBulkToggle}
                disabled={isBulkLoading}
                className={`font-medium text-sm text-white px-4 py-2 rounded ${bulkConfirmAction ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}
              >
                {isBulkLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tableData?.length ? (
        (() => {
          const enriched = tableData.map(d => ({
            ...d,
            dynamicPricingStatus: pricingStatusMap[d._id] || 'OFF'
          }))
          const filtered = pricingFilter === 'all'
            ? enriched
            : enriched.filter(d => d.dynamicPricingStatus === pricingFilter)
          return (
            <CompanyTable
              tableData={filtered}
              editHandler={editHandler}
              deleteConfHandler={deleteConfHandler}
              openViewDocsModal={openViewDocsModal}
              openUploadPriceModal={openUploadPriceModal}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
              maxPages={maxPages}
              selectedIds={selectedIds}
              onSelectId={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
              onSelectAll={(ids) => setSelectedIds(ids)}
            />
          )
        })()
      ) : (
        <NoDataMessage />
      )}
    </div>
  )
}

export default CompanyListingDetails