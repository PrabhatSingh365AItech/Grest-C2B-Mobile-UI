import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
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
import {
  initiateSurepass,
  completeSurepass,
  clearSurepassSession,
  SUREPASS_SESSION_KEYS,
  SUREPASS_CALLBACK_PATH,
} from '../../services/surepassAadhaarService'
import ConsentCheckbox from '../ConsentCheckbox'
import { AADHAR_LENGTH } from '../../constants/priceConstants'

const DISABLED_BTN = 'bg-gray-400 cursor-not-allowed'
const PINK = 'bg-primary'
const GREEN = 'bg-green-500 cursor-not-allowed'

// Which provider produced a real (non-manual) verification. Both provider
// buttons share the single isVerified flag, so this lets each button show
// the right label instead of both claiming "Verified".
const PROVIDER_DIGILOCKER = 'DIGILOCKER'
const PROVIDER_SUREPASS = 'SUREPASS'

const AADHAAR_CONSENT_ERROR = 'Please provide consent for Aadhaar collection'
const AADHAAR_VERIFIED_MSG = 'Aadhaar verified successfully!'

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

// Sends the user to a provider's hosted page (DigiLocker or Surepass).
// Web: full-page navigation; the provider redirects back to /pricepage.
// Native: navigating the app's own WebView away would land the provider's
// redirect on https://localhost (and lose sessionStorage), so open it in the
// in-app browser instead. The provider then redirects to our custom scheme
// (grestc2b://digilocker/...), caught by the appUrlOpen listener below.
const openProviderUrl = async (url) => {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url })
  } else {
    window.location.href = url
  }
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
  setVerifiedByProvider,
  setError,
  setHasFailed,
}) => async (callbackRefid) => {
  setIsProcessing(true)
  setStatusMessage('Completing Aadhaar verification...')

  try {
    await getDigiLockerAccessToken(callbackRefid)

    const files = await getDigiLockerIssuedFiles(callbackRefid)

    const aadhaarDoc = files?.find(
      (doc) =>
        doc.doctype === 'ADHAR' ||
        doc.name?.toLowerCase().includes('aadhaar'),
    )

    if (!aadhaarDoc) {
      throw new Error('Aadhaar document not found')
    }

    const kycResponse = await downloadDigiLockerXml(
      callbackRefid,
      aadhaarDoc.uri,
    )

    const maskedNumber = kycResponse?.aadhaarNumber
    if (maskedNumber) {
      setVerifiedAadhaarNumber(maskedNumber)
    }

    setAadharNumber(maskedNumber || 'Aadhaar Verified')
    setIsVerified(true)
    setVerifiedByProvider(PROVIDER_DIGILOCKER)
    setError('')
    setStatusMessage(AADHAAR_VERIFIED_MSG)
    toast.success(AADHAAR_VERIFIED_MSG)

    window.history.replaceState({}, '', window.location.pathname)
  } catch (err) {
    console.error('DigiLocker callback error:', err)
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Failed to complete Aadhaar verification'
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
    toast.error(AADHAAR_CONSENT_ERROR)
    return false
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
      throw new Error('Failed to get Aadhaar verification URL')
    }

    setStatusMessage('Redirecting for Aadhaar verification...')

    await openProviderUrl(sessionResult.authorization_url)
    return true
  } catch (err) {
    console.error('Initiate DigiLocker error:', err)
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Failed to initiate Aadhaar verification'
    setError(errorMessage)
    setHasFailed(true)
    toast.error(errorMessage)
    setIsInitiating(false)
    return false
  }
}

