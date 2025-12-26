import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { AADHAR_LENGTH } from '../../constants/priceConstants'
import { createDigilockerKYCRequest } from '../../services/digilockerService'
import {
  loadDigilockerSDK,
  initializeDigilocker,
  submitDigilockerKYC,
  parseDigilockerCallback,
} from '../../utils/digilockerSDK'

const AadharNumberField = ({
  aadharNumber,
  setAadharNumber,
  isVerified,
  setIsVerified,
}) => {
  const [error, setError] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const pink = 'bg-primary'

  const otpData = localStorage.getItem('otpData')
    ? JSON.parse(localStorage.getItem('otpData'))
    : null

  useEffect(() => {
    // Load Digilocker SDK on component mount
    loadDigilockerSDK()
      .then((Digio) => {
        console.log('Digilocker SDK loaded successfully')
      })
      .catch((err) => {
        console.error('Failed to load Digilocker SDK:', err)
      })
  }, [])

  useEffect(() => {
    // Listen for app URL opens (deep links) on mobile
    if (!Capacitor.isNativePlatform()) {
      return // Only for mobile apps
    }

    const handleAppUrlOpen = App.addListener('appUrlOpen', async (data) => {
      console.log('App opened with URL:', data.url)

      // Check if it's a Digilocker callback
      if (data.url && data.url.includes('grestc2b://digilocker/callback')) {
        // Close the system browser
        await Browser.close()

        const response = parseDigilockerCallback(data.url)

        if (response) {
          console.log('Deep link callback response:', response)

          // Check for success FIRST - ignore cancelled if no error_code
          if (
            response.message === 'success' ||
            (response.message !== 'failed' && !response.error_code)
          ) {
            setIsVerifying(false)
            setError('')
            setIsVerified(true)
            toast.success('Aadhar verified successfully!')
            console.log(
              'Verification completed successfully via deep link',
              response
            )
          }
          // Only treat as error if there's an error_code or explicit failure
          else if (response.error_code || response.message === 'failed') {
            setIsVerifying(false)
            const errorMessage =
              response.message || 'Verification failed. Please try again.'
            setError(errorMessage)
            toast.error(errorMessage)
            console.error('Error in Digilocker process:', response)
          }
        }
      }
    })

    // Cleanup listener on unmount
    return () => {
      handleAppUrlOpen.remove()
    }
  }, [setIsVerified])

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
    const value = e.target.value
    setAadharNumber(value)
    validateAadharNumber(value)
  }

  const handleVerify = async () => {
    if (!validateAadharNumber(aadharNumber)) {
      return
    }

    setIsVerifying(true)

    try {
      // Step 1: Ensure SDK is loaded
      await loadDigilockerSDK()

      // Step 2: Call Digilocker API to create KYC request
      const kycData = {
        customer_identifier: otpData.email,
        customer_name: otpData.name,
        template_name: import.meta.env.VITE_DIGIO_TEMPLATE_NAME,
        notify_customer: false,
        expire_in_days: 10,
        generate_access_token: true,
        reference_id: '1234',
        transaction_id: 'ABCW233',
      }

      const response = await createDigilockerKYCRequest(kycData)

      console.log('KYC Request Response:', response)

      // Step 3: Initialize Digilocker SDK with callback
      const digio = initializeDigilocker({
        callback: function (sdkResponse) {
          console.log('Digilocker SDK Response:', sdkResponse)
          setIsVerifying(false)

          // On iOS, ignore SDK callback if verification is already done via deep link
          // if (isVerified) {
          //   console.log(
          //     'Verification already completed via deep link, ignoring SDK callback'
          //   )
          //   return
          // }

          setError('')
          setIsVerified(true)
          toast.success('Aadhar verified successfully!')
          console.log('Verification completed successfully', sdkResponse)
          // Check for successful verification FIRST
          // if (
          //   sdkResponse.message === 'success' ||
          //   (sdkResponse.message !== 'failed' && sdkResponse.message !== 'cancelled' && !sdkResponse.hasOwnProperty('error_code'))
          // ) {
          // }
          // // Check for errors in the response
          // else if (
          //   sdkResponse.hasOwnProperty('error_code') ||
          //   sdkResponse.message === 'failed'
          // ) {
          //   const errorMessage =
          //     sdkResponse.message || 'Verification failed. Please try again.'
          //   setError(errorMessage)
          //   toast.error(errorMessage)
          //   console.error('Error in Digilocker process:', sdkResponse)
          // }
        },
        event_listener: function (event) {
          console.log('Digilocker Event:', event.event)

          // Handle specific events
          if (event.event === 'success') {
            console.log('Verification success event received')
          } else if (event.event === 'failure') {
            toast.error('Verification failed')
          } else if (event.event === 'navigate_url' && event.url) {
            // On mobile, intercept the URL and open in system browser
            if (Capacitor.isNativePlatform()) {
              console.log('Opening URL in system browser:', event.url)
              Browser.open({
                url: event.url,
                presentationStyle: 'popover',
                windowName: '_self',
              })
            }
          }
        },
      })

      // Step 4: Submit to Digilocker with entity_id, identifier, and access_token
      const entityId = response.access_token.entity_id
      const identifier = response.customer_identifier
      const accessToken = response.access_token.id

      console.log('Submitting to Digilocker:', {
        entityId,
        identifier,
        accessToken,
      })

      submitDigilockerKYC(digio, entityId, identifier, accessToken)
    } catch (err) {
      console.error('Verification error:', err)
      const errorMessage =
        err.response?.data?.message ||
        'Failed to initiate verification. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
      setIsVerifying(false)
    }
  }

  // Determine button class based on verification state
  const getButtonClass = () => {
    if (isVerified) {
      return 'bg-green-500 cursor-not-allowed'
    }
    if (!error && !isVerifying) {
      return pink
    }
    return 'bg-gray-400 cursor-not-allowed'
  }

  // Determine button text based on verification state
  const getButtonText = () => {
    if (isVerified) {
      return 'Verified'
    }
    if (isVerifying) {
      return 'Verifying...'
    }
    return 'Verify'
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

      <div className='flex items-center gap-4 mt-2 ml-[19px]'>
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
          onClick={handleVerify}
          disabled={!!error || isVerifying || isVerified}
        >
          {getButtonText()}
        </button>
      </div>
      {error && typeof error === 'string' && (
        <p className='text-primary mt-2 text-sm'>{error}</p>
      )}
    </div>
  )
}

export default AadharNumberField
