import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { baseUrl } from '../utils/baseUrl'

export function DeleteMyData() {
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [reason, setReason] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [existingRequest, setExistingRequest] = useState(null)
  const navigate = useNavigate()

  // Get userId from Redux store
  const userId = useSelector((state) => {
    return (
      state.user?._id ||
      state.auth?.user?._id ||
      state.user?.id ||
      state.auth?.user?.id
    )
  })

  useEffect(() => {
    // Check if user has existing deletion request
    checkExistingRequest()
  }, [])

  /**
   * Checks if user has pending deletion request
   */
  const checkExistingRequest = async () => {
    try {
      const token =
        sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (!token || !userId) {
        return
      }

      const response = await fetch(`${baseUrl}/api/erasure/status/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Get the first pending request if exists
        if (data.success && data.requests && data.requests.length > 0) {
          const pendingRequest = data.requests.find(
            (req) => req.status === 'PENDING',
          )
          if (pendingRequest) {
            setExistingRequest(pendingRequest)
          }
        }
      }
    } catch (err) {
      console.error('Error checking deletion request:', err)
    }
  }

  /**
   * Handles form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!agreedToTerms) {
      toast.error('Please agree to the terms before proceeding')
      return
    }

    if (!userId) {
      toast.error('User not found. Please log in again.')
      return
    }

    setShowConfirmation(true)
  }

  /**
   * Handles deletion request confirmation
   */
  const handleConfirmDeletion = async () => {
    setLoading(true)

    try {
      const token =
        sessionStorage.getItem('authToken') || localStorage.getItem('authToken')

      if (!userId) {
        throw new Error('User ID not found. Please log in again.')
      }

      const response = await fetch(`${baseUrl}/api/erasure/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          reason: reason || 'User requested data deletion under DPDP Act',
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(
          data.message ||
            'Data deletion request submitted successfully! Data will be permanently deleted after 30 days.',
        )
        setShowConfirmation(false)
        checkExistingRequest() // Refresh to show new request
      } else {
        throw new Error(data.message || 'Failed to submit deletion request')
      }
    } catch (err) {
      console.error('Error submitting deletion request:', err)
      toast.error(err.message || 'Failed to submit deletion request')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles cancellation of existing deletion request
   */
  const handleCancelRequest = async () => {
    if (
      !window.confirm(
        'Are you sure you want to cancel your data deletion request?',
      )
    ) {
      return
    }

    setLoading(true)

    try {
      const token =
        sessionStorage.getItem('authToken') || localStorage.getItem('authToken')

      if (!existingRequest || !existingRequest._id) {
        throw new Error('No active deletion request found')
      }

      const response = await fetch(
        `${baseUrl}/api/erasure/cancel/${existingRequest._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: 'User changed their mind',
          }),
        },
      )

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(
          data.message || 'Data deletion request cancelled successfully',
        )
        setExistingRequest(null)
      } else {
        throw new Error(data.message || 'Failed to cancel deletion request')
      }
    } catch (err) {
      console.error('Error cancelling deletion request:', err)
      toast.error(err.message || 'Failed to cancel deletion request')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Formats date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  // Show existing request status
  if (existingRequest) {
    const scheduledDate = new Date(existingRequest.scheduledDeletionDate)
    const daysRemaining = Math.ceil(
      (scheduledDate - new Date()) / (1000 * 60 * 60 * 24),
    )

    return (
      <div className='min-h-screen bg-gray-50 py-8 px-4'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white rounded-lg shadow-md p-8'>
            {/* Header */}
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-10 h-10 text-yellow-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h1 className='text-3xl font-bold text-gray-800'>
                Pending Deletion Request
              </h1>
            </div>

            {/* Status Info */}
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6'>
              <h2 className='text-lg font-semibold text-yellow-800 mb-2'>
                Request Status: Pending
              </h2>
              <p className='text-yellow-700 mb-4'>
                Your data deletion request has been received and is scheduled
                for processing.
              </p>
              <div className='space-y-2 text-sm text-yellow-800'>
                <p>
                  <strong>Request Date:</strong>{' '}
                  {formatDate(existingRequest.createdAt)}
                </p>
                <p>
                  <strong>Scheduled Deletion:</strong>{' '}
                  {formatDate(existingRequest.scheduledDeletionDate)}
                </p>
                <p>
                  <strong>Days Remaining:</strong> {daysRemaining} days
                </p>
              </div>
            </div>

            {/* What Happens Next */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                What Happens Next?
              </h3>
              <ul className='space-y-2 text-gray-600'>
                <li className='flex items-start'>
                  <svg
                    className='w-5 h-5 text-green-500 mr-2 mt-0.5'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  You have a 30-day grace period to cancel this request
                </li>
                <li className='flex items-start'>
                  <svg
                    className='w-5 h-5 text-green-500 mr-2 mt-0.5'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  After 30 days, all your personal data will be permanently
                  deleted
                </li>
                <li className='flex items-start'>
                  <svg
                    className='w-5 h-5 text-green-500 mr-2 mt-0.5'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  You will receive email confirmation once deletion is complete
                </li>
              </ul>
            </div>

            {/* Cancel Button */}
            <div className='flex gap-4'>
              <button
                onClick={handleCancelRequest}
                disabled={loading}
                className='flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50'
              >
                {loading ? 'Processing...' : 'Cancel Deletion Request'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200'
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show confirmation modal
  if (showConfirmation) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
        <div className='bg-white rounded-lg shadow-xl max-w-lg w-full p-8'>
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-10 h-10 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              Confirm Data Deletion
            </h2>
            <p className='text-gray-600'>
              This action cannot be undone after 30 days
            </p>
          </div>

          <div className='bg-red-50 border border-red-200 rounded p-4 mb-6'>
            <p className='text-sm text-red-800'>
              <strong>Warning:</strong> All your personal data will be
              permanently deleted after 30 days. You have until then to cancel
              this request.
            </p>
          </div>

          <div className='flex gap-4'>
            <button
              onClick={handleConfirmDeletion}
              disabled={loading}
              className='flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50'
            >
              {loading ? 'Processing...' : 'Confirm Deletion'}
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
              className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show deletion request form
  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-lg shadow-md p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              Delete My Data
            </h1>
            <p className='text-gray-600'>
              Exercise your Right to Erasure under DPDP Act 2023
            </p>
          </div>

          {/* Info Box */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8'>
            <h2 className='text-lg font-semibold text-blue-800 mb-2'>
              What data will be deleted?
            </h2>
            <ul className='space-y-2 text-sm text-blue-700'>
              <li>• Personal information (name, email, phone, Aadhaar)</li>
              <li>• Device transaction history and quotes</li>
              <li>• Uploaded documents (Aadhaar, photos, signatures)</li>
              <li>• All associated metadata and records</li>
            </ul>
            <p className='text-sm text-blue-700 mt-4'>
              <strong>Note:</strong> You have a 30-day grace period to cancel
              this request.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Reason for Deletion (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={500}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
                placeholder='Tell us why you want to delete your data (optional, max 500 characters)'
              />
              <p className='text-xs text-gray-500 mt-1'>
                {reason.length}/500 characters
              </p>
            </div>

            <div className='flex items-start'>
              <input
                type='checkbox'
                id='terms'
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className='mt-1 mr-3 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary'
              />
              <label htmlFor='terms' className='text-sm text-gray-700'>
                I understand that this action will permanently delete all my
                personal data after 30 days and that I can cancel this request
                within the grace period.
              </label>
            </div>

            <div className='flex gap-4'>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50'
              >
                Submit Deletion Request
              </button>
              <button
                type='button'
                onClick={() => navigate(-1)}
                className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DeleteMyData