// Surepass completion: poll the provider status, then download the parsed
// Aadhaar. Both calls hit POST /api/aadhaar/complete (step status/download).
const createHandleSurepassComplete = ({
  setIsSurepassProcessing,
  setStatusMessage,
  setVerifiedAadhaarNumber,
  setAadharNumber,
  setIsVerified,
  setVerifiedByProvider,
  setError,
  setHasFailed,
}) => async () => {
  setIsSurepassProcessing(true)
  setStatusMessage('Completing Aadhaar verification...')

  try {
    const clientId = sessionStorage.getItem(SUREPASS_SESSION_KEYS.CLIENT_ID)
    const verificationId = sessionStorage.getItem(
      SUREPASS_SESSION_KEYS.VERIFICATION_ID,
    )

    if (!clientId && !verificationId) {
      throw new Error('Verification session not found. Please start again.')
    }

    const status = await completeSurepass({
      verificationId,
      clientId,
      step: 'status',
    })
    if (!status?.completed) {
      throw new Error('Aadhaar verification is not complete yet.')
    }

    setStatusMessage('Fetching your Aadhaar details...')
    const result = await completeSurepass({
      verificationId,
      clientId,
      step: 'download',
    })

    const maskedNumber = result?.maskedAadhaar
    if (maskedNumber) {
      setVerifiedAadhaarNumber(maskedNumber)
    }

    setAadharNumber(maskedNumber || 'Aadhaar Verified')
    setIsVerified(true)
    setVerifiedByProvider(PROVIDER_SUREPASS)
    setError('')
    setStatusMessage(AADHAAR_VERIFIED_MSG)
    toast.success(AADHAAR_VERIFIED_MSG)

    window.history.replaceState({}, '', window.location.pathname)
    clearSurepassSession()
    return true
  } catch (err) {
    console.error('Surepass callback error:', err)
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Failed to complete Aadhaar verification'
    setError(errorMessage)
    setHasFailed(true)
    setStatusMessage('')
    toast.error(errorMessage)
    return false
  } finally {
    setIsSurepassProcessing(false)
    sessionStorage.removeItem(SUREPASS_SESSION_KEYS.AWAITING_CALLBACK)
  }
}

