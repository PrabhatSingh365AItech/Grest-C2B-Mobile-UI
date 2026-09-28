import toast from 'react-hot-toast'
import { FILE_KEYS, UPLOAD_STATUS } from '../constants/priceConstants'

export const getFileMapping = (fileKey, fileStates) => {
  const {
    file,
    idProofBack,
    phoneBill,
    phoneFront,
    phoneBack,
    phoneLeft,
    phoneRight,
    phoneTop,
    phoneBottom
  } = fileStates

  switch (fileKey) {
    case FILE_KEYS.ADHAAR_FRONT:
      return { fileToUpload: file, fileName: FILE_KEYS.ADHAAR_FRONT }
    case FILE_KEYS.ADHAAR_BACK:
      return { fileToUpload: idProofBack, fileName: FILE_KEYS.ADHAAR_BACK }
    case FILE_KEYS.PHONE_BILL:
      return { fileToUpload: phoneBill, fileName: FILE_KEYS.PHONE_BILL }
    case FILE_KEYS.PHONE_FRONT:
      return { fileToUpload: phoneFront, fileName: FILE_KEYS.PHONE_FRONT }
    case FILE_KEYS.PHONE_BACK:
      return { fileToUpload: phoneBack, fileName: FILE_KEYS.PHONE_BACK }
    case FILE_KEYS.PHONE_LEFT:
      return { fileToUpload: phoneLeft, fileName: FILE_KEYS.PHONE_LEFT }
    case FILE_KEYS.PHONE_RIGHT:
      return { fileToUpload: phoneRight, fileName: FILE_KEYS.PHONE_RIGHT }
    case FILE_KEYS.PHONE_TOP:
      return { fileToUpload: phoneTop, fileName: FILE_KEYS.PHONE_TOP }
    case FILE_KEYS.PHONE_BOTTOM:
      return { fileToUpload: phoneBottom, fileName: FILE_KEYS.PHONE_BOTTOM }
    default:
      return { fileToUpload: null, fileName: null }
  }
}

export const retryFailedUploads = async (requiredFiles, uploadStatus, fileStates, uploadIndividualFile) => {
  const failedUploads = requiredFiles.filter(
    (fileKey) =>
      uploadStatus[fileKey]?.status === UPLOAD_STATUS.ERROR ||
      uploadStatus[fileKey]?.status === UPLOAD_STATUS.PENDING
  )

  if (failedUploads.length === 0) {
    return true
  }

  toast.info(`Retrying ${failedUploads.length} failed uploads...`)

  // Retry each failed upload
  for (const fileKey of failedUploads) {
    const { fileToUpload, fileName } = getFileMapping(fileKey, fileStates)

    if (fileToUpload) {
      await uploadIndividualFile(
        fileToUpload,
        fileName,
        fileToUpload.type,
        fileKey
      )
    }
  }

  return false // Still has failures
}
