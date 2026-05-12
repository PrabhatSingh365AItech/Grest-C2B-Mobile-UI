import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { canViewFullPII } from '../utils/piiMasking'
import { baseUrl } from '../utils/baseUrl'

export function SecureDocumentViewer({
  documentType,
  leadId,
  altText = 'Secure Document',
  className = '',
  width = 'auto',
  height = 'auto',
  showPlaceholder = true,
}) {
  const [documentUrl, setDocumentUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)

  // Get user role from Redux store
  const userRole = useSelector((state) => {
    return state.user?.role || state.auth?.user?.role || state.auth?.role
  })

  // Get auth token from Redux store
  const authToken = useSelector((state) => {
    return state.user?.token || state.auth?.token || state.auth?.user?.token
  })

  useEffect(() => {
    // Check role-based access
    const hasAccess = canViewFullPII(userRole)

    if (!hasAccess) {
      setAccessDenied(true)
      setLoading(false)

      // return empty cleanup to keep return type consistent
      return () => {}
    }

    // Fetch pre-signed URL from backend
    fetchSecureDocumentUrl()

    // Set up refresh timer (refresh before expiry at 14 minutes)
    const refreshInterval = setInterval(
      () => {
        fetchSecureDocumentUrl()
      },
      14 * 60 * 1000,
    )

    return () => {
      clearInterval(refreshInterval)
    }
  }, [documentType, leadId, userRole])

  const fetchSecureDocumentUrl = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${baseUrl}/api/v1/documents/presigned-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            leadId,
            documentType,
          }),
        },
      )

      if (!response.ok) {
        if (response.status === 403) {
          setAccessDenied(true)
          throw new Error('Access denied')
        }
        throw new Error('Failed to fetch document')
      }

      const data = await response.json()

      if (data.success && data.presignedUrl) {
        setDocumentUrl(data.presignedUrl)
        setAccessDenied(false)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Error fetching secure document:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div
        className={`secure-document-viewer loading ${className}`}
        style={{ width, height }}
      >
        <div className='flex items-center justify-center h-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      </div>
    )
  }

  // Access denied state
  if (accessDenied) {
    if (!showPlaceholder) {
      return null
    }

    return (
      <div
        className={`secure-document-viewer access-denied ${className}`}
        style={{ width, height }}
      >
        <div className='flex flex-col items-center justify-center h-full p-4 bg-gray-100 rounded'>
          <svg
            className='w-12 h-12 text-gray-400 mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            />
          </svg>
          <p className='text-sm text-gray-600 text-center'>Access Restricted</p>
          <p className='text-xs text-gray-500 text-center mt-1'>
            Insufficient permissions to view this document
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className={`secure-document-viewer error ${className}`}
        style={{ width, height }}
      >
        <div className='flex flex-col items-center justify-center h-full p-4 bg-red-50 rounded'>
          <svg
            className='w-12 h-12 text-red-400 mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <p className='text-sm text-red-600 text-center'>
            Failed to load document
          </p>
          <button
            onClick={fetchSecureDocumentUrl}
            className='mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Success state - display document
  return (
    <div className={`secure-document-viewer ${className}`}>
      <img
        src={documentUrl}
        alt={altText}
        style={{ width, height }}
        className='rounded'
        onError={() => setError('Failed to load image')}
      />
    </div>
  )
}

SecureDocumentViewer.propTypes = {
  documentType: PropTypes.oneOf([
    'aadhaar_front',
    'aadhaar_back',
    'signature',
    'photo',
    'device_photo_front',
    'device_photo_back',
    'device_photo_sides',
    'bill',
    'ceir_screenshot',
  ]).isRequired,
  leadId: PropTypes.string.isRequired,
  altText: PropTypes.string,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showPlaceholder: PropTypes.bool,
}

export default SecureDocumentViewer
