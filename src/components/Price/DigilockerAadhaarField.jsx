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
import { AADHAR_LENGTH } from '../../constants/priceConstants'

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

// Each handler's logic lives in its own top-level factory (rather than
// nested directly inside the hook) purely to keep the hook itself short -
// same exact behavior as before, just relocated.

const createHandleDigiLockerCallback = ({
  setIsProcessing,
  setStatusMessage,
  setVerifiedAadhaarNumber,
  setAadharNumber,
  setIsVerified,
  setError,
  setHasFailed,
}) => async (callbackRefid) => {
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

const createHandleInitiateDigiLocker = ({
  aadhaarConsent,
  setIsInitiating,
  setError,
  setHasFailed,
  setVerifiedAadhaarNumber,
  setIsManualEntry,
  setManualAadharNumber,
  setAadharVerificationReason,
  setIsVerified,
  setAadharNumber,
  setHasAttemptedBefore,
  setStatusMessage,
  setRefid,
}) => async () => {
  if (!aadhaarConsent) {
    toast.error('Please provide consent for Aadhaar collection')
    return
  }

  sessionStorage.setItem('digilockerAttempted', 'true')
  setHasAttemptedBefore(true)

  setIsInitiating(true)
  setError('')
  setHasFailed(false)
  setVerifiedAadhaarNumber('')
  setIsManualEntry(false)
  setManualAadharNumber('')
  setAadharVerificationReason('')
  // A fresh DigiLocker attempt invalidates any earlier manual entry -
  // without this, a retry that fails before redirecting (e.g. the
  // session-initiate call itself errors) would leave isVerified stuck
  // true from the old manual submission while isManualEntry is now
  // false, making the button falsely show green "Verified via
  // DigiLocker" right next to the error message.
  setIsVerified(false)
  setAadharNumber('')

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
    setHasFailed(true)
    toast.error(errorMessage)
    setIsInitiating(false)
  }
}

const createHandleManualAadharChange = (setManualAadharNumber) => (e) => {
  const value = e.target.value.replace(/\D/g, '')
  setManualAadharNumber(value)
}

const createHandleManualSubmit = ({
  manualAadharNumber,
  reasonInput,
  setAadharNumber,
  setVerifiedAadhaarNumber,
  setAadharVerificationReason,
  setIsManualEntry,
  setIsVerified,
  setError,
  setShowReasonModal,
}) => () => {
  const cleaned = manualAadharNumber.replace(/\D/g, '')
  if (!cleaned) {
    toast.error('Please enter your Aadhaar number before submitting.')
    return
  }
  if (cleaned.length !== AADHAR_LENGTH) {
    toast.error(`Aadhaar number must be exactly ${AADHAR_LENGTH} digits.`)
    return
  }
  if (!reasonInput.trim()) {
    toast.error('Please provide a reason for manual Aadhaar entry')
    return
  }

  setAadharNumber(cleaned)
  setVerifiedAadhaarNumber(cleaned)
  setAadharVerificationReason(reasonInput.trim())
  setIsManualEntry(true)
  setIsVerified(true)
  setError('')
  setShowReasonModal(false)
  toast.success('Reason submitted successfully')
}

const createHandleOpenReasonModal = ({
  aadhaarConsent,
  manualAadharNumber,
  setShowReasonModal,
}) => () => {
  if (!aadhaarConsent) {
    toast.error('Please provide consent for Aadhaar collection')
    return
  }
  const cleaned = manualAadharNumber.replace(/\D/g, '')
  if (!cleaned) {
    toast.error('Please enter your Aadhaar number before submitting.')
    return
  }
  if (cleaned.length !== AADHAR_LENGTH) {
    toast.error(`Aadhaar number must be exactly ${AADHAR_LENGTH} digits.`)
    return
  }
  setShowReasonModal(true)
}

// Web: DigiLocker redirects the browser back to this same page with
// ?refid=... (or ?encdata=...) in the query string.
const createWebCallbackMountEffect = (handleDigiLockerCallback, setRefid) => () => {
  if (Capacitor.isNativePlatform()) {
    return
  }
  const params = new URLSearchParams(window.location.search)
  const callbackRefid = extractRefid(params)

  if (callbackRefid) {
    setRefid(callbackRefid)
    handleDigiLockerCallback(callbackRefid)
  }
}

