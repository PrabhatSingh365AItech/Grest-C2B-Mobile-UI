import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'
import { IoMdInformationCircle } from 'react-icons/io'
import toast from 'react-hot-toast'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import CouponTable from '../components/CouponTable'

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

const ConfirmationModal = ({ isOpen, couponCode, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div className='bg-white w-1/2 max-w-lg rounded-lg flex flex-col justify-center items-center p-6 gap-5 text-primary shadow-xl'>
        <IoMdInformationCircle size={80} />
        <h6 className='text-3xl font-bold'>Confirmation!</h6>
        <p className='text-lg font-medium text-slate-500 text-center'>
          {`Are you sure you want to delete coupon "${couponCode || ''}"?`}
        </p>
        <div className='flex flex-row gap-4 mt-4'>
          <button
            onClick={onConfirm}
            className='px-8 py-2 rounded-lg bg-primary text-white
                    font-semibold hover:bg-opacity-90 transition-colors'
          >
            Yes, Delete
          </button>
          <button
            onClick={onCancel}
            className='px-8 py-2 rounded-lg bg-white text-primary
                    border border-primary font-semibold
                    hover:bg-gray-100 transition-colors'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) {
    return null
  }

  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <BeatLoader color='var(--primary-color)' loading={isLoading} size={15} />
    </div>
  )
}

const CouponDetails = () => {
  const token = sessionStorage.getItem('authToken')
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sideMenu, setSideMenu] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    storeName: '',
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  })

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    item: null,
  })
  const debouncedSearch = useDebounce(filters.search, 500)
  const debouncedStoreName = useDebounce(filters.storeName, 500)

  const fetchData = useCallback(
    async (page = 1) => {
      setIsLoading(true)
      try {
        const params = {
          page: page,
          limit: 10,
          couponCode: debouncedSearch,
          storeName: debouncedStoreName,
        }
        const endpoint = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/coupons/list`
        const response = await axios.get(endpoint, {
          headers: { Authorization: token },
          params,
        })
        setData(response.data.data)
        setPagination(response.data.pagination)
      } catch (error) {
        toast.error('Failed to load coupon data.')
      } finally {
        setIsLoading(false)
      }
    },
    [token, debouncedSearch, debouncedStoreName]
  )

  useEffect(() => {
    if (token) {
      fetchData(pagination.currentPage)
    }
  }, [fetchData, pagination.currentPage, token])

  const handleFilterChange = (key, value) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClear = () => {
    setFilters({ search: '', storeName: '' })
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }))
    }
  }

  const handleDeleteRequest = (coupon) => {
    setConfirmModal({ isOpen: true, item: coupon })
  }

  const handleDeleteConfirm = async (couponId) => {
    setConfirmModal({ isOpen: false, item: null })
    const toastId = toast.loading('Deleting coupon...', {
      duration: 15000,
    })
    try {
      const deleteEndpoint = `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/coupons/delete/${couponId}`
      const response = await axios.delete(deleteEndpoint, {
        headers: { Authorization: token },
      })
      toast.success(response.data.message || 'Coupon processed successfully.', {
        id: toastId,
        duration: 8000,
      })
      fetchData(1)
    } catch (error) {
      const errorMsg = `Failed to delete coupon: ${
        error.response?.data?.message || 'Error'
      }`
      toast.error(errorMsg, { id: toastId, duration: 8000 })
    }
  }

  const handleStatusToggle = async (couponId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
    const toastId = toast.loading(`Setting status to ${newStatus}...`)

    // Optimistic UI Update: Change the status in the UI immediately
    setData((prevData) =>
      prevData.map((coupon) =>
        coupon._id === couponId ? { ...coupon, status: newStatus } : coupon
      )
    )

    try {
      const statusUpdateEndpoint = `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/coupons/update/${couponId}`
      await axios.put(
        statusUpdateEndpoint,
        { status: newStatus }, // Send only the status field
        {
          headers: { Authorization: token },
        }
      )

      toast.success(`Coupon status updated to ${newStatus}!`, { id: toastId })
    } catch (error) {
      const statusErrorMsg = `Failed to update status: ${
        error.response?.data?.message || 'Error'
      }`
      toast.error(statusErrorMsg, { id: toastId })
      // Revert the UI change if the API call fails
      setData((prevData) =>
        prevData.map((coupon) =>
          coupon._id === couponId
            ? { ...coupon, status: currentStatus }
            : coupon
        )
      )
    }
  }

  return (
    <div>
      <div className='flex items-center border-b-2 w-screen h-16 py-4 bg-white'>
        <div className='navbar'>
          <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
          <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        couponCode={confirmModal.item?.couponCode}
        onConfirm={() => handleDeleteConfirm(confirmModal.item._id)}
        onCancel={() => setConfirmModal({ isOpen: false, item: null })}
      />

      <LoadingOverlay isLoading={isLoading} />

      <CouponTable
        data={data}
        searchValue={filters.search}
        setSearchValue={(value) => handleFilterChange('search', value)}
        storeValue={filters.storeName}
        setStoreValue={(value) => handleFilterChange('storeName', value)}
        onSearch={() => fetchData(1)}
        onClear={handleClear}
        onDelete={handleDeleteRequest}
        pagination={pagination}
        onStatusToggle={handleStatusToggle}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, currentPage: page }))
        }
      />
    </div>
  )
}

export default CouponDetails
