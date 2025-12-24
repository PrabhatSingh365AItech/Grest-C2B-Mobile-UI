import axios from 'axios'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'

export const handleDownloadReport = async ({
  token,
  filters,
  setIsDownloading,
  debouncedSearch,
  setToastIdRef,
}) => {
  const toastId = toast.loading(
    <div className='flex items-center gap-2'>
      <BeatLoader color='#3B82F6' size={8} />
      <span>Generating your report...</span>
    </div>
  )
  setToastIdRef(toastId)

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/quoteTracking/dashboard/download`,
      {
        headers: { Authorization: token },
        params: { dateRange: filters.dateRange, search: debouncedSearch, storeId: filters.storeId },
        responseType: 'blob',
      }
    )

    const blob = new Blob([response.data], { type: 'text/csv' })
    saveAs(
      blob,
      `quote_tracking_report_${new Date().toISOString().split('T')[0]}.csv`
    )

    toast.success(
      <div className='flex items-center gap-2'>
        <FaCheckCircle className='text-green-500' />
        <b>Report downloaded successfully!</b>
      </div>,
      { id: toastId }
    )
  } catch (error) {
    console.error('Failed to download report:', error)

    const errorMessage = (
      <div className='flex items-center gap-2'>
        <FaExclamationTriangle className='text-red-500' />
        <b>
          {error.response?.status === 404
            ? 'Download failed: No data available.'
            : 'An unexpected error occurred.'}
        </b>
      </div>
    )
    toast.error(errorMessage, { id: toastId })
  } finally {
    setIsDownloading(false)
  }
}
