import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import UploadSummary from './UploadSummary'
import FileUploadForm from './FileUploadForm'
import UploadSpinner from './UploadSpinner'
import { buildCSVAndDownload, generatePreview } from '../utils/bulkUploadUtils'

const BulkUploadModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')
  const [previewData, setPreviewData] = useState([])
  const [previewHeaders, setPreviewHeaders] = useState([])

  const resetState = useCallback(() => {
    setFile(null)
    setIsUploading(false)
    setUploadResult(null)
    setError('')
    clearPreview()
  }, [])

  const clearPreview = () => {
    setPreviewData([])
    setPreviewHeaders([])
  }

  useEffect(() => {
    if (isOpen) {
      resetState()
    }
  }, [isOpen, resetState])

  const handlePreview = (inputFile) => {
    generatePreview(inputFile, setPreviewHeaders, setPreviewData, setError)
  }

  const handleFileChange = (e) => {
    clearPreview()
    const selectedFile = e.target.files[0]

    if (selectedFile) {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        setError('')
        handlePreview(selectedFile)
      } else {
        setError('Invalid file type. Please upload a .csv or .xlsx file.')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setIsUploading(true)
    setError('')
    const token = sessionStorage.getItem('authToken')
    const formData = new FormData()
    formData.append('file', file)

    const config = {
      method: 'post',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/userregistry/bulk-upload`,
      headers: {
        Authorization: token,
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    }

    try {
      const response = await axios.request(config)
      setUploadResult(response.data.result)
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || 'An unexpected error occurred during upload.'
      setError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadSample = () => {
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Password',
      'Mobile Number',
      'Store Name',
      'Role',
      'City',
      'Address',
    ]
    const rows = [
      [
        'John',
        'Doe',
        'john.doe@example.com',
        'Password@1234',
        '9876543210',
        'Store A',
        'Admin',
        'Delhi',
        '123 MG Road',
      ],
      [
        'Jane',
        'Doe',
        'jane.doe@example.com',
        'Password@1234',
        '8765432109',
        'Store B',
        'Sale User',
        'Delhi',
        '123 MG Road',
      ],
    ]
    buildCSVAndDownload(headers, rows, 'sample_user_upload.csv')
  }

  const handleDownloadFailed = () => {
    if (uploadResult?.failedRecords) {
      const headers = [
        'First Name',
        'Last Name',
        'Email',
        'Password',
        'Mobile Number',
        'Store Name',
        'Role',
        'City',
        'Address',
        'Error Message',
      ]
      buildCSVAndDownload(
        headers,
        uploadResult.failedRecords,
        'failed_user_records.csv'
      )
    }
  }

  if (!isOpen) {
    return null
  }

  let content
  if (isUploading) {
    content = <UploadSpinner />
  } else if (uploadResult) {
    content = (
      <UploadSummary
        uploadResult={uploadResult}
        onReset={resetState}
        onClose={onClose}
        onDownloadFailed={handleDownloadFailed}
      />
    )
  } else {
    content = (
      <FileUploadForm
        file={file}
        error={error}
        previewData={previewData}
        previewHeaders={previewHeaders}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        handleDownloadSample={handleDownloadSample}
        isUploading={isUploading}
      />
    )
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <div
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
        className='bg-white rounded-lg p-6 md:p-8 w-full max-w-4xl relative transform transition-all'
      >
        <button
          onClick={onClose}
          className='absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-gray-900'
        >
          ×
        </button>
        <h2 className='text-2xl md:text-3xl font-bold mb-6 text-gray-800 border-b pb-4'>
          Bulk User Upload
        </h2>

        {content}
      </div>
    </div>
  )
}

export default BulkUploadModal
