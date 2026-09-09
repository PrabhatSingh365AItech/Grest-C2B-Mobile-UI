import axios from 'axios'
import { Capacitor } from '@capacitor/core'
import {
  KYC_TEST_MODE,
} from '../config/featureFlags'

const API_BASE_URL = import.meta.env.VITE_REACT_APP_ENDPOINT

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    Authorization: token,
  }
}

const API_ENDPOINTS = {
  GENERATE_TOKEN: '/api/digilocker-aadhaar/generate-token',
  INITIATE_SESSION: '/api/digilocker-aadhaar/initiate-session',
  ACCESS_TOKEN: '/api/digilocker-aadhaar/access-token',
  ISSUED_FILES: '/api/digilocker-aadhaar/issued-files',
  DOWNLOAD_XML: '/api/digilocker-aadhaar/download-xml',
  VERIFY_AADHAAR: '/api/digilocker-aadhaar/verify-aadhaar',
}

export const generateDigiLockerToken = async () => {
  if (KYC_TEST_MODE) {
    return {
      token: 'test-jwt-token',
      partnerId: 'CORP00002424',
      expiresIn: 300,
    }
  }
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.GENERATE_TOKEN}`,
    {},
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}

export const initiateDigiLockerSession = async (refid, redirectUrl) => {
  if (KYC_TEST_MODE) {
    return {
      authorization_url: 'https://test.digilocker.gov.in/auth',
      refid,
    }
  }
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.INITIATE_SESSION}`,
    { refid, redirect_url: redirectUrl },
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}

export const getDigiLockerAccessToken = async (refid) => {
  if (KYC_TEST_MODE) {
    return { message: 'Access token generated successfully' }
  }
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.ACCESS_TOKEN}`,
    { refid },
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}

export const getDigiLockerIssuedFiles = async (refid) => {
  if (KYC_TEST_MODE) {
    return [
      {
        name: 'Aadhaar Card',
        doctype: 'ADHAR',
        issuer: 'Unique Identification Authority of India (UIDAI)',
        uri: 'in.gov.uidai-test123',
      },
    ]
  }
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.ISSUED_FILES}`,
    { refid },
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}

export const downloadDigiLockerXml = async (refid, uri) => {
  if (KYC_TEST_MODE) {
    return { document: '<TestAadhaarXml>test</TestAadhaarXml>' }
  }
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_XML}`,
    { refid, uri },
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}

export const verifyAadhaarViaDigiLocker = async (refid, uri) => {
  if (KYC_TEST_MODE) {
    return {
      verified: true,
      document_type: 'ADHAR',
      document_name: 'Aadhaar Card',
      issuer: 'UIDAI',
      xml_data: '<TestAadhaarXml>test</TestAadhaarXml>',
    }
  }
  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.VERIFY_AADHAAR}`,
    { refid, uri },
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}

// Native (Capacitor) builds run from a local bundle (grestc2b://...), not from any
// hosted web origin, so a hardcoded https redirect_url takes the WebView to a live
// website instead of back into the app, and sessionStorage (set on the app's own
// origin) is lost -> "No token provided" on the access-token call that follows.
// On native we redirect to a custom-scheme deep link instead and catch it via
// App.addListener('appUrlOpen', ...) in DigilockerAadhaarField. Host MUST be
// exactly "digilocker" - AndroidManifest.xml's intent-filter matches on
// scheme="grestc2b" AND host="digilocker" (already registered for the Digio
// SDK flow in digilockerSDK.js); any other host silently fails to route back
// to the app on Android (iOS's Info.plist only registers the bare scheme, so
// it isn't host-sensitive, but we keep both platforms on the same URL).
// On web, derive the origin dynamically instead of pinning to one deployed URL.
export const DIGILOCKER_REDIRECT_URL = Capacitor.isNativePlatform()
  ? 'grestc2b://digilocker/callback'
  : `${window.location.origin}/pricepage`
