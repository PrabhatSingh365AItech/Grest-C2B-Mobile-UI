import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { AADHAR_LENGTH } from '../../constants/priceConstants'
import {
  sendAadhaarOtp,
  verifyAadhaarOtp,
} from '../../services/paysprintAadhaarService'
import ConsentCheckbox from '../ConsentCheckbox'

const AadharNumberField = ({
  aadharNumber,
  setAadharNumber,
  isVerified,
  setIsVerified,
}) => {
  const [error, setError] = useState(true)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [aadhaarConsent, setAadhaarConsent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [clientId, setClientId] = useState('')
  const pink = 'bg-primary'

  useEffect(() => {
    if (aadharNumber) {
      validateAadharNumber(aadharNumber)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateAadharNumber = (value) => {
    if (value.length !== AADHAR_LENGTH) {
      setError('Aadhar Number number must be exactly 12 digits.')
      return false
    } else if (!/^\d{12}$/.test(value)) {
      setError('Aadhar Number must only contain digits.')
      return false
    }
    setError('')
    return true
  }

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    setAadharNumber(value)
    setOtp('')
    setOtpSent(false)
    setClientId('')
    validateAadharNumber(value)
  }

  const isSuccessResponse = (response) => {
    const explicitStatus = response?.status ?? response?.success
    if (typeof explicitStatus === 'boolean') {
      return explicitStatus
    }

    const code =
      response?.response_code ?? response?.status_code ?? response?.statuscode
    if (code !== undefined) {
      const normalized = String(code)
      return normalized === '1' || normalized === '200'
    }

    return true
  }

  const handleSendOtp = async () => {
    if (!validateAadharNumber(aadharNumber)) {
      return
    }

    if (!aadhaarConsent) {
      toast.error('Please provide consent for Aadhaar collection')
      return
    }

    setIsSendingOtp(true)

    try {
      const response = await sendAadhaarOtp(aadharNumber)
      if (!isSuccessResponse(response)) {
        throw new Error(response?.message || 'Failed to send Aadhaar OTP')
      }

      const extractedClientId = response?.client_id

      if (!extractedClientId) {
        throw new Error(
          'Missing client id in PaySprint response. Please check backend response mapping.',
        )
      }

      setClientId(String(extractedClientId))
      setOtpSent(true)
      setError('')
      toast.success('OTP sent to Aadhaar linked mobile number')
    } catch (err) {
      console.error('Send Aadhaar OTP error:', err)
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to send OTP'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpSent) {
      toast.error('Please send OTP first')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error('OTP must be 6 digits')
      return
    }

    if (!clientId) {
      toast.error('Missing verification context. Please resend OTP.')
      return
    }

    setIsVerifyingOtp(true)
    try {
      const response = await verifyAadhaarOtp({
        client_id: clientId,
        otp,
      })

      if (!isSuccessResponse(response)) {
        throw new Error(response?.message || 'Invalid or expired OTP')
      }

      setError('')
      setIsVerified(true)
      toast.success('Aadhar verified successfully!')
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to verify OTP'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const getButtonClass = () => {
    if (isVerified) {
      return 'bg-green-500 cursor-not-allowed'
    }
    if (!error && !isSendingOtp) {
      return pink
    }
    return 'bg-gray-400 cursor-not-allowed'
  }

  const getButtonText = () => {
    if (isVerified) {
      return 'Verified'
    }
    if (isSendingOtp) {
      return 'Sending OTP...'
    }
    return 'Send OTP'
  }

  return (
    <div className='flex flex-col eminumber mt-[4px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>2.</p>
        <p className='text-base font-medium three'>
          Enter your Aadhar Number
          <span className='text-red-500'>*</span>
        </p>
      </div>

      <div className='flex flex-wrap items-center gap-4 mt-2 ml-[19px]'>
        <input
          type='text'
          className='w-auto p-2 border-2 border-gray-300 rounded outline-none'
          value={aadharNumber}
          placeholder='Aadhar no.'
          onChange={handleChange}
          maxLength={12}
          disabled={isVerified}
        />
        <button
          className={`px-4 py-2 font-bold text-white rounded ${getButtonClass()}`}
          onClick={handleSendOtp}
          disabled={!!error || isSendingOtp || otpSent}
        >
          {getButtonText()}
        </button>
      </div>

      {otpSent && !isVerified && (
        <div className='flex items-center gap-4 mt-3 ml-[19px]'>
          <input
            type='text'
            className='w-auto p-2 border-2 border-gray-300 rounded outline-none'
            value={otp}
            placeholder='Enter OTP'
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
          />
          <button
            className={`px-4 py-2 font-bold text-white rounded ${
              isVerifyingOtp ? 'bg-gray-400 cursor-not-allowed' : pink
            }`}
            onClick={handleVerifyOtp}
            disabled={isVerifyingOtp || otp.length !== 6}
          >
            {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      )}
      {error && typeof error === 'string' && (
        <p className='text-primary mt-2 text-sm'>{error}</p>
      )}

      <div className='mt-4 ml-[19px]'>
        <ConsentCheckbox
          consentType='aadhaar_collection'
          onConsentChange={setAadhaarConsent}
          required={true}
        />
      </div>
    </div>
  )
}

export default AadharNumberField
