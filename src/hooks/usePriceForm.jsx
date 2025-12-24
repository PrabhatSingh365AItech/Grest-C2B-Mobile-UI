import { useState, useEffect, useRef } from 'react'
import { isAndroid } from '../utils/platformUtils'

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
  const [aadharNumber, setAadharNumber] = useState('')
  const [isAadharVerified, setIsAadharVerified] = useState(false) // Aadhar verification status
  const [imeinumber, setImeiNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isBillRequired, setIsBillRequired] = useState(false)
  
  // Bottom sheet state for Android
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [currentInputRef, setCurrentInputRef] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)

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
  const categories = JSON.parse(sessionStorage.getItem('Categories'))
  const prod = categories.filter((elem) => elem.categoryCode === Device)

  useEffect(() => {
    const billData = JSON.parse(sessionStorage.getItem('billData'))
    if (billData && billData?.selected[0] === false) {
      setIsBillRequired(true)
    }
  }, [])

  const handleCameraButtonClick = (ref) => {
    if (!ref.current) {
      return
    }
    
    // Show bottom sheet on Android, direct click on other platforms
    if (isAndroid()) {
      setCurrentInputRef(ref)
      setShowBottomSheet(true)
    } else {
      ref.current.click()
    }
  }

  const handleBottomSheetOptionSelect = (option) => {
    setSelectedOption(option)
    setShowBottomSheet(false)
    
    // Update the input attributes and trigger click
    if (currentInputRef && currentInputRef.current) {
      const input = currentInputRef.current
      
      // Set accept attribute based on option
      input.setAttribute('accept', option.accept)
      
      // Set capture attribute if it's camera
      if (option.capture) {
        input.setAttribute('capture', option.capture)
      } else {
        input.removeAttribute('capture')
      }
      
      // Trigger the file input
      setTimeout(() => {
        input.click()
      }, 100)
    }
  }

  const handleBottomSheetClose = () => {
    setShowBottomSheet(false)
    setCurrentInputRef(null)
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
    
    // Bottom sheet (Android)
    showBottomSheet,
    handleBottomSheetOptionSelect,
    handleBottomSheetClose
  }
}
