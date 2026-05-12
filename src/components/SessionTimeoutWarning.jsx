import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export function SessionTimeoutWarning({
  sessionTimeout = 30,
  warningTime = 2,
}) {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(warningTime * 60) // seconds
  const navigate = useNavigate()

  const idleTimerRef = useRef(null)
  const warningTimerRef = useRef(null)
  const countdownIntervalRef = useRef(null)

  // Convert minutes to milliseconds
  const sessionTimeoutMs = sessionTimeout * 60 * 1000
  const warningTimeMs = warningTime * 60 * 1000
  const idleTimeMs = sessionTimeoutMs - warningTimeMs

  useEffect(() => {
    // Start idle timer on mount
    startIdleTimer()

    // Set up activity listeners
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleUserActivity)
    })

    // Cleanup on unmount
    return () => {
      clearAllTimers()
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleUserActivity)
      })
    }
  }, [])

  const startIdleTimer = () => {
    clearAllTimers()

    // Start idle timer - triggers warning after idle period
    idleTimerRef.current = setTimeout(() => {
      showTimeoutWarning()
    }, idleTimeMs)
  }

  const showTimeoutWarning = () => {
    setShowWarning(true)
    setCountdown(warningTime * 60)

    // Start countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Start warning timer - auto logout after warning period
    warningTimerRef.current = setTimeout(() => {
      handleTimeout()
    }, warningTimeMs)
  }

  const handleUserActivity = () => {
    if (!showWarning) {
      startIdleTimer()
    }
  }

  const handleExtendSession = () => {
    setShowWarning(false)
    clearAllTimers()
    startIdleTimer()
  }

  const handleTimeout = () => {
    clearAllTimers()
    performLogout()
  }

  const performLogout = () => {
    // Clear all storage
    localStorage.clear()
    sessionStorage.clear()

    // Clear all cookies (if any)
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    })

    // Redirect to login page
    navigate('/')
  }

  const clearAllTimers = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
  }

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Don't render anything if warning not shown
  if (!showWarning) {
    return null
  }

  // Render warning modal
  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6'>
        {/* Warning Icon */}
        <div className='flex justify-center mb-4'>
          <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center'>
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
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className='text-2xl font-bold text-center text-gray-800 mb-2'>
          Session Expiring Soon
        </h2>

        {/* Message */}
        <p className='text-center text-gray-600 mb-4'>
          Your session will expire due to inactivity. You will be automatically
          logged out in:
        </p>

        {/* Countdown */}
        <div className='text-center mb-6'>
          <div className='text-5xl font-bold text-red-600'>
            {formatCountdown(countdown)}
          </div>
          <p className='text-sm text-gray-500 mt-1'>minutes remaining</p>
        </div>

        {/* Info message */}
        <div className='bg-blue-50 border border-blue-200 rounded p-3 mb-6'>
          <p className='text-sm text-blue-800'>
            <strong>Security Notice:</strong> This timeout helps protect your
            sensitive data from unauthorized access as per DPDP compliance
            requirements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button
            onClick={handleExtendSession}
            className='flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded transition duration-200'
          >
            Stay Logged In
          </button>
          <button
            onClick={handleTimeout}
            className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded transition duration-200'
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionTimeoutWarning
