import React from 'react'
import { FaCamera } from 'react-icons/fa'
import { getStatusIcon } from '../../utils/priceUtils.jsx'

const AdharField = ({
  handleChange,
  setFile,
  fileInputRef,
  handleCameraButtonClick,
  file,
  setIdProofBack,
  idProofBack,
  idproofBackRef,
  uploadStatus,
}) => {
  return (
    <div className='flex flex-col adharcard mt-[10px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>3.</p>
        <div className='flex items-center'>
          <p className='text-base font-medium three'>
            {'Upload your Aadhar Card'} <span className='text-red-500'>*</span>
          </p>
        </div>
      </div>
      <p className='mt-2 text-sm text-primary'>
        Note: Image size should not exceed 2MB
      </p>
      <div className='grid grid-cols-2 gap-3 inputAADHAR'>
        <div className='p-1 mt-4 text-center border-2 justify-between rounded-lg h-[15vh] w-[40vw] relative border-primary shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'>
          <p className='font-semibold text-center'>Adhaar(Front)</p>
          <input
            type='file'
            onChange={(e) =>
              handleChange(setFile, e, 'adhaarFront', 'adhaarFront')
            }
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <button onClick={() => handleCameraButtonClick(fileInputRef)}>
            {!file ? (
              <FaCamera className='text-3xl text-gray-500' />
            ) : (
              <div className='relative'>
                <img
                  className='w-full h-[60px]'
                  src={URL.createObjectURL(file)}
                  alt='Uploaded file'
                />
                <div className='absolute top-1 right-1'>
                  {getStatusIcon(uploadStatus.adhaarFront?.status)}
                </div>
              </div>
            )}
          </button>
        </div>
        <div className='p-1 mt-4 text-center border-2 justify-between rounded-lg h-[15vh] w-[40vw] relative border-primary shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'>
          <p className='font-semibold text-center'>Adhaar(Back)</p>
          <input
            type='file'
            onChange={(e) =>
              handleChange(setIdProofBack, e, 'adhaarBack', 'adhaarBack')
            }
            style={{ display: 'none' }}
            ref={idproofBackRef}
          />
          <button onClick={() => handleCameraButtonClick(idproofBackRef)}>
            {!idProofBack ? (
              <FaCamera className='text-3xl text-gray-500' />
            ) : (
              <div className='relative'>
                <img
                  className='w-full h-[60px]'
                  src={URL.createObjectURL(idProofBack)}
                  alt='Uploaded file'
                />
                <div className='absolute top-1 right-1'>
                  {getStatusIcon(uploadStatus.adhaarBack?.status)}
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdharField
