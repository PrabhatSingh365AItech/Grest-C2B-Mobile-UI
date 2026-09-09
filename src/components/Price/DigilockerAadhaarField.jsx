import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { App as CapacitorApp } from '@capacitor/app'
import {
  initiateDigiLockerSession,
  getDigiLockerAccessToken,
  getDigiLockerIssuedFiles,
  downloadDigiLockerXml,
  DIGILOCKER_REDIRECT_URL,
} from '../../services/digilockerAadhaarService'
import ConsentCheckbox from '../ConsentCheckbox'

const DISABLED_BTN = 'bg-gray-400 cursor-not-allowed'
const PINK = 'bg-primary'
const GREEN = 'bg-green-500 cursor-not-allowed'

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return null
    }
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    return JSON.parse(atob(base64))
  } catch (e) {
    console.error('Failed to decode encdata JWT:', e)
    return null
  }
}

const getButtonClass = (
  isVerified,
  isVerificationRequired,
  isInitiating,
  isProcessing,
) => {
  if (isVerified) {
    return GREEN
  }
  if (!isVerificationRequired) {
    return DISABLED_BTN
  }
  if (isInitiating || isProcessing) {
    return DISABLED_BTN
  }
  return PINK
}

// Pulls refid off a callback URL's query string, whether it arrived as a plain
// `refid` param (web) or wrapped in the `encdata` JWT (also sent on native's
// deep-link return).
const extractRefid = (searchParams) => {
  const direct = searchParams.get('refid')
  if (direct) {
    return direct
  }
  const encdata = searchParams.get('encdata')
  if (encdata) {
    const decoded = decodeJwtPayload(encdata)
    return decoded?.data?.refid
  }
  return null
}

const getButtonText = (isVerified, isProcessing, isInitiating) => {
  if (isVerified) {
    return 'Verified via DigiLocker'
  }
  if (isProcessing) {
    return 'Processing...'
  }
  if (isInitiating) {
    return 'Redirecting...'
  }
  return 'Verify via DigiLocker'
}

