import { useState, useEffect, useCallback } from 'react'
import {
  getAdminReport,
  downloadAdminReport,
} from '../services/adminReportService'
import { downloadExcel } from '../utils/excelUtils'

export const useAdminReport = () => {
  const [tableData, setTableData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [flag, setFlag] = useState(false)
  const [searchValue, setSearchValue] = useState('')
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
  }, [fromDateDup, toDateDup, searchValue])

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

  const resetFilters = useCallback(() => {
    setFromDate(null)
    setToDate(null)
    setFromDateDup(null)
    setToDateDup(null)
    setSearchValue('')
    fetchTableData()
  }, [fetchTableData])

  useEffect(() => {
    fetchTableData()
  }, [fetchTableData])

  return {
    tableData,
    isLoading,
    flag,
    searchValue,
    setSearchValue,
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
