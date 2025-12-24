import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_REACT_APP_ENDPOINT

export const createDigilockerKYCRequest = async (customerData) => {
  try {
    const token = localStorage.getItem('token')

    const response = await axios.post(
      `${API_BASE_URL}/api/digilocker/kyc`,
      {
        customer_identifier: customerData.customer_identifier,
        customer_name: customerData.customer_name,
        template_name: customerData.template_name,
        notify_customer: customerData.notify_customer,
        expire_in_days: customerData.expire_in_days,
        generate_access_token: customerData.generate_access_token,
        reference_id: customerData.reference_id,
        transaction_id: customerData.transaction_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error('Digilocker KYC request failed:', error)
    throw error
  }
}