// Surepass initiation: POST /api/aadhaar/initiate, then redirect the browser
// to the returned provider URL (same pattern as DigiLocker's redirect).
const createHandleInitiateSurepass = ({
  aadhaarConsent,
  leadId,
  handleSurepassComplete,
  setIsSurepassInitiating,
  setError,
  setHasFailed,
  setVerifiedAadhaarNumber,
  setIsManualEntry,
  setManualAadharNumber,
  setAadharVerificationReason,
  setIsVerified,
  setAadharNumber,
  setVerifiedByProvider,
  setHasAttemptedBefore,
  setStatusMessage,
}) => async () => {
  if (!aadhaarConsent) {
    toast.error(AADHAAR_CONSENT_ERROR)
    return false
  }

  sessionStorage.setItem('digilockerAttempted', 'true')
  setHasAttemptedBefore(true)

  setIsSurepassInitiating(true)
  setError('')
  setHasFailed(false)
  setVerifiedAadhaarNumber('')
  setIsManualEntry(false)
  setManualAadharNumber('')
  setAadharVerificationReason('')
  setIsVerified(false)
  setAadharNumber('')
  setVerifiedByProvider('')
  clearSurepassSession()

  try {
    setStatusMessage('Starting Aadhaar verification...')
    const session = await initiateSurepass({ leadId })

    if (!session?.clientId) {
      throw new Error('Failed to start Aadhaar verification session')
    }

    sessionStorage.setItem(SUREPASS_SESSION_KEYS.CLIENT_ID, session.clientId)
    if (session.verificationId) {
      sessionStorage.setItem(
        SUREPASS_SESSION_KEYS.VERIFICATION_ID,
        session.verificationId,
      )
    }

    if (session.url) {
      setStatusMessage('Redirecting for Aadhaar verification...')
      sessionStorage.setItem(SUREPASS_SESSION_KEYS.AWAITING_CALLBACK, 'true')
      await openProviderUrl(session.url)
      return true
    }

    // No URL (e.g. test mode) - run the full verification inline.
    await handleSurepassComplete()
    setStatusMessage('')
    return true
  } catch (err) {
    console.error('Initiate Surepass error:', err)
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Failed to initiate Aadhaar verification'
    setError(errorMessage)
    setHasFailed(true)
    toast.error(errorMessage)
    setStatusMessage('')
    setIsSurepassInitiating(false)
    return false
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
    toast.error(AADHAAR_CONSENT_ERROR)
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

// Reads a refid/encdata straight off the URL on mount - this is how
// DigiLocker's redirect back to this same page (web) delivers its result.
const createCallbackMountEffect = (handleDigiLockerCallback, setRefid) => () => {
  if (Capacitor.isNativePlatform()) {
    return
  }
  const callbackRefid = extractRefid(new URLSearchParams(window.location.search))

  if (callbackRefid) {
    setRefid(callbackRefid)
    handleDigiLockerCallback(callbackRefid)
  }
}

// Native: the in-app browser opened for the provider's page is a separate
// context from the app's WebView, so the callback can't arrive via
// window.location - the provider redirects to our custom scheme instead,
// which the OS hands back to the app as an 'appUrlOpen' event:
//   grestc2b://digilocker/callback?refid=...  -> DigiLocker
//   grestc2b://digilocker/surepass?...        -> Surepass (client_id is
//                                                already in sessionStorage)
// Host MUST stay "digilocker" for both - AndroidManifest.xml's intent-filter
// matches on scheme="grestc2b" AND host="digilocker".
const createNativeAppUrlOpenEffect = ({
  handleDigiLockerCallback,
  handleSurepassComplete,
  setIsInitiating,
  setIsSurepassInitiating,
  setRefid,
}) => () => {
  if (!Capacitor.isNativePlatform()) {
    return undefined
  }

  const listenerPromise = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
    let parsed = null
    try {
      parsed = new URL(url)
    } catch (e) {
      console.error('Failed to parse Aadhaar deep link callback:', e)
      return
    }

    if (parsed.pathname.startsWith(SUREPASS_CALLBACK_PATH)) {
      Browser.close().catch(() => {})
      setIsSurepassInitiating(false)
      handleSurepassComplete()
      return
    }

    const callbackRefid = extractRefid(parsed.searchParams)
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
// cancel) without completing the provider's flow, no appUrlOpen event fires -
// without this the button would stay stuck on "Redirecting...".
// For Surepass it also checks the session status, so a verification the user
// actually finished still completes even if the jump back to the app via the
// deep link never happened (browser blocked it, user closed the tab instead).
const createBrowserFinishedSafetyEffect = (
  setIsInitiating,
  setIsSurepassInitiating,
  checkSurepassAfterBrowserClose,
) => () => {
  if (!Capacitor.isNativePlatform()) {
    return undefined
  }

  const listenerPromise = Browser.addListener('browserFinished', () => {
    setIsInitiating(false)
    setIsSurepassInitiating(false)
    // The WebView never reloaded, so nothing will "resume" on mount; drop
    // the marker so a later remount doesn't try to complete an abandoned
    // session. client_id is kept in case appUrlOpen is still on its way.
    sessionStorage.removeItem(SUREPASS_SESSION_KEYS.AWAITING_CALLBACK)
    checkSurepassAfterBrowserClose()
  })

  return () => {
    listenerPromise.then((handle) => handle.remove())
  }
}

// The DigiLocker step is the only step that leaves the app via a real,
// full-page navigation (window.location.href to DigiLocker and back).
// That makes this page eligible for the browser's back-forward cache
// (bfcache): pressing the native Back/Forward buttons can restore this
// exact page instance frozen in time, complete with whichever Aadhaar
// record happened to be verified in it, instead of a fresh mount.
// Detect that restoration and reset verification state so a stale/old
// record is never shown as already verified for what should be a new flow.
// Also resets isInitiating/isProcessing: without these two, closing or
// cancelling DigiLocker mid-flow (native browser Back, before finishing)
// restores this page frozen with isInitiating still true from the click
// that started the redirect - permanently disabling the button
// ("Redirecting...") and, since isManualFlow also checks these two flags,
// hiding the manual fallback too. A dead end with nothing left to click.
const createBfcacheResetHandler = (setters) => (event) => {
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
    setVerifiedByProvider,
    setIsSurepassInitiating,
    setIsSurepassProcessing,
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
  setVerifiedByProvider('')
  setIsSurepassInitiating(false)
  setIsSurepassProcessing(false)
  clearSurepassSession()
}

// Whenever the user comes back to this tab/page from DigiLocker - by any
// means, not just the browser's native Back button (which pageshow/bfcache
// already covers) - and we're still stuck showing "Redirecting..." because
// nothing ever called back to confirm success or failure, treat it as
// "came back without completing" so the button un-sticks and the manual
// fallback (already unlocked via hasAttemptedBefore) becomes available
// instead of leaving the user with nothing clickable.
const createVisibilityResetEffect = (isInitiating, setIsInitiating) => () => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && isInitiating) {
      setIsInitiating(false)
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}

// All state for the field lives here, so the handlers hook below and the
// component itself only have to worry about their own concerns.
const useAadhaarFieldState = ({ isVerified, isVerificationRequired }) => {
  const [error, setError] = useState('')
  const [isInitiating, setIsInitiating] = useState(false)
  // Starting this as a plain `false` leaves a one-render gap on a fresh
  // page load coming back from DigiLocker: hasAttemptedBefore is already
  // true (read from sessionStorage immediately), but isProcessing would
  // only flip true once the mount effect below runs and calls
  // handleDigiLockerCallback - which happens after the first paint. In
  // that gap, isManualFlow's guard sees isProcessing still false and lets
  // the manual box flash in for a frame before the callback takes over.
  // Checking the URL here closes that gap immediately.
  const [isProcessing, setIsProcessing] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return !!(params.get('refid') || params.get('encdata'))
  })
  // Surepass flow has its own in-flight flags so its button's label never
  // gets mixed up with the DigiLocker button's.
  const [isSurepassInitiating, setIsSurepassInitiating] = useState(false)
  const [isSurepassProcessing, setIsSurepassProcessing] = useState(
    () =>
      sessionStorage.getItem(SUREPASS_SESSION_KEYS.AWAITING_CALLBACK) === 'true',
  )
  // Which provider actually verified the Aadhaar (for the button labels).
  const [verifiedByProvider, setVerifiedByProvider] = useState('')
  // Consent is never pre-ticked: the user must tick it themselves on every
  // visit, including after returning from a provider redirect.
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
    (hasAttemptedBefore &&
      !isInitiating &&
      !isProcessing &&
      !isSurepassInitiating &&
      !isSurepassProcessing)
  // The provider buttons only ever reflect a real verification - a manual
  // entry doesn't turn either button green/"submitted" or disable it; it's
  // left exactly as it looked before the manual submit.
  const displayVerified = isVerified && !isManualEntry
  // hasAttemptedBefore flips true the instant a provider button is clicked -
  // including on a click that goes on to succeed. So a genuine, just-
  // completed verification can have isManualFlow true too by the time the
  // page reloads with the result. The read-only verified display must win in
  // that case, or the box would wrongly render as the empty, editable manual
  // input instead of the real verified number.
  const showVerifiedReadOnly = displayVerified && !!verifiedAadhaarNumber
  const showManualInput = isManualFlow && !showVerifiedReadOnly

  return {
    error,
    isInitiating,
    isProcessing,
    isSurepassInitiating,
    isSurepassProcessing,
    aadhaarConsent,
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
    hasAttemptedBefore,
    setHasAttemptedBefore,
    verifiedByProvider,
    setVerifiedByProvider,
    setError,
    setIsInitiating,
    setIsProcessing,
    setIsSurepassInitiating,
    setIsSurepassProcessing,
    setIsManualEntry,
    setManualAadharNumber,
    setStatusMessage,
    setVerifiedAadhaarNumber,
    setHasFailed,
    displayVerified,
    showVerifiedReadOnly,
    showManualInput,
  }
}

