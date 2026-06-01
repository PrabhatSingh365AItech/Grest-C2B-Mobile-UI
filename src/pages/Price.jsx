import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CgSpinner } from 'react-icons/cg'

import PriceHeader from '../components/Price/PriceHeader'
import PriceFormFields from '../components/Price/PriceFormFields'

import { usePriceForm } from '../hooks/usePriceForm'
import { usePriceUpload } from '../hooks/usePriceUpload'
import { IVS_STATUS } from '../services/ivsService'

const pink = 'bg-primary'

const Price = () => {
  const navigate = useNavigate()

  const formState = usePriceForm()
  const {
    uploadStatus,
    handleFileChange,
    uploadAllImages,
    isLoading,
    uploadIndividualFile,
  } = usePriceUpload(formState)

  const {
    imeinumber,
    phoneFront,
    phoneBack,
    phoneLeft,
    phoneRight,
    phoneTop,
    phoneBottom,
    signatureFile,
    customerPhoto,
    ceirImage,
    isAadharVerified,
    handleCameraButtonClick,
  } = formState

  const [imei2, setImei2] = useState('')
  const [imeiVerificationResult, setImeiVerificationResult] = useState(null)

  const isImeiBlocked =
    imeiVerificationResult &&
    (imeiVerificationResult.imei1Status === IVS_STATUS.BLOCKED ||
      imeiVerificationResult.imei1Status === IVS_STATUS.STOLEN)

  const imeiVerified =
    imeiVerificationResult &&
    (imeiVerificationResult.allowTransaction ||
      imeiVerificationResult.imei1Status === IVS_STATUS.UNKNOWN ||
      imeiVerificationResult.imei1Status === IVS_STATUS.ERROR)

  const canSubmit =
    imeinumber &&
    phoneFront &&
    phoneBack &&
    phoneLeft &&
    phoneRight &&
    phoneTop &&
    phoneBottom &&
    signatureFile &&
    customerPhoto &&
    ceirImage &&
    isAadharVerified &&
    imeiVerified &&
    !isImeiBlocked

  const handleImeiVerificationComplete = (result) => {
    setImeiVerificationResult(result)
  }

  return (
    <div className='flex flex-col h-[100dvh] bg-white'>
      <div className='flex-shrink-0'>
        <PriceHeader navigate={navigate} />
      </div>
      <div className='flex-1 overflow-y-auto overflow-x-hidden -webkit-overflow-scrolling-touch'>
        <div className='w-[90%] md:w-[90%] mx-auto pb-4 mb-2'>
          <div className='mt-3 text-center relative'>
            <h1 className='text-2xl font-semibold'>Upload Documents</h1>
            <p className='mt-4 text-gray-600'>
              Regulations require you to upload a national identity card. Don't
              worry, your data will stay safe and private.
            </p>
          </div>
          <PriceFormFields
            formState={formState}
            uploadStatus={uploadStatus}
            handleFileChange={handleFileChange}
            handleCameraButtonClick={handleCameraButtonClick}
            uploadIndividualFile={uploadIndividualFile}
            imei2={imei2}
            setImei2={setImei2}
            onImeiVerificationComplete={handleImeiVerificationComplete}
          />
        </div>
      </div>
      <div className='flex-shrink-0 flex flex-col w-full gap-2 p-4 bg-white border-t-2'>
        {!isAadharVerified && (
          <p className='text-sm text-center text-red-500'>
            Please verify your Aadhar number before submitting
          </p>
        )}
        {isImeiBlocked && (
          <p className='text-sm text-center text-red-500'>
            This device IMEI is reported as{' '}
            {imeiVerificationResult.imei1Status === IVS_STATUS.BLOCKED
              ? 'blocked'
              : 'stolen'}
            . Transaction cannot proceed.
          </p>
        )}
        {imeinumber && !imeiVerificationResult && (
          <p className='text-sm text-center text-amber-500'>
            Please verify IMEI with Sanchar Saathi before submitting
          </p>
        )}
        <div
          onClick={() => canSubmit && uploadAllImages(navigate)}
          className={`relative text-center py-1 px-2 rounded-lg cursor-pointer flex justify-between text-white items-center ${
            canSubmit ? pink : 'cursor-not-allowed bg-gray-400'
          }`}
        >
          {isLoading && (
            <CgSpinner
              size={20}
              className='absolute left-[28%] top-[8px] mt-1 animate-spin'
            />
          )}
          <p className='w-full p-1 text-xl font-medium'>
            {isLoading ? 'Submitting' : 'Submit'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Price
