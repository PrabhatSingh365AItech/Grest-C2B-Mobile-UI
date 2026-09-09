import axios from 'axios'
import {
  KYC_TEST_DATA,
  KYC_TEST_MODE,
} from '../config/featureFlags'

const API_BASE_URL = import.meta.env.VITE_REACT_APP_ENDPOINT

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const sendAadhaarOtp = async (idNumber) => {
  if (KYC_TEST_MODE) {
    if (idNumber !== KYC_TEST_DATA.aadhaarNumber) {
      throw new Error(
        `Use test Aadhaar number ${KYC_TEST_DATA.aadhaarNumber}`,
      )
    }
    return {
      status: true,
      response_code: 1,
      client_id: KYC_TEST_DATA.aadhaarClientId,
      message: 'Local test OTP generated',
    }
  }
  const response = await axios.post(
    `${API_BASE_URL}/api/paysprint-aadhaar/send-otp`,
    { id_number: idNumber },
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}

export const verifyAadhaarOtp = async ({ client_id, otp }) => {
  if (KYC_TEST_MODE) {
    if (
      client_id !== KYC_TEST_DATA.aadhaarClientId ||
      otp !== KYC_TEST_DATA.aadhaarOtp
    ) {
      throw new Error(`Use test OTP ${KYC_TEST_DATA.aadhaarOtp}`)
    }
    return {
      status: true,
      response_code: 1,
      client_id,
      message: 'Aadhaar verified in local test mode',
    }
  }
  const response = await axios.post(
    `${API_BASE_URL}/api/paysprint-aadhaar/verify-otp`,
    { client_id, otp },
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}
