import React, { useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import MobileMoldModel from './MobileMoldModel'
import PhotoUploadBox from './PhotoUploadBox'

const PhonePhotos1 = ({
  handleChange,
  handleCameraButtonClick,
  setPhoneFront,
  phoneFront,
  phoneFrontRef,
  phoneBack,
  phoneBackRef,
  setPhoneBack,
  phoneBottom,
  phoneBottomRef,
  setPhoneBottom,
  phoneTop,
  phoneTopRef,
  setPhoneTop,
  phoneLeft,
  phoneLeftRef,
  setPhoneLeft,
  phoneRight,
  phoneRightRef,
  setPhoneRight,
  prod,
  uploadStatus,
}) => {
  const [showHoldModal, setShowHoldModal] = useState(false)

  const photoUploadConfigs = [
    {
      title: `${prod[0]?.categoryName} Front`,
      file: phoneFront,
      fileRef: phoneFrontRef,
      setMethod: setPhoneFront,
      fileName: 'phoneFront',
      fileKey: 'phoneFront',
      statusKey: 'phoneFront',
    },
    {
      title: `${prod[0]?.categoryName} Back`,
      file: phoneBack,
      fileRef: phoneBackRef,
      setMethod: setPhoneBack,
      fileName: 'phoneBack',
      fileKey: 'phoneBack',
      statusKey: 'phoneBack',
    },
    {
      title: `${prod[0]?.categoryName} Left Side`,
      file: phoneLeft,
      fileRef: phoneLeftRef,
      setMethod: setPhoneLeft,
      fileName: 'phoneLeft',
      fileKey: 'phoneLeft',
      statusKey: 'phoneLeft',
    },
    {
      title: `${prod[0]?.categoryName} Right Side`,
      file: phoneRight,
      fileRef: phoneRightRef,
      setMethod: setPhoneRight,
      fileName: 'phoneRight',
      fileKey: 'phoneRight',
      statusKey: 'phoneRight',
    },
    {
      title: `${prod[0]?.categoryName} Top Side`,
      file: phoneTop,
      fileRef: phoneTopRef,
      setMethod: setPhoneTop,
      fileName: 'phoneTop',
      fileKey: 'phoneTop',
      statusKey: 'phoneTop',
    },
    {
      title: `${prod[0]?.categoryName} Bottom Side`,
      file: phoneBottom,
      fileRef: phoneBottomRef,
      setMethod: setPhoneBottom,
      fileName: 'phoneBottom',
      fileKey: 'phoneBottom',
      statusKey: 'phoneBottom',
    },
  ]

  return (
    <div className='flex flex-col adharcard mt-[10px] '>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>6.</p>
        <div className='flex items-center'>
          <p className='text-base font-medium three'>
            {`Upload Your ${prod[0]?.categoryName}'s Images`}{' '}
            <span className='text-red-500'>*</span>
          </p>
          <FaInfoCircle
            className='ml-2 cursor-pointer'
            onClick={() => setShowHoldModal(true)}
          />
        </div>
      </div>
      <p className='mt-2 text-sm text-primary'>
        Note: Image size should not exceed 2MB
      </p>
      <div className='grid grid-cols-2 gap-3 inputAADHAR'>
        {photoUploadConfigs.map((config, index) => (
          <PhotoUploadBox
            key={index}
            title={config.title}
            file={config.file}
            fileRef={config.fileRef}
            handleChange={handleChange}
            setMethod={config.setMethod}
            fileName={config.fileName}
            fileKey={config.fileKey}
            handleCameraButtonClick={handleCameraButtonClick}
            uploadStatus={uploadStatus}
            statusKey={config.statusKey}
          />
        ))}
      </div>
      {showHoldModal && <MobileMoldModel setShowHoldModal={setShowHoldModal} />}
    </div>
  )
}

export default PhonePhotos1
