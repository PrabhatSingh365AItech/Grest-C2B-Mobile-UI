import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CgSpinner } from 'react-icons/cg'
import toast from 'react-hot-toast'
import axios from 'axios'

// Components
import PriceHeader from '../components/Price/PriceHeader'
import PriceFormFields from '../components/Price/PriceFormFields'
import ImagePickerBottomSheet from '../components/Price/ImagePickerBottomSheet'

// Hooks
import { usePriceForm } from '../hooks/usePriceForm'
import { usePriceUpload } from '../hooks/usePriceUpload'

// Utils
import { fileUploader } from '../utils/priceUtils'

// Test image
import testImage from '../assets/51.jpg'

const pink = 'bg-primary'

const Price = () => {
  const navigate = useNavigate()
  const [debugLoading, setDebugLoading] = useState(false)

  // Form State
  const formState = usePriceForm()
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
    showBottomSheet,
    handleBottomSheetOptionSelect,
    handleBottomSheetClose,
    token,
  } = formState

  // Upload Hook
  const {
    uploadStatus,
    handleFileChange,
    uploadAllImages,
    isLoading,
    uploadIndividualFile,
  } = usePriceUpload(formState)

  // DEBUG: Test Upload with Local Image
  const testLocalImageUpload = async () => {
    console.log('=== DEBUG: Starting test image upload ===')
    setDebugLoading(true)

    try {
      const response = await fetch(testImage)
      const blob = await response.blob()

      const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' })

      await fileUploader(token, file, 'test-debug-image.jpg', 'image/jpeg')

      toast.success('Debug upload successful!')
    } catch (error) {
      console.error(error)
      toast.error(`Debug upload failed: ${error.message}`)
    } finally {
      setDebugLoading(false)
    }
  }

  return (
    <div className='flex flex-col h-[100dvh] bg-white'>
      <div className='flex-shrink-0'>
        <PriceHeader navigate={navigate} />
      </div>

      {/* SCROLLABLE BODY */}
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
          />
        </div>
      </div>

      {/* BOTTOM FIXED BUTTON */}
      <div className='flex-shrink-0 flex flex-col w-full gap-2 p-4 bg-white border-t-2'>
        {!isAadharVerified && (
          <p className='text-sm text-center text-red-500'>
            Please verify your Aadhar number before submitting
          </p>
        )}

        <div
          onClick={() => uploadAllImages(navigate)}
          className={`relative text-center py-1 px-2 rounded-lg cursor-pointer flex justify-between text-white items-center ${
            !imeinumber ||
            !phoneFront ||
            !phoneBack ||
            !phoneLeft ||
            !phoneRight ||
            !phoneTop ||
            !phoneBottom ||
            !signatureFile ||
            !customerPhoto ||
            !ceirImage ||
            !isAadharVerified
              ? 'cursor-not-allowed bg-gray-400'
              : pink
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

      {/* IMAGE PICKER BOTTOM SHEET */}
      <ImagePickerBottomSheet
        isOpen={showBottomSheet}
        onClose={handleBottomSheetClose}
        onSelectOption={handleBottomSheetOptionSelect}
      />
    </div>
  )
}

export default Price
