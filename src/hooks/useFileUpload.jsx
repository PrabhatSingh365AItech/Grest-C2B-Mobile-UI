import { useState } from 'react'
import toast from 'react-hot-toast'
import { FILE_KEYS, UPLOAD_STATUS } from '../constants/priceConstants'
import { fileUploader } from '../utils/priceUtils.jsx'
import imageCompression from 'browser-image-compression'

export const useFileUpload = (token, imeinumber) => {
  const [uploadStatus, setUploadStatus] = useState({
    [FILE_KEYS.ADHAAR_FRONT]: { status: UPLOAD_STATUS.PENDING, progress: 0 },
    [FILE_KEYS.ADHAAR_BACK]: { status: UPLOAD_STATUS.PENDING, progress: 0 },
    [FILE_KEYS.PHONE_BILL]: { status: UPLOAD_STATUS.PENDING, progress: 0 },
    [FILE_KEYS.PHONE_FRONT]: { status: UPLOAD_STATUS.PENDING, progress: 0 },
    [FILE_KEYS.PHONE_BACK]: { status: UPLOAD_STATUS.PENDING, progress: 0 },
    [FILE_KEYS.PHONE_LEFT]: { status: UPLOAD_STATUS.PENDING, progress: 0 },
    [FILE_KEYS.PHONE_RIGHT]: { status: UPLOAD_STATUS.PENDING, progress: 0 },
    [FILE_KEYS.PHONE_TOP]: { status: UPLOAD_STATUS.PENDING, progress: 0 },
    [FILE_KEYS.PHONE_BOTTOM]: { status: UPLOAD_STATUS.PENDING, progress: 0 },
    [FILE_KEYS.SIGNATURE]: { status: UPLOAD_STATUS.PENDING, progress: 0 }, // <-- Added new signature
    [FILE_KEYS.CUSTOMER_PHOTO]: { status: UPLOAD_STATUS.PENDING, progress: 0 }, // <-- Added customer photo
    [FILE_KEYS.CEIR]: { status: UPLOAD_STATUS.PENDING, progress: 0 }, // <-- Added new CEIR
  })

  const uploadIndividualFile = async (
    fileToUpload,
    fileName,
    fileType,
    fileKey
  ) => {
    if (!fileToUpload || !imeinumber) {
      toast.error('Please enter IMEI number first')
      return
    }

    // Added check for signature
    if (!imeinumber && fileKey === FILE_KEYS.SIGNATURE) {
      toast.error('Please enter IMEI number before saving signature')
      return
    }

    // Update status to uploading
    setUploadStatus((prev) => ({
      ...prev,
      [fileKey]: { status: UPLOAD_STATUS.UPLOADING, progress: 0 },
    }))

    try {
      let fileToProcess = fileToUpload
      let finalFileType = fileType

      // Compress only images, skip PDFs and other file types
      if (fileToUpload.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 1, // Maximum file size in MB
          maxWidthOrHeight: 1920, // Maximum width or height
          useWebWorker: true, // Use web worker for non-blocking compression
          fileType: 'image/jpeg', // Always convert to JPEG for consistency
          initialQuality: 0.8, // Good balance between quality and size
        }

        try {
          const originalSizeMB = (fileToUpload.size / (1024 * 1024)).toFixed(2)
          const compressedBlob = await imageCompression(fileToUpload, options)
          const compressedSizeMB = (compressedBlob.size / (1024 * 1024)).toFixed(2)

          console.log(
            `Image compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB`
          )

          // Convert blob to File object with proper name and type
          const originalFileName = fileToUpload.name || 'image.jpg'
          const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '')
          fileToProcess = new File(
            [compressedBlob],
            `${fileNameWithoutExt}.jpg`,
            { type: 'image/jpeg' }
          )
          finalFileType = 'image/jpeg'
        } catch (compressionError) {
          console.warn(
            'Compression failed, using original file:',
            compressionError
          )
          // Fallback to original file if compression fails
          fileToProcess = fileToUpload
        }
      }

      const fullFileName = `${imeinumber}-${fileName}`
      await fileUploader(token, fileToProcess, fullFileName, finalFileType)

      // Update status to success
      setUploadStatus((prev) => ({
        ...prev,
        [fileKey]: { status: UPLOAD_STATUS.SUCCESS, progress: 100 },
      }))

      console.log(`${fileName} uploaded successfully!`)

      toast.success(`${fileName} uploaded successfully!`)
    } catch (error) {
      // Update status to error
      setUploadStatus((prev) => ({
        ...prev,
        [fileKey]: { status: UPLOAD_STATUS.ERROR, progress: 0 },
      }))

      toast.error(`Failed to upload ${fileName}. Please try again.`)
      console.error(`Upload error for ${fileName}:`, error)
    }
  }

  const handleFileChange = (setMethod, e, fileName, fileKey) => {
    const doc = e.target.files[0]
    setMethod(doc)

    // Upload file immediately after selection
    if (doc) {
      uploadIndividualFile(doc, fileName, doc.type, fileKey)
    }
  }

  return {
    uploadStatus,
    setUploadStatus,
    uploadIndividualFile,
    handleFileChange,
  }
}