// All effects and handlers for the field live here, so the state hook above
// and the component itself only have to worry about their own concerns.
const useAadhaarFieldHandlers = (
  state,
  { leadId, setAadharNumber, setIsVerified, setAadharVerificationReason },
) => {
  const {
    aadhaarConsent,
    manualAadharNumber,
    reasonInput,
    isInitiating,
    isSurepassInitiating,
    setError,
    setHasFailed,
    setStatusMessage,
    setVerifiedAadhaarNumber,
    setIsInitiating,
    setIsProcessing,
    setIsSurepassInitiating,
    setIsSurepassProcessing,
    setIsManualEntry,
    setManualAadharNumber,
    setShowReasonModal,
    setReasonInput,
    setVerifiedByProvider,
    setHasAttemptedBefore,
  } = state

  const refidRef = useRef('')
  const setRefid = (value) => {
    refidRef.current = value
  }
  const surepassResumedRef = useRef(false)

  const handleDigiLockerCallback = createHandleDigiLockerCallback({
    setIsProcessing,
    setStatusMessage,
    setVerifiedAadhaarNumber,
    setAadharNumber,
    setIsVerified,
    setVerifiedByProvider,
    setError,
    setHasFailed,
  })

  useEffect(
    createCallbackMountEffect(handleDigiLockerCallback, setRefid),
    [],
  )

  // See createBfcacheResetHandler above for why this exists.
  useEffect(() => {
    const handlePageShow = createBfcacheResetHandler({
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
      setVerifiedByProvider,
      setIsSurepassInitiating,
      setIsSurepassProcessing,
    })
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  useEffect(
    createVisibilityResetEffect(isInitiating, setIsInitiating),
    [isInitiating],
  )

  useEffect(
    createVisibilityResetEffect(isSurepassInitiating, setIsSurepassInitiating),
    [isSurepassInitiating],
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

  const handleSurepassComplete = createHandleSurepassComplete({
    setIsSurepassProcessing,
    setStatusMessage,
    setVerifiedAadhaarNumber,
    setAadharNumber,
    setIsVerified,
    setVerifiedByProvider,
    setError,
    setHasFailed,
  })

  const handleInitiateSurepass = createHandleInitiateSurepass({
    aadhaarConsent,
    leadId,
    handleSurepassComplete,
    setIsSurepassInitiating,
    setError,
    setHasFailed,
    setVerifiedAadhaarNumber,
    setIsManualEntry,
    setManualAadharNumber,
    setAadharVerificationReason,
    setIsVerified,
    setAadharNumber,
    setVerifiedByProvider,
    setHasAttemptedBefore,
    setStatusMessage,
  })

  // Option B: the single button runs the first-priority provider (Surepass);
  // on ANY Surepass error it stops and leaves the error on screen so the
  // recovery view (explicit DigiLocker + Retry + manual entry) appears for
  // the user to pick what to do next - no silent auto-redirect.
  const handleVerifyAadhaar = async () => {
    if (!aadhaarConsent) {
      toast.error(AADHAAR_CONSENT_ERROR)
      return
    }
    await handleInitiateSurepass()
  }

  // Native deep-link return for both providers. If Android killed the app
  // while the in-app browser was open, the resume-on-mount effect below may
  // have already picked up the Surepass session - the shared ref stops the
  // appUrlOpen event from completing it a second time.
  const completeSurepassOnce = () => {
    if (surepassResumedRef.current) {
      return
    }
    surepassResumedRef.current = true
    handleSurepassComplete().finally(() => {
      surepassResumedRef.current = false
    })
  }

  // In-app browser closed without the deep link: quietly ask for the status
  // and only complete when Surepass says it is done - a user who simply
  // cancelled gets no error toast, just the reset button.
  const checkSurepassAfterBrowserClose = async () => {
    const clientId = sessionStorage.getItem(SUREPASS_SESSION_KEYS.CLIENT_ID)
    const verificationId = sessionStorage.getItem(
      SUREPASS_SESSION_KEYS.VERIFICATION_ID,
    )
    if ((!clientId && !verificationId) || surepassResumedRef.current) {
      return
    }
    try {
      const status = await completeSurepass({
        verificationId,
        clientId,
        step: 'status',
      })
      if (status?.completed) {
        completeSurepassOnce()
      }
    } catch {
      // Not finished on Surepass's side (user cancelled) - nothing to do,
      // the button has already been reset by the browserFinished handler.
    }
  }

  useEffect(
    createNativeAppUrlOpenEffect({
      handleDigiLockerCallback,
      handleSurepassComplete: completeSurepassOnce,
      setIsInitiating,
      setIsSurepassInitiating,
      setRefid,
    }),
    [],
  )

  useEffect(
    createBrowserFinishedSafetyEffect(
      setIsInitiating,
      setIsSurepassInitiating,
      checkSurepassAfterBrowserClose,
    ),
    [],
  )

  // Returning from the Surepass DigiLocker page (full-page navigation) lands
  // back on this page with the session marker still set, so resume the flow.
  // The ref keeps React's StrictMode double-mount from starting it twice.
  useEffect(() => {
    const awaiting =
      sessionStorage.getItem(SUREPASS_SESSION_KEYS.AWAITING_CALLBACK) === 'true'
    if (awaiting && !surepassResumedRef.current) {
      surepassResumedRef.current = true
      handleSurepassComplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  return {
    handleVerifyAadhaar,
    handleInitiateDigiLocker,
    handleManualAadharChange,
    handleManualSubmit,
    handleOpenReasonModal,
  }
}

const useDigilockerAadhaarField = ({
  setAadharNumber,
  isVerified,
  setIsVerified,
  setAadharVerificationReason,
  isVerificationRequired,
  leadId,
}) => {
  const state = useAadhaarFieldState({ isVerified, isVerificationRequired })
  const handlers = useAadhaarFieldHandlers(state, {
    leadId,
    setAadharNumber,
    setIsVerified,
    setAadharVerificationReason,
  })

  return { ...state, ...handlers }
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

AadhaarInputRow.propTypes = {
  showVerifiedReadOnly: PropTypes.bool,
  showManualInput: PropTypes.bool,
  verifiedAadhaarNumber: PropTypes.string,
  manualAadharNumber: PropTypes.string,
  onManualChange: PropTypes.func,
  onOpenReasonModal: PropTypes.func,
}

// Option B recovery screen: on Surepass failure the user picks the next step
// - "Verify via DigiLocker" (explicit classic flow), "Retry" (back to the
// first-priority Surepass), or the already-visible manual entry.
const ProviderButtonRow = ({
  verified,
  buttonLabel,
  isVerificationRequired,
  isBusy,
  hasFailed,
  onInitiate,
  onRecoverDigiLocker,
}) => {
  const idleClass =
    verified || isBusy || !isVerificationRequired ? DISABLED_BTN : PINK
  const inRecovery = hasFailed && !verified

  return (
    <div className='flex flex-wrap items-center gap-4 mt-2 ml-[19px]'>
      <button
        className={`px-4 py-2 font-bold text-white rounded ${
          verified ? GREEN : idleClass
        }`}
        onClick={inRecovery ? onRecoverDigiLocker : onInitiate}
        disabled={!isVerificationRequired || verified || isBusy}
      >
        {buttonLabel}
      </button>

      {inRecovery && (
        <button
          className='px-4 py-2 font-bold text-white rounded bg-primary hover:opacity-90'
          onClick={onInitiate}
          disabled={isBusy}
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
}

ProviderButtonRow.propTypes = {
  verified: PropTypes.bool,
  buttonLabel: PropTypes.string.isRequired,
  isVerificationRequired: PropTypes.bool,
  isBusy: PropTypes.bool,
  hasFailed: PropTypes.bool,
  onInitiate: PropTypes.func.isRequired,
  onRecoverDigiLocker: PropTypes.func.isRequired,
}

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

ReasonModal.propTypes = {
  reasonInput: PropTypes.string,
  onReasonChange: PropTypes.func,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
}

// Extracted from the component so the nested ternaries don't inflate its
// cognitive complexity.
const getButtonLabel = ({
  displayVerified,
  isBusy,
  hasFailed,
}) => {
  if (displayVerified) {
    return 'Verified'
  }
  if (isBusy) {
    return 'Verifying...'
  }
  if (hasFailed) {
    return 'Verify via Phone Number'
  }
  return 'Verify via Aadhaar Number'
}

const DigilockerAadhaarField = ({
  aadharNumber,
  setAadharNumber,
  isVerified,
  setIsVerified,
  aadharVerificationReason,
  setAadharVerificationReason,
  isVerificationRequired = true,
  isDevelopmentMode = false,
  leadId,
}) => {
  const {
    error,
    isInitiating,
    isProcessing,
    isSurepassInitiating,
    isSurepassProcessing,
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
    handleVerifyAadhaar,
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
    leadId,
  })

  const anyBusy =
    isInitiating ||
    isProcessing ||
    isSurepassInitiating ||
    isSurepassProcessing
  const buttonLabel = getButtonLabel({
    displayVerified,
    isBusy: anyBusy,
    hasFailed,
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

      <ProviderButtonRow
        verified={displayVerified}
        buttonLabel={buttonLabel}
        isVerificationRequired={isVerificationRequired}
        isBusy={anyBusy}
        hasFailed={hasFailed}
        onInitiate={handleVerifyAadhaar}
        onRecoverDigiLocker={handleInitiateDigiLocker}
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

DigilockerAadhaarField.propTypes = {
  aadharNumber: PropTypes.string,
  setAadharNumber: PropTypes.func,
  isVerified: PropTypes.bool,
  setIsVerified: PropTypes.func,
  aadharVerificationReason: PropTypes.string,
  setAadharVerificationReason: PropTypes.func,
  isVerificationRequired: PropTypes.bool,
  isDevelopmentMode: PropTypes.bool,
  leadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default DigilockerAadhaarField
