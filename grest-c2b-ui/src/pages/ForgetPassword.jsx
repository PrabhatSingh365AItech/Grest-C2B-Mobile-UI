import React, { useState } from 'react'
import '../styles/ForgetPassword.scss'
const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg' // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { MdOutlineMailLock } from 'react-icons/md'
import { RiLockPasswordLine } from 'react-icons/ri'
import OtpInput from 'otp-input-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { IoArrowBack, IoEye, IoEyeOffSharp } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
const iconStyles = { margin: '0px 10px', color: 'var(--primary-color)' }

const ForgetPassword = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email')
  const [isLoading, setIsLoading] = useState(false)
  const [change, setChange] = useState(1)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const handleEmailSubmit = (event) => {
    setIsLoading(true)
    event.preventDefault()
    const data = {
      email: email,
    }
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/sendOTP`,
        data
      )
      .then((response) => {
        toast.success('OTP sent')
        setStep('otp')
        setIsLoading(false)
      })
      .catch((error) => {
        toast.error(error.response.data.message || 'Failed to sent OTP')
        console.error(error)
        setIsLoading(false)
      })
  }

  const handleOtpSubmit = async (event) => {
    setIsLoading(true)
    event.preventDefault()
    const data = {
      email: email,
      otp: otp,
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/verifyEmailOtp`,
        data
      )
      toast.success('successfully verified OTP')
      setChange(2)
      setIsLoading(false)
    } catch (error) {
      toast.error(error.response.data.message || 'Failed to verified OTP')
      console.error(error)
      setIsLoading(false)
    }
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  }
  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match!')
    } else {
      setIsLoading(true)
      const data = {
        email: email,
        newPassword: password,
      }
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/reset/Password`,
          data
        )
        console.log(response.data)
        toast.success('Password changed successfully')
        setTimeout(function () {
          navigate('/')
        }, 2000)
      } catch (error) {
        toast.error('failed to change Password')
        console.error(error)
        setIsLoading(false)
      }
    }
  }

  return (
    <div className='outer'>
      <div className='flex flex-col items-center justify-center box'>
        <div className='imgBox'>
          <img className='w-48' src={GREST_LOGO} />
          <div className='flex gap-2 items-center justify-center'>
            <button
              onClick={() => navigate(-1)}
              className='text-xs flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full'
            >
              <IoArrowBack size={20} />
            </button>
            <h1 className='mb-2 text-2xl font-semibold sm:text-3xl'>
              Password Recovery
            </h1>
          </div>
          <div className='underline'></div>
        </div>
        <div className='innerbox'>
          {change === 1 && step === 'email' ? (
            <div className='flex flex-col items-center w-full gap-6'>
              <div>
                <p className='mt-5 font-bold text-center opacity-60'>
                  Enter email to get recovery OTP
                </p>
              </div>

              <form
                className='flex flex-col w-full gap-6'
                onSubmit={handleEmailSubmit}
              >
                <input type='hidden' name='remember' value='true' />

                <div className=''>
                  <div className='input'>
                    <MdOutlineMailLock size={25} style={iconStyles} />
                    <input
                      id='email-address'
                      name='email'
                      type='email'
                      autoComplete='email'
                      minLength={5}
                      required
                      placeholder='Enter email address'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className='mb-6 login_button_holder'>
                  <button
                    type='submit'
                    className={`login_button ${isLoading && 'opacity-[0.8]'}`}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <div className='-ml-4 spinner'>
                        <LoadingSpinner />
                      </div>
                    )}
                    {isLoading ? (
                      <span className='-ml-4'>Loading</span>
                    ) : (
                      <span>Get OTP</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            change !== 2 && (
              <OTPInput
                isLoading={isLoading}
                handleOtpSubmit={handleOtpSubmit}
                otp={otp}
                setOtp={setOtp}
              />
            )
          )}
          {change === 2 && (
            <div className='flex flex-col items-center w-full gap-6'>
              <div>
                <p className='mt-5 font-bold text-center opacity-60'>
                  Create new password
                </p>
              </div>
              <PassConfirm
                handleSubmit={handleSubmit}
                password={password}
                handlePasswordChange={handlePasswordChange}
                confirmPassword={confirmPassword}
                handleConfirmPasswordChange={handleConfirmPasswordChange}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgetPassword

const OTPInput = ({ isLoading, handleOtpSubmit, otp, setOtp }) => {
  return (
    <div className='flex flex-col items-center w-full gap-6'>
      <div>
        <p className='mt-5 font-bold text-center opacity-60'>
          Enter OTP to verify email address
        </p>
      </div>
      <form className='flex flex-col w-full gap-6' onSubmit={handleOtpSubmit}>
        <input type='hidden' name='remember' value='true' />
        <div className=''>
          <div className='flex flex-col items-center ml-5'>
            <OtpInput
              value={otp}
              onChange={setOtp}
              OTPLength={6}
              otpType='number'
              disabled={false}
              autoFocus
              inputStyles={{
                border: '2px solid var(--primary-color)',
                borderRadius: '.55rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div className='mb-6 login_button_holder'>
          <button
            type='submit'
            className={`login_button ${isLoading && 'opacity-[.8]'}`}
            disabled={isLoading}
          >
            {isLoading && (
              <div className='-ml-4 spinner'>
                <LoadingSpinner />
              </div>
            )}
            {isLoading ? (
              <span className='-ml-4'>Loading</span>
            ) : (
              <span>Verify Email</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

const PassConfirm = ({
  handleSubmit,
  password,
  handlePasswordChange,
  confirmPassword,
  handleConfirmPasswordChange,
  isLoading,
}) => {
  const [showUserPassword, setShowUserPassword] = useState(false)
  const [showUserPassword2, setShowUserPassword2] = useState(false)

  return (
    <form onSubmit={handleSubmit} className='flex flex-col w-full gap-6'>
      <input type='hidden' name='remember' value='true' />
      <div className='flex flex-col gap-6'>
        <div className='relative input'>
          <RiLockPasswordLine size={25} style={iconStyles} />
          <input
            minLength={6}
            id='password'
            name='password'
            type={showUserPassword ? 'text' : 'password'}
            required
            placeholder='New Password'
            value={password}
            onChange={handlePasswordChange}
          />
          <span
            onClick={() => setShowUserPassword(!showUserPassword)}
            className='absolute transform -translate-y-1/2 cursor-pointer right-2 top-6'
          >
            {!showUserPassword ? <IoEyeOffSharp /> : <IoEye />}
          </span>
        </div>
        <div className='relative input'>
          <RiLockPasswordLine size={25} style={iconStyles} />
          <input
            minLength={6}
            id='confirm-password'
            name='confirmPassword'
            type={showUserPassword2 ? 'text' : 'password'}
            required
            placeholder='Confirm Password'
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          <span
            onClick={() => setShowUserPassword2(!showUserPassword2)}
            className='absolute transform -translate-y-1/2 cursor-pointer right-2 top-6'
          >
            {!showUserPassword2 ? <IoEyeOffSharp /> : <IoEye />}
          </span>
        </div>
      </div>
      <div className='mb-6 login_button_holder'>
        <button
          type='submit'
          className={`login_button ${isLoading && 'opacity-[.8]'}`}
          disabled={isLoading}
        >
          {isLoading && (
            <div className='-ml-4 spinner'>
              <LoadingSpinner />
            </div>
          )}
          {isLoading ? (
            <span className='-ml-4'>Loading</span>
          ) : (
            <span>Change Password</span>
          )}
        </button>
      </div>
    </form>
  )
}
