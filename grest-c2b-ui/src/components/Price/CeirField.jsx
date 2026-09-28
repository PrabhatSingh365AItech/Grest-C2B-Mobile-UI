import React from 'react'
import { FaCamera } from 'react-icons/fa'
import { getStatusIcon } from '../../utils/priceUtils.jsx'

const CeirField = ({
  handleChange,
  setCeirImage,
  handleCameraButtonClick,
  ceirImageRef,
  ceirImage,
  uploadStatus,
}) => {
  return (
    <div className='flex flex-col adharcard mt-[10px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>5.</p>
        <div className='flex items-center'>
          <p className='text-base font-medium three'>
            Upload your CEIR image <span className='text-red-500'>*</span>
          </p>
        </div>
      </div>
      <p className='mt-2 text-sm text-primary'>
        Note: Image size should not exceed 2MB
      </p>
      <div className='flex justify-start inputAADHAR'>
        <div className='p-1 mt-4 text-center border-2 justify-between rounded-lg h-[15vh] w-[40vw] relative border-primary shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'>
          <p className='font-semibold text-center'>CEIR Image</p>
          <input
            type='file'
            onChange={(e) =>
              handleChange(setCeirImage, e, 'ceir', 'ceir')
            }
            style={{ display: 'none' }}
            ref={ceirImageRef}
          />
          <button onClick={() => handleCameraButtonClick(ceirImageRef)}>
            {!ceirImage ? (
              <FaCamera className='text-3xl text-gray-500' />
            ) : (
              <div className='relative'>
                <img
                  className='w-full h-[60px]'
                  src={URL.createObjectURL(ceirImage)}
                  alt='Uploaded file'
                />
                <div className='absolute top-1 right-1'>
                  {getStatusIcon(uploadStatus.ceir?.status)}
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CeirField
