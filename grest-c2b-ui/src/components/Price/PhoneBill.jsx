import React from 'react'
import { FaCamera } from 'react-icons/fa'
import { getStatusIcon } from '../../utils/priceUtils.jsx'

const PhoneBill = ({
  handleChange,
  setPhoneBill,
  phoneBackRef,
  handleCameraButtonClick,
  phoneBillRef,
  phoneBill,
  isBillRequired,
  prod,
  uploadStatus,
}) => {
  return (
    <div className='flex flex-col adharcard mt-[10px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>4.</p>
        <div className='flex items-center'>
          <p className='text-base font-medium three'>
            Upload your {prod[0]?.categoryName} bill
            {isBillRequired && <span className='text-red-500'>*</span>}
          </p>
        </div>
      </div>
      <p className='mt-2 text-sm text-primary'>
        Note: Image size should not exceed 2MB
      </p>
      <div className='flex justify-start inputAADHAR'>
        <div className='p-1 mt-4 text-center border-2 justify-between rounded-lg h-[15vh] w-[40vw] relative border-primary shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'>
          <p className='font-semibold text-center'>
            {prod[0]?.categoryName} Bill
          </p>
          <input
            type='file'
            onChange={(e) =>
              handleChange(setPhoneBill, e, 'phoneBill', 'phoneBill')
            }
            style={{ display: 'none' }}
            ref={phoneBillRef}
          />
          <button onClick={() => handleCameraButtonClick(phoneBillRef)}>
            {!phoneBill ? (
              <FaCamera className='text-3xl text-gray-500' />
            ) : (
              <div className='relative'>
                <img
                  className='w-full h-[60px]'
                  src={URL.createObjectURL(phoneBill)}
                  alt='Uploaded file'
                />
                <div className='absolute top-1 right-1'>
                  {getStatusIcon(uploadStatus.phoneBill?.status)}
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhoneBill
