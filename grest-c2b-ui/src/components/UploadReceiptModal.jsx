import React, { useState } from 'react'
import { IoIosCloseCircle } from 'react-icons/io'
import { FaUpload } from 'react-icons/fa'

const UploadReceiptModal = ({ isOpen, onClose, onUpload, lotCode }) => {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [remarks, setRemarks] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate images and PDF
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/svg+xml'
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF and image files are allowed.')
        setFile(null)
        return
      }
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File exceeds maximum allowed size (5MB).')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      await onUpload(file, remarks)
      // Modal will be closed by parent component on success
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const resetModal = () => {
    setFile(null)
    setError('')
    setRemarks('')
    setIsUploading(false)
  }

  const handleClose = () => {
    if (!isUploading) {
      resetModal()
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center h-full w-full bg-black bg-opacity-50'>
      <div className='bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Upload Payment Receipt
          </h3>
          <button
            onClick={handleClose}
            className='text-gray-500 hover:text-gray-700'
            disabled={isUploading}
          >
            <IoIosCloseCircle size={24} />
          </button>
        </div>

        <p className='text-sm text-gray-600 mb-4'>
          Please upload the payment receipt for <strong>Lot {lotCode}</strong>{' '}
          in PDF or image format.
        </p>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Payment Receipt (PDF or Image, max 5MB)
          </label>
          <div className='relative'>
            <input
              type='file'
              accept='.pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg'
              onChange={handleFileChange}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
              disabled={isUploading}
            />
            <FaUpload className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          </div>
          {file && (
            <p className='text-sm text-green-600 mt-2 flex items-center'>
              <span className='mr-2'>✓</span>
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            UTR Number
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder='Add UTR Number about the payment...'
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none'
            rows='3'
            disabled={isUploading}
          />
        </div>

        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-600'>{error}</p>
          </div>
        )}

        <div className='flex gap-3'>
          <button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className='flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors'
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className='flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadReceiptModal
