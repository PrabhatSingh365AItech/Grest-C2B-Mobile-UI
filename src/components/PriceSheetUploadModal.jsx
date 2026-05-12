import React, { useState } from 'react'
import { generatePreview } from '../utils/bulkUploadUtils'
import { IoCloudUploadOutline } from 'react-icons/io5'
import UploadProgress from './UploadProgress'
import PreviewTable from './PreviewTable'
import { downloadPriceSheetSample } from '../utils/priceSheetSample'

const PriceSheetUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  title,
  description,
  isUploading,
  uploadProgress,
}) => {
  const [file, setFile] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [previewData, setPreviewData] = useState([])
  const [previewHeaders, setPreviewHeaders] = useState([])
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      generatePreview(selectedFile, setPreviewHeaders, setPreviewData, setError)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(file, selectedCategory)
    setFile(null)
    setSelectedCategory('')
    setPreviewData([])
    setPreviewHeaders([])
  }

  const handleClose = () => {
    setFile(null)
    setSelectedCategory('')
    setPreviewData([])
    setPreviewHeaders([])
    setError('')
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed top-0 left-0 z-48 flex items-center justify-center w-full h-full bg-black bg-opacity-50 p-4'>
      <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto'>
        {!isUploading && (
          <button
            onClick={handleClose}
            className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold'
            type='button'
          >
            ×
          </button>
        )}

        <h2 className='text-xl font-semibold mb-4 text-gray-800'>{title}</h2>

        {description && (
          <p className='text-sm text-gray-600 mb-4'>{description}</p>
        )}

        {isUploading ? (
          <UploadProgress
            progress={uploadProgress || 0}
            fileName={file?.name}
          />
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                <option value=''>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat?._id} value={cat?.categoryCode}>
                    {cat?.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className='mb-4 p-4 border border-dashed rounded-lg bg-gray-50'>
              <p className='text-sm text-gray-600 mb-2'>
                Download the sample template to ensure your data is in the
                correct format.
              </p>
              <button
                type='button'
                onClick={downloadPriceSheetSample}
                className='text-blue-600 hover:text-blue-800 text-sm font-semibold inline-flex items-center gap-1'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                Download Sample Excel
              </button>
            </div>

            <div>
              <div className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-primary transition-colors'>
                <IoCloudUploadOutline className='text-gray-400' size={50} />
                <label
                  htmlFor='priceSheetFile'
                  className='mt-2 cursor-pointer font-medium text-primary hover:text-primary-dark'
                >
                  <span>Select a .csv or .xlsx file</span>
                  <input
                    type='file'
                    id='priceSheetFile'
                    accept='.xlsx, .xls, .csv'
                    onChange={handleFileChange}
                    className='sr-only'
                    required
                  />
                </label>
                {file && (
                  <p className='mt-2 text-sm text-gray-500'>{file.name}</p>
                )}
              </div>

              {error && (
                <p className='mt-4 text-sm text-red-600 text-center'>{error}</p>
              )}

              <PreviewTable headers={previewHeaders} data={previewData} />
            </div>

            <div className='flex gap-3 pt-4'>
              <button
                type='submit'
                disabled={isUploading || !file}
                className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type='button'
                onClick={handleClose}
                className='flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors'
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default PriceSheetUploadModal
