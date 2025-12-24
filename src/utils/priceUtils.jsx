import axios from 'axios'
import { CgSpinner } from 'react-icons/cg'
import { UPLOAD_STATUS } from '../constants/priceConstants'
import { Capacitor } from '@capacitor/core'

// ----------------------------
// STATUS ICON UTILITY
// ----------------------------
export const getStatusIcon = (status) => {
  switch (status) {
    case UPLOAD_STATUS.UPLOADING:
      return <CgSpinner className='animate-spin text-blue-500' size={16} />
    case UPLOAD_STATUS.SUCCESS:
      return <span className='text-green-500'>✓</span>
    case UPLOAD_STATUS.ERROR:
      return <span className='text-red-500'>✗</span>
    default:
      return null
  }
}

// ----------------------------
// FILE → BLOB (All platforms)
// ----------------------------
const fileToBlob = async (file) => {
  if (file instanceof Blob || file instanceof File) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(new Blob([reader.result], { type: file.type || 'image/jpeg' }))
    }

    reader.onerror = reject
    reader.onabort = () => reject(new Error('FileReader aborted'))
    reader.readAsArrayBuffer(file)
  })
}

// ----------------------------
// BACKEND FILE UPLOADER (All platforms - iOS, Android, Web)
// ----------------------------
export const fileUploader = async (authToken, file, fileName, fileType) => {
  try {
    console.log('📤 Starting file upload:', {
      fileName,
      fileType,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      endpoint: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/s3/upload-file`
    })

    // Convert file to blob for consistent handling
    const fileBlob = await fileToBlob(file)

    // Create FormData for multipart/form-data upload
    const formData = new FormData()
    formData.append('file', fileBlob, fileName)
    formData.append('fileName', fileName)
    formData.append('fileType', fileType)

    console.log('📋 FormData created:', {
      fileName,
      fileType,
      fileSize: fileBlob.size,
      formDataKeys: Array.from(formData.keys())
    })

    // Upload through backend to avoid CORS issues
    // IMPORTANT: Don't set Content-Type header manually!
    // Axios will automatically set it with the correct boundary for multipart/form-data
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/s3/upload-file`,
      formData,
      {
        headers: {
          Authorization: authToken,
          // DO NOT set 'Content-Type' - let axios set it automatically with boundary
        },
        timeout: 120000, // 2 minutes timeout for large files
      }
    )

    console.log('✅ Upload response received:', {
      status: response.status,
      data: response.data
    })

    // Return file URL from backend response
    const fileUrl = 
      response?.data?.fileUrl ||
      response?.data?.data?.fileUrl ||
      response?.data?.url

    if (!fileUrl) {
      console.error('❌ No file URL in response:', response.data)
      throw new Error('No file URL returned from server')
    }

    console.log('✅ File uploaded successfully:', fileUrl)
    return fileUrl
  } catch (error) {
    console.error('❌ Error uploading file:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    })
    
    // Provide more detailed error message
    if (error.response) {
      const errorMessage = 
        error.response.data?.error || 
        error.response.data?.message || 
        `Upload failed: ${error.response.status} ${error.response.statusText}`
      
      throw new Error(errorMessage)
    }
    
    throw error
  }
}
