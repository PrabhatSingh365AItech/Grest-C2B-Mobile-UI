import axios from 'axios'
import toast from 'react-hot-toast'

export const submitFormData = async (formData, token, navigate) => {
  const { imeinumber, leadsubmitDATA, savedOtpData, aadharNumber, aadharVerificationReason } = formData

  const submissionData = new FormData()
  submissionData.append('IMEI', imeinumber)
  submissionData.append('leadId', leadsubmitDATA?.id)
  submissionData.append('emailId', savedOtpData?.email)
  submissionData.append('name', savedOtpData?.name)
  submissionData.append('phoneNumber', savedOtpData?.phone)
  submissionData.append('aadharNumber', aadharNumber)
  // Present only when Aadhaar was entered manually (verification off, or a
  // DigiLocker error) instead of a real DigiLocker verification, so backend
  // has an audit trail of why it wasn't auto-verified.
  if (aadharVerificationReason) {
    submissionData.append('aadharVerificationReason', aadharVerificationReason)
  }

  try {
    await axios.post(
      `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/questionnaires/upload-documents`,
      submissionData,
      { headers: { Authorization: token } }
    )

    toast.success('Documents submitted successfully!')
    navigate('/specialoffers')
    return true
  } catch (error) {
    console.error('Submission error:', error)
    toast.error('Failed to submit documents. Please try again.')
    return false
  }
}
