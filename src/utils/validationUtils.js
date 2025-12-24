import toast from 'react-hot-toast'
import { AADHAR_LENGTH, FILE_KEYS, UPLOAD_STATUS } from '../constants/priceConstants'

export const validateFormData = (formData) => {
  const { aadharNumber, imeinumber, phoneFront, phoneBack, phoneLeft, phoneRight, phoneTop, phoneBottom, phoneBill, isBillRequired } = formData

  // Validate Aadhar number length
  if (aadharNumber.length !== AADHAR_LENGTH) {
    toast.error(`Aadhar number must be exactly ${AADHAR_LENGTH} digits.`)
    return false
  }

  // Validate required fields
  if (
    !imeinumber ||
    !aadharNumber ||
    !phoneFront ||
    !phoneBack ||
    !phoneLeft ||
    !phoneRight ||
    !phoneTop ||
    !phoneBottom ||
    (isBillRequired && !phoneBill)
  ) {
    toast.error(
      'Please fill in all mandatory fields (IMEI/Serial number and device images).'
    )
    return false
  }

  return true
}

export const getRequiredFiles = (isBillRequired) => {
  const requiredFiles = [
    FILE_KEYS.ADHAAR_FRONT,
    FILE_KEYS.ADHAAR_BACK,
    FILE_KEYS.PHONE_FRONT,
    FILE_KEYS.PHONE_BACK,
    FILE_KEYS.PHONE_LEFT,
    FILE_KEYS.PHONE_RIGHT,
    FILE_KEYS.PHONE_TOP,
    FILE_KEYS.PHONE_BOTTOM,
  ]

  if (isBillRequired) {
    requiredFiles.push(FILE_KEYS.PHONE_BILL)
  }

  return requiredFiles
}

export const getFailedUploads = (requiredFiles, uploadStatus) => {
  return requiredFiles.filter(
    (fileKey) => uploadStatus[fileKey]?.status !== UPLOAD_STATUS.SUCCESS
  )
}
