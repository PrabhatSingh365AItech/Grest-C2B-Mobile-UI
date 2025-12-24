import axios from 'axios'
import toast from 'react-hot-toast'

export const submitFormData = async (formData, token, navigate) => {
  const { imeinumber, leadsubmitDATA, savedOtpData, aadharNumber } = formData

  try {
    const response = await axios.post(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/questionnaires/upload-documents`,
      {
        IMEI: imeinumber,
        leadId: leadsubmitDATA?.id,
        emailId: savedOtpData?.email,
        name: savedOtpData?.name,
        phoneNumber: savedOtpData?.phone,
        aadharNumber: aadharNumber,
      },
      {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    )

    toast.success('Documents submitted successfully!')
    navigate('/specialoffers')
    return true
  } catch (error) {
    console.error('❌ Upload documents ERROR:', error)
    toast.error('Failed to submit documents. Please try again.')
    return false
  }
}
