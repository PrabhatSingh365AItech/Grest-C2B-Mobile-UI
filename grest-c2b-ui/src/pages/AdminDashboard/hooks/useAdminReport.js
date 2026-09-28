import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getAdminReport,
  downloadAdminReport,
  getCompanies,
} from '../services/adminReportService'
import { downloadExcel } from '../utils/excelUtils'

// Debounce utility: delay execution until N ms pass without being called again
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timerRef.current)
  }, [value, delay])

  return debouncedValue
}

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

  // Debounce search to 300ms (prevents API call on every keystroke)
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const debouncedFromDateDup = useDebounce(fromDateDup, 300)
  const debouncedToDdateDup = useDebounce(toDateDup, 300)
  const debouncedCompanyFilter = useDebounce(companyFilter, 300)

  const fetchTableData = useCallback(() => {
    setIsLoading(true)
    const token = sessionStorage.getItem('authToken')
    const queryParams = new URLSearchParams()
    if (debouncedSearchValue?.trim()) {
      queryParams.append('search', debouncedSearchValue)
    }
    if (debouncedToDdateDup) {
      queryParams.append('toDate', debouncedToDdateDup)
    }
    if (debouncedFromDateDup) {
      queryParams.append('fromDate', debouncedFromDateDup)
    }
    if (debouncedCompanyFilter) {
      queryParams.append('companyId', debouncedCompanyFilter)
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
  }, [debouncedFromDateDup, debouncedToDdateDup, debouncedSearchValue, debouncedCompanyFilter])

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

  // Fetch companies ONCE on mount (empty dependency array)
  useEffect(() => {
    fetchCompanies()
  }, [])

  // Fetch table data when debounced filters change
  useEffect(() => {
    fetchTableData()
  }, [fetchTableData])

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
