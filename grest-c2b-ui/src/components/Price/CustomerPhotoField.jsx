import React, { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { FaCamera } from 'react-icons/fa'
import { getStatusIcon } from '../../utils/priceUtils.jsx'
import { FILE_KEYS } from '../../constants/priceConstants'
import { dataURLtoFile } from '../../utils/fileUtils'
import toast from 'react-hot-toast'

const FILE_NAME = 'customerPhoto'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png']
const INPUT_ACCEPT = ACCEPTED_IMAGE_TYPES.join(',')

const VIDEO_CONSTRAINTS = {
  width: 400,
  height: 400,
  facingMode: 'user',
}

const PHOTO_CONTAINER_CLASSES =
  'p-1 mt-4 text-center border-2 justify-between rounded-lg h-[15vh] w-[100vw] md:w-[40vw] relative border-primary shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'
const ACTION_BUTTON_CLASSES =
  'flex flex-col items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100'
const SMALL_BTN_CLASSES =
  'px-2 py-0 mt-1 text-sm text-gray-700 bg-gray-200 rounded-lg'

const resetFileInput = (fileInputRef) => {
  if (fileInputRef?.current) {
    fileInputRef.current.value = null
  }
}

const validateIMEI = (imeinumber, fileInputRef) => {
  if (!imeinumber) {
    toast.error('Please enter IMEI number first')
    resetFileInput(fileInputRef)
    return false
  }
  return true
}

const isValidImageFile = (file) => {
  if (!file) {
    return { ok: false, message: 'No file provided' }
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, message: 'Please upload a JPG or PNG image' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      message: `File size should not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }
  return { ok: true }
}

const getSectionNumber = (prod) => (prod?.[0]?.phoneBillSno || 7) + 1

const PhotoContainer = ({ title = 'Customer Photo', children }) => (
  <div className={PHOTO_CONTAINER_CLASSES}>
    <p className='font-semibold text-center'>{title}</p>
    {children}
  </div>
)

const ActionButton = ({ Icon, onClick, label, title }) => (
  <button
    type='button'
    title={title}
    className={ACTION_BUTTON_CLASSES}
    onClick={onClick}
  >
    <Icon className='text-3xl' />
    <span className='text-xs'>{label}</span>
  </button>
)

const SmallButton = ({ children, onClick }) => (
  <button type='button' className={SMALL_BTN_CLASSES} onClick={onClick}>
    {children}
  </button>
)

/* =========================
   MAIN COMPONENT
   ========================= */

const CustomerPhotoField = ({
  customerPhoto,
  setCustomerPhoto,
  uploadStatus = {},
  uploadIndividualFile,
  imeinumber,
  prod,
  fileInputRef,
  handleCameraButtonClick,
}) => {
  const [showWebcam, setShowWebcam] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const webcamRef = useRef(null)

  const photoStatus = uploadStatus[FILE_KEYS.CUSTOMER_PHOTO]?.status
  const sectionNumber = getSectionNumber(prod)

  // Manage object URL lifecycle for preview
  useEffect(() => {
    if (!customerPhoto) {
      setPreviewUrl(null)
      return undefined
    }
    const url = URL.createObjectURL(customerPhoto)
    setPreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [customerPhoto])

  // Capture from webcam -> convert to File -> upload
  const capture = useCallback(() => {
    if (!validateIMEI(imeinumber, fileInputRef)) {
      return
    }

    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) {
      toast.error('Could not capture photo. Please try again.')
      return
    }

    const file = dataURLtoFile(imageSrc, `${imeinumber}-${FILE_NAME}.jpg`)
    if (file) {
      setCustomerPhoto(file)
      setShowWebcam(false)
      uploadIndividualFile(file, FILE_NAME, file.type, FILE_KEYS.CUSTOMER_PHOTO)
    }
  }, [imeinumber, uploadIndividualFile, setCustomerPhoto])

  // File input change handler (upload from device)
  const onFileSelect = (e) => {
    if (!validateIMEI(imeinumber, fileInputRef)) {
      return
    }
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const { ok, message } = isValidImageFile(file)
    if (!ok) {
      toast.error(message)
      resetFileInput(fileInputRef)
      return
    }

    setCustomerPhoto(file)
    uploadIndividualFile(file, FILE_NAME, file.type, FILE_KEYS.CUSTOMER_PHOTO)
  }

  const clearPhoto = () => {
    setCustomerPhoto(null)
    setShowWebcam(false)
    resetFileInput(fileInputRef)
  }

  const renderWebcamView = () => (
    <div className='w-[100vw] md:w-[40vw] gap-2'>
      <div className='p-1 border-2 border-primary rounded-lg shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat='image/jpeg'
          videoConstraints={VIDEO_CONSTRAINTS}
          mirrored
        />
      </div>
      <div className='flex gap-4 mt-2'>
        <SmallButton onClick={() => setShowWebcam(false)}>Cancel</SmallButton>
        <SmallButton onClick={capture}>Take Snapshot</SmallButton>
      </div>
    </div>
  )

  const renderPhotoPreview = () => (
    <PhotoContainer>
      <div className='relative'>
        <img
          className='w-full h-[60px] object-contain'
          src={previewUrl}
          alt='Customer Photo'
        />
        <div className='absolute top-1 right-1'>
          {getStatusIcon(photoStatus)}
        </div>
      </div>
      <SmallButton onClick={clearPhoto}>Retake / Re-upload</SmallButton>
    </PhotoContainer>
  )

  const renderUploadButtons = () => (
    <PhotoContainer>
      <div className='flex items-center justify-center gap-4 h-[60px]'>
        <ActionButton
          Icon={FaCamera}
          onClick={() => setShowWebcam(true)}
          label='Capture'
          title='Capture with webcam'
        />
        <ActionButton
          Icon={FaCamera}
          onClick={() => handleCameraButtonClick(fileInputRef)}
          label='Upload'
          title='Upload from device'
        />
      </div>
    </PhotoContainer>
  )

  const getContent = () => {
    if (showWebcam) {
      return renderWebcamView()
    }
    if (customerPhoto) {
      return renderPhotoPreview()
    }
    return renderUploadButtons()
  }

  return (
    <div className='flex flex-col adharcard mt-[10px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>{sectionNumber}.</p>
        <div className='flex items-center'>
          <p className='text-base font-medium three'>
            Upload Your Photo (Mandatory){' '}
            <span className='text-red-500'>*</span>
          </p>
        </div>
      </div>

      <p className='mt-2 text-sm text-primary ml-[19px]'>
        Note: Image size should not exceed {MAX_FILE_SIZE / 1024 / 1024}MB
      </p>

      <div className='flex justify-start ml-3 inputAADHAR'>
        <input
          type='file'
          accept={INPUT_ACCEPT}
          onChange={onFileSelect}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        {getContent()}
      </div>
    </div>
  )
}

export default CustomerPhotoField