// Native: the in-app browser opened for DigiLocker's auth page is a separate
// context from the app's WebView, so the callback can't arrive via
// window.location - DigiLocker instead redirects to our custom scheme
// (grestc2b://digilocker/callback?...), which the OS hands back to the app
// as an 'appUrlOpen' event.
const createNativeAppUrlOpenEffect = (
  handleDigiLockerCallback,
  setIsInitiating,
  setRefid,
) => () => {
  if (!Capacitor.isNativePlatform()) {
    return undefined
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
}

// Safety net: if the user closes the in-app browser manually (back button,
// cancel) without ever completing DigiLocker's flow, no appUrlOpen event
// fires - without this the button would stay stuck on "Redirecting...".
const createBrowserFinishedSafetyEffect = (setIsInitiating) => () => {
  if (!Capacitor.isNativePlatform()) {
    return undefined
  }

  const listenerPromise = Browser.addListener('browserFinished', () => {
    setIsInitiating(false)
  })

  return () => {
    listenerPromise.then((handle) => handle.remove())
  }
}

// Web only: DigiLocker's redirect there is a real, full-page navigation
// away and back (on native the in-app Browser overlay is a separate
// context and the app's own WebView never unloads, so this can't happen).
// That makes the web page eligible for the browser's back-forward cache
// (bfcache): pressing the native Back/Forward buttons can restore this
// exact page instance frozen in time, complete with whichever Aadhaar
// record happened to be verified in it, instead of a fresh mount.
// Detect that restoration and reset verification state so a stale/old
// record is never shown as already verified for what should be a new flow.
// Also resets isInitiating/isProcessing: without these two, closing or
// cancelling DigiLocker mid-flow (native browser Back, before finishing -
// relevant when this runs as a plain web page rather than the native app)
// restores this page frozen with isInitiating still true from the click
// that started the redirect - permanently disabling the button
// ("Redirecting...") and, since isManualFlow also checks these two flags,
// hiding the manual fallback too. A dead end with nothing left to click.
const createBfcacheResetEffect = (setters) => () => {
  if (Capacitor.isNativePlatform()) {
    return undefined
  }

  const handlePageShow = (event) => {
    if (!event.persisted) {
      return
    }
    const {
      setIsVerified,
      setAadharNumber,
      setVerifiedAadhaarNumber,
      setStatusMessage,
      setError,
      setHasFailed,
      setRefid,
      setIsManualEntry,
      setManualAadharNumber,
      setAadharVerificationReason,
      setShowReasonModal,
      setReasonInput,
      setIsInitiating,
      setIsProcessing,
    } = setters
    setIsVerified(false)
    setAadharNumber('')
    setVerifiedAadhaarNumber('')
    setStatusMessage('')
    setError('')
    setHasFailed(false)
    setRefid('')
    setIsManualEntry(false)
    setManualAadharNumber('')
    setAadharVerificationReason('')
    setShowReasonModal(false)
    setReasonInput('')
    setIsInitiating(false)
    setIsProcessing(false)
  }
  window.addEventListener('pageshow', handlePageShow)
  return () => window.removeEventListener('pageshow', handlePageShow)
}

// All state, effects and handlers for the field live here, so the
// component itself only has to worry about rendering.
const useDigilockerAadhaarField = ({
  setAadharNumber,
  isVerified,
  setIsVerified,
  setAadharVerificationReason,
  isVerificationRequired,
}) => {
  const [error, setError] = useState('')
  const [isInitiating, setIsInitiating] = useState(false)
  // Starting this as a plain `false` leaves a one-render gap on a fresh
  // page load coming back from DigiLocker (the web-fallback path):
  // hasAttemptedBefore is already true (read from sessionStorage
  // immediately), but isProcessing would only flip true once the mount
  // effect below runs and calls handleDigiLockerCallback - which happens
  // after the first paint. In that gap, isManualFlow's guard sees
  // isProcessing still false and lets the manual box flash in for a frame
  // before the callback takes over. Checking the URL here closes that gap
  // immediately. Native's own callback path (appUrlOpen) isn't affected -
  // the component never remounts there, so this only matters for web.
  const [isProcessing, setIsProcessing] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return !!(params.get('refid') || params.get('encdata'))
  })
  const [aadhaarConsent, setAadhaarConsent] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [verifiedAadhaarNumber, setVerifiedAadhaarNumber] = useState('')
  const [hasFailed, setHasFailed] = useState(false)
  const [isManualEntry, setIsManualEntry] = useState(false)
  const [manualAadharNumber, setManualAadharNumber] = useState('')
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [reasonInput, setReasonInput] = useState('')
  // Persists across a remount (e.g. user navigates back to a previous
  // screen, then forward again to this one) so that once DigiLocker has
  // been attempted at least once, the manual fallback stays available on
  // every later attempt too - even if that later attempt doesn't itself
  // hit an explicit error (e.g. the user simply abandoned/cancelled
  // DigiLocker without completing it). Cleared as soon as the lead is
  // successfully submitted (see usePriceUpload.jsx), so the next lead
  // always starts fresh - or on logout.
  const [hasAttemptedBefore, setHasAttemptedBefore] = useState(
    () => sessionStorage.getItem('digilockerAttempted') === 'true',
  )
  const refidRef = useRef('')
  const setRefid = (value) => {
    refidRef.current = value
  }

  const handleDigiLockerCallback = createHandleDigiLockerCallback({
    setIsProcessing,
    setStatusMessage,
    setVerifiedAadhaarNumber,
    setAadharNumber,
    setIsVerified,
    setError,
    setHasFailed,
  })

  useEffect(
    createWebCallbackMountEffect(handleDigiLockerCallback, setRefid),
    [],
  )

  useEffect(
    createNativeAppUrlOpenEffect(
      handleDigiLockerCallback,
      setIsInitiating,
      setRefid,
    ),
    [],
  )

  useEffect(createBrowserFinishedSafetyEffect(setIsInitiating), [])

  useEffect(
    createBfcacheResetEffect({
      setIsVerified,
      setAadharNumber,
      setVerifiedAadhaarNumber,
      setStatusMessage,
      setError,
      setHasFailed,
      setRefid,
      setIsManualEntry,
      setManualAadharNumber,
      setAadharVerificationReason,
      setShowReasonModal,
      setReasonInput,
      setIsInitiating,
      setIsProcessing,
    }),
    [],
  )

  const handleInitiateDigiLocker = createHandleInitiateDigiLocker({
    aadhaarConsent,
    setIsInitiating,
    setError,
    setHasFailed,
    setVerifiedAadhaarNumber,
    setIsManualEntry,
    setManualAadharNumber,
    setAadharVerificationReason,
    setIsVerified,
    setAadharNumber,
    setHasAttemptedBefore,
    setStatusMessage,
    setRefid,
  })

  const handleManualAadharChange = createHandleManualAadharChange(
    setManualAadharNumber,
  )

  const handleManualSubmit = createHandleManualSubmit({
    manualAadharNumber,
    reasonInput,
    setAadharNumber,
    setVerifiedAadhaarNumber,
    setAadharVerificationReason,
    setIsManualEntry,
    setIsVerified,
    setError,
    setShowReasonModal,
  })

  const handleOpenReasonModal = createHandleOpenReasonModal({
    aadhaarConsent,
    manualAadharNumber,
    setShowReasonModal,
  })

  // True whenever the manual fallback is in play - verification off for
  // this company, DigiLocker failed/errored, or this is a repeat attempt
  // (the user already went through "Verify via DigiLocker" at least once
  // before, e.g. navigated back and came here again).
  // hasAttemptedBefore only counts once the current attempt is actually
  // settled (not while isInitiating/isProcessing): it's set the instant
  // the button is clicked, before the redirect even happens, and stays
  // set through the callback processing after returning from DigiLocker -
  // without this guard the manual box would flash in during those windows
  // even on a click that's still in flight or about to succeed.
  const isManualFlow =
    !isVerificationRequired ||
    hasFailed ||
    (hasAttemptedBefore && !isInitiating && !isProcessing)
  // The DigiLocker button/row only ever reflects a real DigiLocker
  // verification - a manual entry doesn't turn it green/"submitted" or
  // disable it; it's left exactly as it looked before the manual submit.
  const displayVerified = isVerified && !isManualEntry
  // hasAttemptedBefore flips true the instant "Verify via DigiLocker" is
  // clicked - including on a click that goes on to succeed. So a genuine,
  // just-completed DigiLocker verification can have isManualFlow true too
  // by the time the page reloads with the result. The read-only verified
  // display must win in that case, or the box would wrongly render as the
  // empty, editable manual input instead of the real verified number.
  const showVerifiedReadOnly = displayVerified && !!verifiedAadhaarNumber
  const showManualInput = isManualFlow && !showVerifiedReadOnly

  return {
    error,
    isInitiating,
    isProcessing,
    setAadhaarConsent,
    statusMessage,
    verifiedAadhaarNumber,
    hasFailed,
    isManualEntry,
    manualAadharNumber,
    showReasonModal,
    setShowReasonModal,
    reasonInput,
    setReasonInput,
    handleInitiateDigiLocker,
    handleManualAadharChange,
    handleManualSubmit,
    handleOpenReasonModal,
    displayVerified,
    showVerifiedReadOnly,
    showManualInput,
  }
}

