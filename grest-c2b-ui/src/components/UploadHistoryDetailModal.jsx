import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'
import { IoDownloadOutline } from 'react-icons/io5'

const UploadHistoryDetailModal = ({ isOpen, onClose, uploadJob }) => {
  const [logDetails, setLogDetails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tableHeaders, setTableHeaders] = useState([])

  useEffect(() => {
    if (uploadJob?._id) {
      const fetchLogDetails = async () => {
        setLoading(true)
        setError('')
        try {
          const token = sessionStorage.getItem('authToken')
          const response = await axios.get(
            `${
              import.meta.env.VITE_REACT_APP_ENDPOINT
            }/api/userregistry/bulk-upload/history/${uploadJob._id}`,
            { headers: { Authorization: token } }
          )
          const data = response.data.data
          setLogDetails(data)

          if (data.length > 0 && data[0].rowData) {
            setTableHeaders(Object.keys(data[0].rowData))
          }
        } catch (err) {
          setError(err.response?.data?.msg || 'Failed to fetch log details.')
        } finally {
          setLoading(false)
        }
      }
      fetchLogDetails()
    }
  }, [uploadJob])

  const downloadCSV = (data, filename) => {
    const escapeCsvCell = (cell) => {
      const strCell = String(cell ?? '')
      if (
        strCell.includes(',') ||
        strCell.includes('"') ||
        strCell.includes('\n')
      ) {
        return `"${strCell.replace(/"/g, '""')}"`
      }
      return strCell
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      data.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadFailed = () => {
    const failedLogs = logDetails.filter((log) => log.status === 'Fail')
    if (failedLogs.length > 0) {
      const headers = Object.keys(failedLogs[0].rowData ?? {})
      const dataToDownload = [
        [...headers, 'Error Message'],
        ...failedLogs.map((log) => [
          ...(log.rowData ? Object.values(log.rowData) : []),
          log.errorMessage,
        ]),
      ]
      downloadCSV(dataToDownload, `failed_records_${uploadJob.fileName}`)
    }
  }

  if (!isOpen) {
    return null
  }

  let content
  if (loading) {
    content = (
      <div className='flex justify-center items-center h-full'>
        <BeatLoader color='var(--primary-color)' />
      </div>
    )
  } else if (error) {
    content = (
      <div className='flex justify-center items-center h-full text-red-500'>
        {error}
      </div>
    )
  } else {
    content = (
      <div className='h-full overflow-y-auto border border-primary rounded-lg'>
        <table className='w-full text-sm text-left'>
          <thead className='bg-primary text-white sticky top-0 z-10'>
            <tr>
              <th className='p-2 md:p-3 font-medium'>Row</th>
              <th className='p-2 md:p-3 font-medium'>Status</th>
              {tableHeaders.map((header) => (
                <th key={header} className='p-2 md:p-3 font-medium'>
                  {header}
                </th>
              ))}
              <th className='p-2 md:p-3 font-medium'>Error Message</th>
            </tr>
          </thead>
          <tbody className='bg-white'>
            {logDetails.map((log, index) => {
              const statusClassMap = {
                Success: 'bg-green-100 text-green-700',
                Fail: 'bg-red-100 text-red-700',
              }
              const statusClass =
                statusClassMap[log.status] || 'bg-gray-100 text-gray-600'
              const errorMsg = log.errorMessage || '-'

              return (
                <tr
                  key={log._id}
                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className='p-2 md:p-3 w-16 text-center'>
                    {log.rowNumber}
                  </td>
                  <td className='p-2 md:p-3 w-24 text-center'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  {tableHeaders.map((header) => {
                    const cellValue = log.rowData?.[header] ?? '-'
                    return (
                      <td
                        key={`${log._id}-${header}`}
                        className='p-2 md:p-3 truncate max-w-xs'
                      >
                        {cellValue}
                      </td>
                    )
                  })}
                  <td className='p-2 md:p-3 text-red-600 max-w-md'>
                    {errorMsg}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <div
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 12px' }}
        className='bg-white rounded-lg p-6 md:p-8 w-full max-w-7xl h-[90vh] flex flex-col'
      >
        <div className='flex justify-between items-center border-b pb-4 mb-4'>
          <h2 className='text-2xl font-bold text-gray-800'>
            Upload Log Details
          </h2>
          <button
            onClick={onClose}
            className='text-3xl font-light text-gray-500 hover:text-gray-900'
          >
            ×
          </button>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm'>
          <div>
            <strong className='text-gray-600'>File Name:</strong>
            <p className='truncate'>{uploadJob.fileName}</p>
          </div>
          <div>
            <strong className='text-gray-600'>Status:</strong>
            <p>{uploadJob.status}</p>
          </div>
          <div>
            <strong className='text-gray-600'>Succeeded:</strong>
            <p className='text-green-600 font-semibold'>
              {uploadJob.succeeded}
            </p>
          </div>
          <div>
            <strong className='text-gray-600'>Failed:</strong>
            <p className='text-red-600 font-semibold'>{uploadJob.failed}</p>
          </div>
        </div>

        {uploadJob.failed > 0 && (
          <div className='mb-4'>
            <button
              onClick={handleDownloadFailed}
              className='flex items-center gap-2 font-medium text-sm text-white px-4 py-2 rounded bg-primary hover:bg-opacity-90 transition-colors'
            >
              <IoDownloadOutline size={18} />
              Download Failed Entries
            </button>
          </div>
        )}

        <div className='flex-grow overflow-hidden'>{content}</div>
      </div>
    </div>
  )
}

export default UploadHistoryDetailModal
