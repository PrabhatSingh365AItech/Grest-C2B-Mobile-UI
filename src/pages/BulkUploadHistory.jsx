import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import UploadHistoryDetailModal from '../components/UploadHistoryDetailModal'

const BulkUploadHistory = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  })

  const [selectedJob, setSelectedJob] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchHistory = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const token = sessionStorage.getItem('authToken')
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/userregistry/bulk-upload/history?page=${page}&limit=10`,
        { headers: { Authorization: token } }
      )
      setHistory(response.data.data)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch upload history.')
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory(1)
  }, [fetchHistory])

  const handleRowClick = (job) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  // Handler for changing pages
  const handlePageChange = (newPage) => {
    if (
      newPage > 0 &&
      newPage <= pagination.totalPages &&
      newPage !== pagination.currentPage
    ) {
      fetchHistory(newPage)
    }
  }

  let mainContent
  if (loading) {
    mainContent = (
      <div className='flex justify-center items-center h-64'>
        <BeatLoader color='var(--primary-color)' />
      </div>
    )
  } else if (error) {
    mainContent = (
      <div className='text-center py-10 text-red-500 bg-red-50 rounded-lg'>
        {error}
      </div>
    )
  } else {
    mainContent = (
      <>
        <div className='overflow-x-auto'>
          <table className='w-full border border-primary'>
            <thead className='bg-primary text-white'>
              <tr>
                <th className='p-2 text-sm md:p-3 md:text-base text-left'>
                  File Name
                </th>
                <th className='p-2 text-sm md:p-3 md:text-base'>Category</th>
                <th className='p-2 text-sm md:p-3 md:text-base'>Upload Date</th>
                <th className='p-2 text-sm md:p-3 md:text-base'>Status</th>
                <th className='p-2 text-sm md:p-3 md:text-base'>Succeeded</th>
                <th className='p-2 text-sm md:p-3 md:text-base'>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {history.map((job, index) => {
                const rowBg = index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                const rowClassName = `${rowBg} hover:bg-blue-50 cursor-pointer`
                return (
                  <tr
                    key={job._id}
                    className={rowClassName}
                    onClick={() => handleRowClick(job)}
                  >
                    <td className='p-2 text-sm md:p-3 md:text-base'>
                      {job.fileName}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {job.category}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {new Date(job.createdAt).toLocaleString('en-GB')}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {job.status}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base text-green-600 font-semibold'>
                      {job.succeeded}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base text-red-600 font-semibold'>
                      {job.failed}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {history.length === 0 && (
            <p className='text-center py-8 text-gray-500'>
              No upload history found.
            </p>
          )}
        </div>

        {pagination.totalRecords > 0 && pagination.totalPages > 1 && (
          <div className='flex justify-between items-center mt-6'>
            <span className='text-sm text-gray-600'>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className='flex gap-2'>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className='font-medium text-sm text-white p-2 rounded bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed'
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className='font-medium text-sm text-white py-2 px-4 rounded bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className='min-h-screen pb-8 bg-[#F5F4F9]'>
      <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />

      <UploadHistoryDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        uploadJob={selectedJob}
      />

      <div
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
        className='bg-white max-w-7xl mx-auto mt-8 p-6 md:p-8 rounded-lg'
      >
        <h1 className='text-3xl font-bold text-gray-800 border-b pb-4 mb-6'>
          Bulk Upload History
        </h1>

        {mainContent}
      </div>
    </div>
  )
}

export default BulkUploadHistory
