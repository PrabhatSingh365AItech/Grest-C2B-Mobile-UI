import axios from 'axios'

export const fetchSignatureAsBase64 = async (signatureUrl) => {
  try {
    const token = sessionStorage.getItem('authToken')
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/s3/proxy-image`,
      {
        params: { url: signatureUrl },
        headers: { Authorization: token },
      }
    )
    console.log('Signature fetched as base64 successfully')
    return response.data.base64
  } catch (error) {
    console.error('Error fetching signature as base64:', error)
    return null
  }
}
