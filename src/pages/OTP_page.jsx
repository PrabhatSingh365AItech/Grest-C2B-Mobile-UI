import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setOtpVerified } from '../store/slices/otpSlice'
import { setLeadOTPData } from '../store/slices/responseSlice'
import { MainOtpUI } from '../components/ContOTP/ContOTP'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const currentDomain = window.location.origin
const buyBackUrl = import.meta.env.VITE_BUYBACK_URL

function OTPpage() {
  const initVal = useSelector((state) => state.responseData)
  const [ph, setPh] = useState(initVal.phone)
  const [otp, setOtp] = useState('')
  const dispatch = useDispatch()
  const [timer, setTimer] = useState(30)
  const [otpBoxOpen, setOtpBoxOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [disableResend, setDisableResend] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const token = sessionStorage.getItem('authToken')
  const navigate = useNavigate()

  const [otpData, setOtpData] = useState({
    name: initVal.name,
    email: initVal.email,
    phone: initVal.phone,
  })
  const handleNumberEdit = () => {
    setLoading(false)
    setOtpBoxOpen(!otpBoxOpen)
  }

  const handleChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value,
    })
  }

  useEffect(() => {
    localStorage.setItem('otpData', JSON.stringify(otpData))
  }, [otpData])

  const onSignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (otpData.name.length < 3) {
      setErrMsg('Please enter a name with at least 3 characters.')
      return
    }
    if (!emailRegex.test(otpData.email)) {
      setErrMsg('Invalid Email Format')
      return
    }
    if (otpData.phone.length !== 10) {
      setErrMsg('Mobile: (Must have 10 Digits)')
      return
    }

    setErrMsg('')
    setLoading(true)

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/sms/sendOtp`,
        {
          mobileNumber: otpData.phone,
        },
        {
          headers: { Authorization: token },
        }
      )

      setOtpBoxOpen(true)
      setDisableResend(true)
    } catch (err) {
      console.error(err)
      setErrMsg('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const onOTPVerify = async () => {
    setLoading(true)
    const leadId = sessionStorage.getItem('LeadId')

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/sms/verifyOtp`,
        {
          mobileNumber: otpData.phone,
          otp,
        },
        {
          headers: { Authorization: token },
        }
      )

      if (res?.data?.success && currentDomain === buyBackUrl) {
        const response = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/questionnaires/customerDetail`,
          {
            name: otpData.name,
            emailId: otpData.email,
            phoneNumber: otpData.phone,
            leadId,
          },
          {
            headers: { Authorization: token },
          }
        )

        if (response?.status === 200) {
          navigate('/thankyou')
        } else {
          setErrMsg('Failed to Save Details')
        }
      } else {
        dispatch(setOtpVerified(true))
        dispatch(setLeadOTPData(otpData))
        navigate('/inputnumber')
      }
    } catch (err) {
      console.error(err)
      const isInvalidOtp =
        err.response?.status === 400 &&
        err.response?.data?.error === 'Invalid OTP'
      if (isInvalidOtp) {
        toast.error('Invalid OTP. Please try again.')
      } else {
        toast.error('Invalid or expired OTP')
      }
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    setDisableResend(true)

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/sms/resendOtp`,
        {
          mobileNumber: otpData.phone,
        },
        {
          headers: { Authorization: token },
        }
      )
    } catch (err) {
      console.error(err)
      setErrMsg('Failed to resend OTP')
    }
  }

  useEffect(() => {
    let intrvll
    if (disableResend && timer > 0) {
      intrvll = setInterval(() => {
        setTimer(timer - 1)
      }, 1000)
    } else if (timer === 0) {
      setDisableResend(false)
    } else if (!disableResend) {
      setTimer(30)
    }
    return () => {
      clearInterval(intrvll)
    }
  }, [disableResend, timer])

  return (
    <MainOtpUI
      otpBoxOpen={otpBoxOpen}
      handleNumberEdit={handleNumberEdit}
      ph={ph}
      errMsg={errMsg}
      otp={otp}
      timer={timer}
      onOTPVerify={onOTPVerify}
      loading={loading}
      onSignup={onSignup}
      setOtp={setOtp}
      otpData={otpData}
      handleChange={handleChange}
      setPh={setPh}
      setOtpData={setOtpData}
      resendOTP={resendOTP}
      disableResend={disableResend}
    />
  )
}

export default OTPpage
