import { useFileUpload } from './useFileUpload'
import { validateFormData, getRequiredFiles, getFailedUploads } from '../utils/validationUtils'
import { submitFormData } from '../utils/formSubmissionUtils'
import { retryFailedUploads } from '../utils/retryUtils'
import toast from 'react-hot-toast'
import { FILE_KEYS } from '../constants/priceConstants'
import { pickImageFile, isNativeApp } from '../utils/pickImage'
import { Camera } from '@capacitor/camera'

export const usePriceUpload = (formState) => {
  const {
    file,
    idProofBack,
    phoneBill,
    phoneFront,
    phoneBack,
    phoneLeft,
    phoneRight,
    phoneTop,
    phoneBottom,
    signatureFile,  // new signature state
    customerPhoto,  // new customer photo state
    ceirImage,  // new CEIR image state
    aadharNumber,
    imeinumber,
    isBillRequired,
    isLoading,
    setIsLoading,
    leadsubmitDATA,
    savedOtpData,
    token
  } = formState

  // Use file upload hook
  const { uploadStatus, uploadIndividualFile, handleFileChange } = useFileUpload(token, imeinumber)

  const handleCameraButtonClick = async (setMethod, fileName, fileKey, fileRef) => {
    try {
      if (isNativeApp()) {
        const permission = await Camera.checkPermissions()
        if (permission.camera !== 'granted') {
          await Camera.requestPermissions({ permissions: ['camera'] })
        }

        const file = await pickImageFile()
        if (!file) {
          return
        }

        handleFileChange(setMethod, { target: { files: [file] } }, fileName, fileKey)
        return
      }

      if (fileRef?.current) {
        fileRef.current.click()
      }
    } catch (err) {
      const message = err?.message || ''
      if (message.toLowerCase().includes('cancel')) {
        return
      }
      console.error('Error picking image:', err)
      toast.error('Could not select image. Please try again.')
    }
  }

  const uploadAllImages = async (navigate) => {
    setIsLoading(true)

    // Validate form data
    const formData = {
      aadharNumber,
      imeinumber,
      phoneFront,
      phoneBack,
      phoneLeft,
      phoneRight,
      phoneTop,
      phoneBottom,
      phoneBill,
      isBillRequired,
      signatureFile, // add signature state to validation
      customerPhoto, // add customer photo state to validation
      ceirImage, // add CEIR image state to validation
    }

    if (!validateFormData(formData)) {
      setIsLoading(false)
      return
    }

    // Get required files and check upload status
    const requiredFiles = getRequiredFiles(isBillRequired)
    requiredFiles.push(FILE_KEYS.SIGNATURE); // Add signature to required files
    requiredFiles.push(FILE_KEYS.CUSTOMER_PHOTO); // Add customer photo to required files
    requiredFiles.push(FILE_KEYS.CEIR); // Add CEIR to required files

    const failedUploads = getFailedUploads(requiredFiles, uploadStatus)

    if (failedUploads.length > 0) {
      // Try to retry failed uploads
      const fileStates = {
        file,
        idProofBack,
        phoneBill,
        phoneFront,
        phoneBack,
        phoneLeft,
        phoneRight,
        phoneTop,
        phoneBottom,
        signatureFile, // add signature state for retry
        customerPhoto, // add customer photo state for retry
        ceirImage // add CEIR image state for retry
      }

      const stillHasFailures = await retryFailedUploads(
        requiredFiles,
        uploadStatus,
        fileStates,
        uploadIndividualFile
      )

      if (stillHasFailures) {
        toast.error(
          `Please ensure all files are uploaded successfully. ${
            failedUploads.length
          } files still pending: ${failedUploads.join(', ')}`
        )
        setIsLoading(false)
        return
      }

      // Check again after retry
      const stillFailed = getFailedUploads(requiredFiles, uploadStatus)

      if (stillFailed.length > 0) {
        toast.error(
          `Still ${
            stillFailed.length
          } files pending after retry: ${stillFailed.join(', ')}`
        )
        setIsLoading(false)
        return
      }
    }

    // Submit form data
    const submissionData = {
      imeinumber,
      leadsubmitDATA,
      savedOtpData,
      aadharNumber
    }

    await submitFormData(submissionData, token, navigate)
    setIsLoading(false)
  }

  return {
    uploadStatus,
    uploadIndividualFile,
    handleFileChange,
    handleCameraButtonClick,
    uploadAllImages,
    isLoading
  }
}
