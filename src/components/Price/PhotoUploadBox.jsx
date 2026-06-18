import React from 'react'
import { FaCamera } from 'react-icons/fa'
import { getStatusIcon } from '../../utils/priceUtils.jsx'

const PhotoUploadBox = ({
  title,
  file,
  fileRef,
  handleChange,
  setMethod,
  fileName,
  fileKey,
  handleCameraButtonClick,
  uploadStatus,
  statusKey
}) => {
  return (
    <div className='mt-4 p-1 text-center border-2 justify-between rounded-lg h-[15vh] w-[40vw] relative border-primary shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'>
      <p className='text-center font-semibold tracking-tighter'>{title}</p>
      <input
        onChange={(e) => handleChange(setMethod, e, fileName, fileKey)}
        type='file'
        accept='image/*'
        style={{ display: 'none' }}
        ref={fileRef}
      />
      <button onClick={() => handleCameraButtonClick(fileRef)}>
        {file || uploadStatus[statusKey]?.url ? (
          <div className='relative'>
            <img
              className='w-full h-[60px] object-cover'
              src={file ? URL.createObjectURL(file) : uploadStatus[statusKey].url}
              alt='Uploaded file'
            />
            <div className='absolute top-1 right-1 bg-white rounded-full p-0.5 shadow'>
              {getStatusIcon(uploadStatus[statusKey]?.status)}
            </div>
          </div>
        ) : (
          <FaCamera className='text-3xl text-gray-500' />
        )}
      </button>
    </div>
  )
}

export default PhotoUploadBox