const DigilockerAadhaarField = ({
  aadharNumber,
  setAadharNumber,
  isVerified,
  setIsVerified,
  isVerificationRequired = true,
  isDevelopmentMode = false,
}) => {
  const [error, setError] = useState('')
  const [isInitiating, setIsInitiating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aadhaarConsent, setAadhaarConsent] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [verifiedAadhaarNumber, setVerifiedAadhaarNumber] = useState('')
  const [hasFailed, setHasFailed] = useState(false)
  const refidRef = useRef('')
  const setRefid = (value) => {
    refidRef.current = value
  }

  // Web: DigiLocker redirects the browser back to this same page with
  // ?refid=... (or ?encdata=...) in the query string.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      return
    }
    const params = new URLSearchParams(window.location.search)
    const callbackRefid = extractRefid(params)

    if (callbackRefid) {
      setRefid(callbackRefid)
      handleDigiLockerCallback(callbackRefid)
    }
  }, [])

  // Native: the in-app browser opened for DigiLocker's auth page is a separate
  // context from the app's WebView, so the callback can't arrive via
  // window.location - DigiLocker instead redirects to our custom scheme
  // (grestc2b://digilocker/callback?...), which the OS hands back to the app
  // as an 'appUrlOpen' event.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return
    }

    const listenerPromise = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      let callbackRefid = null
      try {
        callbackRefid = extractRefid(new URL(url).searchParams)
      } catch (e) {
        console.error('Failed to parse DigiLocker deep link callback:', e)
      }

      if (callbackRefid) {
        Browser.close().catch(() => {})
        setIsInitiating(false)
        setRefid(callbackRefid)
        handleDigiLockerCallback(callbackRefid)
      }
    })

    return () => {
      listenerPromise.then((handle) => handle.remove())
    }
  }, [])

  // Safety net: if the user closes the in-app browser manually (back button,
  // cancel) without ever completing DigiLocker's flow, no appUrlOpen event
  // fires - without this the button would stay stuck on "Redirecting...".
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return
    }

    const listenerPromise = Browser.addListener('browserFinished', () => {
      setIsInitiating(false)
    })

    return () => {
      listenerPromise.then((handle) => handle.remove())
    }
  }, [])

  const handleDigiLockerCallback = async (callbackRefid) => {
    setIsProcessing(true)
    setStatusMessage('Completing DigiLocker verification...')

    try {
      await getDigiLockerAccessToken(callbackRefid)

      const files = await getDigiLockerIssuedFiles(callbackRefid)

      const aadhaarDoc = files?.find(
        (doc) =>
          doc.doctype === 'ADHAR' ||
          doc.name?.toLowerCase().includes('aadhaar'),
      )

      if (!aadhaarDoc) {
        throw new Error('Aadhaar document not found in DigiLocker')
      }

      const kycResponse = await downloadDigiLockerXml(
        callbackRefid,
        aadhaarDoc.uri,
      )

      const maskedNumber = kycResponse?.aadhaarNumber
      if (maskedNumber) {
        setVerifiedAadhaarNumber(maskedNumber)
      }

      setAadharNumber(maskedNumber || 'DigiLocker Verified')
      setIsVerified(true)
      setError('')
      setStatusMessage('Aadhaar verified successfully via DigiLocker!')
      toast.success('Aadhaar verified via DigiLocker!')

      window.history.replaceState({}, '', window.location.pathname)
    } catch (err) {
      console.error('DigiLocker callback error:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to complete DigiLocker verification'
      setError(errorMessage)
      setHasFailed(true)
      toast.error(errorMessage)
      setStatusMessage('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInitiateDigiLocker = async () => {
    if (!aadhaarConsent) {
      toast.error('Please provide consent for Aadhaar collection')
      return
    }

    setIsInitiating(true)
    setError('')
    setHasFailed(false)
    setVerifiedAadhaarNumber('')

    try {
      const sessionId = `DL-${Date.now()}${Math.floor(Math.random() * 1e6)}`
      setRefid(sessionId)

      const sessionResult = await initiateDigiLockerSession(
        sessionId,
        DIGILOCKER_REDIRECT_URL,
      )

      if (!sessionResult?.authorization_url) {
        throw new Error('Failed to get DigiLocker authorization URL')
      }

      setStatusMessage('Redirecting to DigiLocker...')

      if (Capacitor.isNativePlatform()) {
        // Keep the app alive in the background; DigiLocker's redirect back to
        // our custom scheme is caught by the appUrlOpen listener above.
        await Browser.open({ url: sessionResult.authorization_url })
      } else {
        window.location.href = sessionResult.authorization_url
      }
    } catch (err) {
      console.error('Initiate DigiLocker error:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to initiate DigiLocker verification'
      setError(errorMessage)
      toast.error(errorMessage)
      setIsInitiating(false)
    }
  }

  return (
    <div className='flex flex-col eminumber mt-[4px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>2.</p>
        <p className='text-base font-medium three'>
          Aadhaar Verification via DigiLocker
          {isDevelopmentMode ? (
            <span className='text-gray-400 text-sm ml-1'>
              (optional in development)
            </span>
          ) : (
            <span className='text-red-500'>*</span>
          )}
        </p>
      </div>

      {verifiedAadhaarNumber && (
        <div className='flex items-center gap-4 mt-2 ml-[19px]'>
          <div className='flex items-center p-2 border-2 border-gray-300 rounded'>
            <input
              type='text'
              className='w-auto outline-none'
              value={verifiedAadhaarNumber}
              placeholder='Aadhaar No.'
              readOnly
            />
          </div>
        </div>
      )}

      <div className='flex flex-wrap items-center gap-4 mt-2 ml-[19px]'>
        <button
          className={`px-4 py-2 font-bold text-white rounded ${getButtonClass(
            isVerified,
            isVerificationRequired,
            isInitiating,
            isProcessing,
          )}`}
          onClick={handleInitiateDigiLocker}
          disabled={
            !isVerificationRequired || isVerified || isInitiating || isProcessing
          }
        >
          {getButtonText(isVerified, isProcessing, isInitiating)}
        </button>

        {hasFailed && !isVerified && (
          <button
            className='px-4 py-2 font-bold text-white rounded bg-primary hover:opacity-90'
            onClick={handleInitiateDigiLocker}
            disabled={isInitiating || isProcessing}
          >
            Retry
          </button>
        )}

        {!isVerificationRequired && (
          <span className='text-sm text-primary'>
            Note: Aadhaar Verification not required at this time. Please proceed
            ahead.
          </span>
        )}
      </div>

      {statusMessage && (
        <p className='text-green-600 mt-2 text-sm ml-[19px]'>{statusMessage}</p>
      )}

      {error && typeof error === 'string' && (
        <p className='text-primary mt-2 text-sm ml-[19px]'>{error}</p>
      )}

      <div className='mt-4 ml-[19px]'>
        <ConsentCheckbox
          consentType='aadhaar_collection'
          onConsentChange={setAadhaarConsent}
          required={!isDevelopmentMode}
        />
      </div>
    </div>
  )
}

export default DigilockerAadhaarField
