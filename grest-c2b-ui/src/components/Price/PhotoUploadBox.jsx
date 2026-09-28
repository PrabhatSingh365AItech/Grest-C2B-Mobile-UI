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
        style={{ display: 'none' }}
        ref={fileRef}
      />
      <button onClick={() => handleCameraButtonClick(fileRef)}>
        {!file ? (
          <FaCamera className='text-3xl text-gray-500' />
        ) : (
          <div className='relative'>
            <img
              src={URL.createObjectURL(file)}
              className='h-[60px] w-full'
              alt='Uploaded file'
            />
            <div className='absolute top-1 right-1'>
              {getStatusIcon(uploadStatus[statusKey]?.status)}
            </div>
          </div>
        )}
      </button>
    </div>
  )
}

export default PhotoUploadBox
