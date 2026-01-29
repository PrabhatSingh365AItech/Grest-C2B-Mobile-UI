import { useState, useEffect, useCallback } from 'react'
import { generatePreview } from '../utils/bulkUploadUtils'

const ALLOWED_FILE_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export const useBulkUpload = (isOpen) => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')
  const [previewData, setPreviewData] = useState([])
  const [previewHeaders, setPreviewHeaders] = useState([])

  const clearPreview = useCallback(() => {
    setPreviewData([])
    setPreviewHeaders([])
  }, [])

  const resetState = useCallback(() => {
    setFile(null)
    setIsUploading(false)
    setUploadResult(null)
    setError('')
    clearPreview()
  }, [clearPreview])

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

    if (!selectedFile) {
      return
    }

    if (ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setFile(selectedFile)
      setError('')
      handlePreview(selectedFile)
    } else {
      setError('Invalid file type. Please upload a .csv or .xlsx file.')
      setFile(null)
    }
  }

  return {
    file,
    isUploading,
    setIsUploading,
    uploadResult,
    setUploadResult,
    error,
    setError,
    previewData,
    previewHeaders,
    handleFileChange,
    resetState,
  }
}
