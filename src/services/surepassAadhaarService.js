import axios from 'axios'
import { Capacitor } from '@capacitor/core'
import { KYC_TEST_MODE } from '../config/featureFlags'

const API_BASE_URL = import.meta.env.VITE_REACT_APP_ENDPOINT

const getSurepassHeaders = () => {
  const token = sessionStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    Authorization: token,
  }
}

// Where Surepass sends the user after the DigiLocker consent page (passed to
// Surepass as `redirect_url` by the backend's /api/aadhaar/initiate).
// Web: back to this same page; the AWAITING_CALLBACK marker resumes the flow.
// Native: Surepass only accepts an https redirect_url (a grestc2b:// URL is
// rejected at initialize), so the app sends the backend's public return page
// instead. That page forwards the in-app browser to the deep link
// grestc2b://digilocker/surepass, caught by appUrlOpen in
// DigilockerAadhaarField. The deep link's host MUST stay "digilocker" to
// match AndroidManifest.xml's intent-filter; SUREPASS_CALLBACK_PATH is what
// tells the listener this is the Surepass return.
export const SUREPASS_CALLBACK_PATH = '/surepass'
export const SUREPASS_REDIRECT_URL = Capacitor.isNativePlatform()
  ? `${API_BASE_URL}/api/aadhaar/surepass/return`
  : `${window.location.origin}/pricepage`

// Backend Aadhaar (Surepass) endpoints:
//   POST /api/aadhaar/initiate     -> { verificationId, clientId, url }
//   POST /api/aadhaar/complete     -> step 'status' then 'download'
//   GET  /api/aadhaar/verification -> persisted verification record
const API_ENDPOINTS = {
  INITIATE: '/api/aadhaar/initiate',
  COMPLETE: '/api/aadhaar/complete',
  VERIFICATION: '/api/aadhaar/verification',
}

const TEST_VERIFICATION = {
  verificationId: 'test-verification',
  provider: 'SUREPASS',
  status: 'COMPLETED',
  maskedAadhaar: 'XXXXXX3257',
  name: 'TEST USER',
  dob: '1990-01-01',
  gender: 'M',
  address: { state: 'Delhi', dist: 'New Delhi', house: '20' },
  verifiedAt: new Date().toISOString(),
}

// Prefixed so this flow can never collide with the DigiLocker flow keys.
export const SUREPASS_SESSION_KEYS = {
  CLIENT_ID: 'surepassAadhaarClientId',
  VERIFICATION_ID: 'surepassAadhaarVerificationId',
  AWAITING_CALLBACK: 'surepassAadhaarAwaitingCallback',
}

export const clearSurepassSession = () => {
  Object.values(SUREPASS_SESSION_KEYS).forEach((key) =>
    sessionStorage.removeItem(key),
  )
}

export const initiateSurepass = async ({ redirectUrl, leadId } = {}) => {
  if (KYC_TEST_MODE) {
    return {
      verificationId: TEST_VERIFICATION.verificationId,
      provider: 'SUREPASS',
      clientId: 'test-surepass-client',
      url: null,
      expirySeconds: 600,
    }
  }
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.INITIATE}`,
    {
      redirectUrl: redirectUrl || SUREPASS_REDIRECT_URL,
      ...(leadId ? { leadId } : {}),
    },
    { headers: getSurepassHeaders() },
  )
  return response.data?.data
}

export const completeSurepass = async ({ verificationId, clientId, step }) => {
  if (KYC_TEST_MODE) {
    if (step === 'status') {
      return {
        status: 'completed',
        completed: true,
        failed: false,
        aadhaarLinked: true,
      }
    }
    return TEST_VERIFICATION
  }
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.COMPLETE}`,
    { verificationId, clientId, step },
    { headers: getSurepassHeaders() },
  )
  return response.data?.data
}

export const getSurepassVerification = async ({ verificationId }) => {
  if (KYC_TEST_MODE) {
    return TEST_VERIFICATION
  }
  const response = await axios.get(
    `${API_BASE_URL}${API_ENDPOINTS.VERIFICATION}?verificationId=${encodeURIComponent(
      verificationId || '',
    )}`,
    { headers: getSurepassHeaders() },
  )
  return response.data?.data
}
