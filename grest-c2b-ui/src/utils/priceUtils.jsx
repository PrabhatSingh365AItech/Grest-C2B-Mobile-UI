import axios from 'axios'
import { CgSpinner } from 'react-icons/cg'
import { UPLOAD_STATUS } from '../constants/priceConstants'

// Utility function to get status icon
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

// File uploader function
export const fileUploader = async (authToken, file, fileName, fileType) => {
  try {
    const resURL = await axios.get(
      `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/s3/get-presigned-url`,
      {
        params: {
          fileName: fileName,
          fileType: fileType,
        },
        headers: { Authorization: authToken },
      }
    )
    if (resURL?.data?.url) {
      const presignedUrl = resURL.data.url
      // Create a new axios instance without default headers for S3 upload
      const result = await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': fileType,
        },
        // Don't send authorization header to S3 - presigned URL already contains auth
        transformRequest: [(data, headers) => {
          delete headers.Authorization
          return data
        }],
      })
      console.log('File uploaded successfully:', result)
    }
  } catch (error) {
    console.log('Error uploading file:', error)
    throw error
  }
}
