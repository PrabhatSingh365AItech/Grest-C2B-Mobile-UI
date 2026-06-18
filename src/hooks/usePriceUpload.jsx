import { useFileUpload } from './useFileUpload'
import { validateFormData, getRequiredFiles, getFailedUploads } from '../utils/validationUtils'
import { submitFormData } from '../utils/formSubmissionUtils'
import { retryFailedUploads } from '../utils/retryUtils'
import toast from 'react-hot-toast'
import { FILE_KEYS, UPLOAD_STATUS } from '../constants/priceConstants'

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
    signatureFile,  // new signature stateA
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

  const uploadAllImages = async (navigate) => {
    setIsLoading(true)

    // Validate form data
    const formData = {
      aadharNumber,
      imeinumber,
      phoneFront: phoneFront || uploadStatus[FILE_KEYS.PHONE_FRONT]?.status === UPLOAD_STATUS.SUCCESS,
      phoneBack: phoneBack || uploadStatus[FILE_KEYS.PHONE_BACK]?.status === UPLOAD_STATUS.SUCCESS,
      phoneLeft: phoneLeft || uploadStatus[FILE_KEYS.PHONE_LEFT]?.status === UPLOAD_STATUS.SUCCESS,
      phoneRight: phoneRight || uploadStatus[FILE_KEYS.PHONE_RIGHT]?.status === UPLOAD_STATUS.SUCCESS,
      phoneTop: phoneTop || uploadStatus[FILE_KEYS.PHONE_TOP]?.status === UPLOAD_STATUS.SUCCESS,
      phoneBottom: phoneBottom || uploadStatus[FILE_KEYS.PHONE_BOTTOM]?.status === UPLOAD_STATUS.SUCCESS,
      phoneBill: phoneBill || uploadStatus[FILE_KEYS.PHONE_BILL]?.status === UPLOAD_STATUS.SUCCESS,
      isBillRequired,
      signatureFile: signatureFile || uploadStatus[FILE_KEYS.SIGNATURE]?.status === UPLOAD_STATUS.SUCCESS, // add signature state to validation
      ceirImage: ceirImage || uploadStatus[FILE_KEYS.CEIR]?.status === UPLOAD_STATUS.SUCCESS, // add CEIR image state to validation
    }

    if (!validateFormData(formData)) {
      setIsLoading(false)
      return
    }

    // Get required files and check upload status
    const requiredFiles = getRequiredFiles(isBillRequired)
    requiredFiles.push(FILE_KEYS.SIGNATURE); // Add signature to required files
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

    const success = await submitFormData(submissionData, token, navigate)
    if (success) {
      localStorage.removeItem('price_aadharNumber')
      localStorage.removeItem('price_isAadharVerified')
      localStorage.removeItem('price_imeinumber')
      localStorage.removeItem('price_uploadStatus')
      localStorage.removeItem('signatureBase64')
      localStorage.removeItem('price_aadhaarConsent')
    }
    setIsLoading(false)
  }

  return {
    uploadStatus,
    uploadIndividualFile,
    handleFileChange,
    uploadAllImages,
    isLoading
  }
}
