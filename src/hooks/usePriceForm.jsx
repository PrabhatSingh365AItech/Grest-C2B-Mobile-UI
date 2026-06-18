import { useState, useEffect, useRef } from 'react'
import { Camera } from '@capacitor/camera'
import { dataURLtoFile } from '../utils/fileUtils'

export const usePriceForm = () => {
  // Form state
  const [file, setFile] = useState(null)
  const [idProofBack, setIdProofBack] = useState(null)
  const [phoneBill, setPhoneBill] = useState(null)
  const [phoneFront, setPhoneFront] = useState(null)
  const [phoneBack, setPhoneBack] = useState(null)
  const [phoneLeft, setPhoneLeft] = useState(null)
  const [phoneRight, setPhoneRight] = useState(null)
  const [phoneTop, setPhoneTop] = useState(null)
  const [phoneBottom, setPhoneBottom] = useState(null)
  const [signatureFile, setSignatureFile] = useState(null) // Added new signature file state
  const [customerPhoto, setCustomerPhoto] = useState(null) // Added new customer photo
  const [ceirImage, setCeirImage] = useState(null) // Added new CEIR image state
  const [aadharNumber, setAadharNumber] = useState(() => localStorage.getItem('price_aadharNumber') || '')
  const [isAadharVerified, setIsAadharVerified] = useState(() => localStorage.getItem('price_isAadharVerified') === 'true')
  const [imeinumber, setImeiNumber] = useState(() => localStorage.getItem('price_imeinumber') || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isBillRequired, setIsBillRequired] = useState(false)

  // Refs
  const fileInputRef = useRef(null)
  const idproofBackRef = useRef(null)
  const phoneBillRef = useRef(null)
  const phoneFrontRef = useRef(null)
  const phoneBackRef = useRef(null)
  const phoneLeftRef = useRef(null)
  const phoneRightRef = useRef(null)
  const phoneTopRef = useRef(null)
  const phoneBottomRef = useRef(null)
  const customerPhotoRef = useRef(null)
  const ceirImageRef = useRef(null)

  // Get session data
  const leadsubmitDATA = JSON.parse(sessionStorage.getItem('responsedatadata'))
  const savedOtpData = JSON.parse(localStorage.getItem('otpData'))
  const token = sessionStorage.getItem('authToken')
  const Device = sessionStorage.getItem('DeviceType')
  const categories = JSON.parse(sessionStorage.getItem('Categories')) || []
  const prod = categories.filter((elem) => elem.categoryCode === Device)

  useEffect(() => {
    const billData = JSON.parse(sessionStorage.getItem('billData'))
    if (billData && billData?.selected[0] === false) {
      setIsBillRequired(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('price_aadharNumber', aadharNumber)
  }, [aadharNumber])

  useEffect(() => {
    localStorage.setItem('price_isAadharVerified', isAadharVerified.toString())
  }, [isAadharVerified])

  useEffect(() => {
    localStorage.setItem('price_imeinumber', imeinumber)
  }, [imeinumber])

  // Restore signature base64 from sessionStorage on mount
  useEffect(() => {
    const savedSigBase64 = sessionStorage.getItem('signatureBase64')
    if (savedSigBase64 && !signatureFile) {
      try {
        const fileObj = dataURLtoFile(savedSigBase64, 'signature.png')
        if (fileObj) {
          setSignatureFile(fileObj)
        }
      } catch (e) {
        console.error('Failed to restore signature file from base64:', e)
      }
    }
  }, [])

  const handleCameraButtonClick = async (ref) => {
    if (ref && ref.current) {
      try {
        const permission = await Camera.checkPermissions()
        if (permission.camera !== 'granted') {
          const request = await Camera.requestPermissions()
          if (request.camera !== 'granted') {
            console.warn('Camera permission not granted, file picker may not show camera option')
          }
        }
      } catch (err) {
        console.error('Error requesting camera permission:', err)
      }
      ref.current.click()
    } else {
      console.error('Camera button click failed: ref is not valid', ref)
    }
  }

  return {
    // Form state
    file,
    setFile,
    idProofBack,
    setIdProofBack,
    phoneBill,
    setPhoneBill,
    phoneFront,
    setPhoneFront,
    phoneBack,
    setPhoneBack,
    phoneLeft,
    setPhoneLeft,
    phoneRight,
    setPhoneRight,
    phoneTop,
    setPhoneTop,
    phoneBottom,
    setPhoneBottom,
    signatureFile, //Added new signatureFile
    setSignatureFile, //Added new signature state function
    customerPhoto, //Added new customerPhoto
    setCustomerPhoto, //Added new customerPhoto state
    ceirImage, //Added new CEIR image
    setCeirImage, //Added new CEIR image state
    aadharNumber,
    setAadharNumber,
    isAadharVerified, //Added Aadhar verification status
    setIsAadharVerified, //Added Aadhar verification status setter
    imeinumber,
    setImeiNumber,
    isLoading,
    setIsLoading,
    isBillRequired,

    // Refs
    fileInputRef,
    idproofBackRef,
    phoneBillRef,
    phoneFrontRef,
    phoneBackRef,
    phoneLeftRef,
    phoneRightRef,
    phoneTopRef,
    phoneBottomRef,
    customerPhotoRef,
    ceirImageRef,

    // Session data
    leadsubmitDATA,
    savedOtpData,
    token,
    prod,

    // Handlers
    handleCameraButtonClick,
  }
}
