import React from 'react'
import { IoCloudUploadOutline } from 'react-icons/io5'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const UploadProgress = ({ progress = 0, fileName = '' }) => {
  const getStatusMessage = () => {
    if (progress < 50) {
      return 'Uploading file to server...'
    } else if (progress < 95) {
      return 'Upload in progress...'
    } else if (progress >= 95 && progress < 100) {
      return 'Upload complete, processing data...'
    } else {
      return 'Processing price sheet data...'
    }
  }

  const getStatusColor = () => {
    if (progress >= 95) {
      return 'text-green-600'
    }
    return 'text-gray-600'
  }

  return (
    <div className='flex flex-col items-center justify-center h-64 px-8'>
      {progress >= 95 ? (
        <AiOutlineLoading3Quarters
          className='text-primary mb-4 animate-spin'
          size={60}
        />
      ) : (
        <IoCloudUploadOutline className='text-primary mb-4' size={60} />
      )}

      <h3 className='text-lg font-semibold text-gray-800 mb-2'>
        {progress >= 95 ? 'Processing Price Sheet' : 'Uploading Price Sheet'}
      </h3>

      {fileName && <p className='text-sm text-gray-600 mb-4'>{fileName}</p>}

      {/* Progress Bar */}
      <div className='w-full max-w-md mb-4'>
        <div className='relative pt-1'>
          <div className='flex mb-2 items-center justify-between'>
            <div>
              <span className='text-xs font-semibold inline-block text-primary'>
                {progress >= 95 ? 'Processing' : 'Upload Progress'}
              </span>
            </div>
            <div className='text-right'>
              <span className='text-xs font-semibold inline-block text-primary'>
                {progress >= 95 ? '' : `${Math.round(progress)}%`}
              </span>
            </div>
          </div>
          {progress < 95 ? (
            <div className='overflow-hidden h-3 mb-4 text-xs flex rounded bg-gray-200'>
              <div
                style={{ width: `${progress}%` }}
                className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300 ease-out'
              />
            </div>
          ) : (
            <div className='overflow-hidden h-3 mb-4 text-xs flex rounded bg-gray-200'>
              <div className='w-full h-full bg-primary animate-pulse' />
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      <p
        className={`text-sm ${getStatusColor()} ${progress < 95 ? 'animate-pulse' : 'font-semibold'}`}
      >
        {getStatusMessage()}
      </p>

      {progress >= 95 && (
        <p className='text-xs text-gray-500 mt-2'>
          This may take a few moments for large files...
        </p>
      )}
    </div>
  )
}

export default UploadProgress
