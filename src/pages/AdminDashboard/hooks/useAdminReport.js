import { useState, useEffect, useCallback } from 'react'
import {
  getAdminReport,
  downloadAdminReport,
  getCompanies,
} from '../services/adminReportService'
import { downloadExcel } from '../utils/excelUtils'

export const useAdminReport = () => {
  const [tableData, setTableData] = useState({})
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [flag, setFlag] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [fromDateDup, setFromDateDup] = useState(null)
  const [toDateDup, setToDateDup] = useState(null)

  const fetchTableData = useCallback(() => {
    setIsLoading(true)
    const token = sessionStorage.getItem('authToken')
    const queryParams = new URLSearchParams()
    if (searchValue?.trim()) {
      queryParams.append('search', searchValue)
    }
    if (toDateDup) {
      queryParams.append('toDate', toDateDup)
    }
    if (fromDateDup) {
      queryParams.append('fromDate', fromDateDup)
    }
    if (companyFilter) {
      queryParams.append('companyId', companyFilter)
    }

    getAdminReport(token, queryParams.toString())
      .then((res) => {
        setTableData(res.data || {})
      })
      .catch(() => {
        setTableData({
          total: {
            totalAvailableForPickup: 0,
            totalPriceOfferToCustomer: 0,
            totalPicked: 0,
            totalPickedPrice: 0,
            totalPendingForPickup: 0,
            totalPendingForPickupPrice: 0,
          },
          result: [],
        })
      })
      .finally(() => {
        setIsLoading(false)
        setFlag(true)
      })
  }, [fromDateDup, toDateDup, searchValue, companyFilter])

  const handleDownload = () => {
    const token = sessionStorage.getItem('authToken')
    downloadAdminReport(token)
      .then((res) => {
        if (res.data?.result) {
          downloadExcel(res.data.result)
        }
      })
      .catch((err) => console.error('Download Error:', err))
  }

  const fetchCompanies = useCallback(() => {
    const token = sessionStorage.getItem('authToken')
    getCompanies(token)
      .then((res) => {
        setCompanies(res.data.result || [])
      })
      .catch((err) => {
        console.log('Failed to load companies:', err)
      })
  }, [])

  const resetFilters = useCallback(() => {
    setFromDate(null)
    setToDate(null)
    setFromDateDup(null)
    setToDateDup(null)
    setSearchValue('')
    setCompanyFilter('')
    fetchTableData()
  }, [fetchTableData])

  useEffect(() => {
    fetchTableData()
    fetchCompanies()
  }, [fetchTableData, fetchCompanies])

  return {
    tableData,
    companies,
    isLoading,
    flag,
    searchValue,
    setSearchValue,
    companyFilter,
    setCompanyFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    setFromDateDup,
    setToDateDup,
    fetchTableData,
    handleDownload,
    resetFilters,
  }
}
