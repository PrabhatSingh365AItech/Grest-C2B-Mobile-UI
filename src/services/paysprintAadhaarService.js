import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_REACT_APP_ENDPOINT

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const sendAadhaarOtp = async (idNumber) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/paysprint-aadhaar/send-otp`,
    { id_number: idNumber },
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}

export const verifyAadhaarOtp = async ({ client_id, otp }) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/paysprint-aadhaar/verify-otp`,
    { client_id, otp },
    { headers: getAuthHeaders() },
  )
  return response.data?.data
}