const AadhaarInputRow = ({
  showVerifiedReadOnly,
  showManualInput,
  verifiedAadhaarNumber,
  manualAadharNumber,
  onManualChange,
  onOpenReasonModal,
}) => (
  <div className='flex flex-col mt-2 ml-[19px]'>
    <div className='flex items-center gap-4'>
      <div className='flex items-center p-2 border-2 border-gray-300 rounded'>
        <input
          type='text'
          className='w-auto outline-none'
          value={showVerifiedReadOnly ? verifiedAadhaarNumber : manualAadharNumber}
          placeholder={showVerifiedReadOnly ? 'Aadhaar No.' : 'Enter Aadhaar Number'}
          onChange={showVerifiedReadOnly ? undefined : onManualChange}
          readOnly={showVerifiedReadOnly}
          maxLength={12}
        />
      </div>
    </div>
    {showManualInput && (
      <button
        type='button'
        className='text-sm text-primary underline mt-1 w-fit text-left'
        onClick={onOpenReasonModal}
      >
        Add Reason &amp; Submit Aadhaar
      </button>
    )}
  </div>
)

const DigiLockerButtonRow = ({
  displayVerified,
  isVerificationRequired,
  isInitiating,
  isProcessing,
  hasFailed,
  onInitiate,
}) => (
  <div className='flex flex-wrap items-center gap-4 mt-2 ml-[19px]'>
    <button
      className={`px-4 py-2 font-bold text-white rounded ${getButtonClass(
        displayVerified,
        isVerificationRequired,
        isInitiating,
        isProcessing,
      )}`}
      onClick={onInitiate}
      disabled={
        !isVerificationRequired || displayVerified || isInitiating || isProcessing
      }
    >
      {getButtonText(displayVerified, isProcessing, isInitiating)}
    </button>

    {hasFailed && !displayVerified && (
      <button
        className='px-4 py-2 font-bold text-white rounded bg-primary hover:opacity-90'
        onClick={onInitiate}
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
)

const ReasonModal = ({ reasonInput, onReasonChange, onCancel, onSubmit }) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
    <div className='relative p-4 mx-auto bg-white rounded shadow-lg w-[28rem] max-w-[90vw]'>
      <h2 className='text-lg font-bold'>Reason for Manual Aadhaar Entry</h2>
      <textarea
        value={reasonInput}
        onChange={onReasonChange}
        className='w-full p-2 mt-2 border rounded outline-none'
        rows={3}
        placeholder='Why is Aadhaar being entered manually?'
      />
      <div className='flex justify-end mt-4 gap-2'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 text-white bg-gray-500 rounded'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={onSubmit}
          className='px-4 py-2 font-bold text-white rounded bg-primary hover:opacity-90'
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)

const DigilockerAadhaarField = ({
  aadharNumber,
  setAadharNumber,
  isVerified,
  setIsVerified,
  aadharVerificationReason,
  setAadharVerificationReason,
  isVerificationRequired = true,
  isDevelopmentMode = false,
}) => {
  const {
    error,
    isInitiating,
    isProcessing,
    setAadhaarConsent,
    statusMessage,
    verifiedAadhaarNumber,
    hasFailed,
    isManualEntry,
    manualAadharNumber,
    showReasonModal,
    setShowReasonModal,
    reasonInput,
    setReasonInput,
    handleInitiateDigiLocker,
    handleManualAadharChange,
    handleManualSubmit,
    handleOpenReasonModal,
    displayVerified,
    showVerifiedReadOnly,
    showManualInput,
  } = useDigilockerAadhaarField({
    setAadharNumber,
    isVerified,
    setIsVerified,
    setAadharVerificationReason,
    isVerificationRequired,
  })

  return (
    <div className='flex flex-col eminumber mt-[4px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>2.</p>
        <p className='text-base font-medium three'>
          Aadhaar Verification
          {isDevelopmentMode ? (
            <span className='text-gray-400 text-sm ml-1'>
              (optional in development)
            </span>
          ) : (
            <span className='text-red-500'>*</span>
          )}
        </p>
      </div>

      {(showVerifiedReadOnly || showManualInput) && (
        <AadhaarInputRow
          showVerifiedReadOnly={showVerifiedReadOnly}
          showManualInput={showManualInput}
          verifiedAadhaarNumber={verifiedAadhaarNumber}
          manualAadharNumber={manualAadharNumber}
          onManualChange={handleManualAadharChange}
          onOpenReasonModal={handleOpenReasonModal}
        />
      )}

      <DigiLockerButtonRow
        displayVerified={displayVerified}
        isVerificationRequired={isVerificationRequired}
        isInitiating={isInitiating}
        isProcessing={isProcessing}
        hasFailed={hasFailed}
        onInitiate={handleInitiateDigiLocker}
      />

      {isManualEntry && aadharVerificationReason && (
        <p className='text-xs text-gray-600 mt-1 ml-[19px]'>
          Reason: {aadharVerificationReason}
        </p>
      )}

      {showReasonModal && (
        <ReasonModal
          reasonInput={reasonInput}
          onReasonChange={(e) => setReasonInput(e.target.value)}
          onCancel={() => setShowReasonModal(false)}
          onSubmit={handleManualSubmit}
        />
      )}

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
