import React, { useEffect, useState } from 'react'
import { RiLockPasswordLine } from 'react-icons/ri'
import '../../styles/ForgetPassword.scss'
import LoadingSpinner from '../../components/LoadingSpinner'
const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg' // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO
import { MdOutlineMailLock } from 'react-icons/md'
import axiosInstance from '../../utils/axiosInterceptor'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoEye, IoEyeOffSharp } from 'react-icons/io5'
const iconStyles = { margin: '0px 10px', color: 'var(--primary-color)' }

const ChangePassword = () => {
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confPassword, setConfPassword] = useState('')
  const [newFocus, setNewFocus] = useState(false)
  const [confFocus, setConfFocus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const showUserPassword = false
  const [showUserPassword2, setShowUserPassword2] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const navigate = useNavigate()

  // Load user's email from session on mount (read-only for display)
  useEffect(() => {
    const profile = JSON.parse(sessionStorage.getItem('profile'))
    if (profile?.email) {
      setUserEmail(profile.email)
    }
  }, [])

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  }
  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value)
  }
  const handleEmailChange = (event) => {
    setUserEmail(event.target.value)
  }

  const passwordValidation = () => {
    const lCaseRegex = /[a-z]/
    const uCaseRegex = /[A-Z]/
    const numRegex = /\d/
    const spCharRegex = /[@$!%*?&]/
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Validate email format
    if (!emailRegex.test(userEmail)) {
      setErrMsg('Please Enter a Valid Email')
      setIsValid(false)
      return
    } else {
      setErrMsg('')
    }

    if (password.length < 8) {
      setErrMsg('Password Size Must Be More Than 8 Characters')
      setIsValid(false)
      return
    } else {
      setErrMsg('')
    }

    if (newPassword.length < 8) {
      setErrMsg('Password Size Must Be More Than 8 Characters')
      setIsValid(false)
      return
    }
    if (!lCaseRegex.test(newPassword)) {
      setErrMsg('Password Must Contain a Lower Case Letter')
      setIsValid(false)
      return
    }
    if (!uCaseRegex.test(newPassword)) {
      setErrMsg('Password Must Contain a Upper Case Letter')
      setIsValid(false)
      return
    }
    if (!numRegex.test(newPassword)) {
      setErrMsg('Password Must Contain a Number')
      setIsValid(false)
      return
    }
    if (!spCharRegex.test(newPassword)) {
      setErrMsg('Password Must Contain a Speacial Char [@$!%*?&]')
      return
    }
    if (newPassword !== confPassword) {
      setErrMsg("Confirm Password Does'nt Match")
      setIsValid(false)
      return
    }
    if (
      newPassword === confPassword &&
      newPassword.length >= 8 &&
      lCaseRegex.test(newPassword) &&
      uCaseRegex.test(newPassword) &&
      numRegex.test(newPassword) &&
      spCharRegex.test(newPassword)
    ) {
      setIsValid(true)
      setErrMsg('Password Matched Please Submit')
    } else {
      setIsValid(false)
    }
  }

  useEffect(() => {
    passwordValidation()
    console.log(isValid)
  }, [newPassword, confPassword, newFocus, confFocus, userEmail])
  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    const data = {
      email: userEmail,
      oldPassword: password,
      newPassword: newPassword,
    }

    try {
      const res = await axiosInstance.post(
        '/api/userregistry/updatePassword',
        data
      )

      // Show success message
      const successMsg =
        res.data.msg ||
        'Successfully updated user password. Please login again.'
      toast.success(successMsg, {
        duration: 4000,
        position: 'top-center',
      })

      setErrMsg('')

      // Clear session storage
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('userProfile')
      sessionStorage.removeItem('role')

      // Redirect to login after 1 seconds
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (err) {
      console.error('Password change failed:', err)
      setIsLoading(false)
    }
  }
  return (
    <>
      <div className='outer'>
        <PasswordChange
          isValid={isValid}
          password={password}
          newPassword={newPassword}
          errMsg={errMsg}
          userEmail={userEmail}
          setConfPassword={setConfPassword}
          setNewFocus={setNewFocus}
          setConfFocus={setConfFocus}
          isLoading={isLoading}
          showUserPassword={showUserPassword}
          showUserPassword2={showUserPassword2}
          setShowUserPassword2={setShowUserPassword2}
          handlePasswordChange={handlePasswordChange}
          handleNewPasswordChange={handleNewPasswordChange}
          handleEmailChange={handleEmailChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </>
  )
}

const PasswordChange = ({
  isValid,
  password,
  newPassword,
  confPassword,
  errMsg,
  userEmail,
  setConfPassword,
  setNewFocus,
  setConfFocus,
  isLoading,
  showUserPassword,
  showUserPassword2,
  setShowUserPassword2,
  handlePasswordChange,
  handleNewPasswordChange,
  handleEmailChange,
  handleSubmit,
}) => {
  const navigate = useNavigate()
  return (
    <div className='flex flex-col items-center justify-center w-full h-full mt-16'>
      <div className='flex flex-col items-center justify-center box'>
        <div className='imgBox'>
          <img className='w-48 pt-4 mt-2 mb-3' src={GREST_LOGO} />
          <div className='flex gap-2 items-center justify-center'>
            <button
              onClick={() => navigate(-1)}
              className='text-xs flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full'
            >
              <IoArrowBack size={20} />
            </button>

            <h1 className='font-sans text-primary my-2 text-3xl font-bold sm:text-4xl'>
              Change Password
            </h1>
          </div>
          <p
            className={`${
              isValid ? 'text-primary' : 'text-red-600'
            } text-sm h-[20px]`}
          >
            {errMsg}
          </p>
        </div>
        <div className='innerbox'>
          <div className='flex flex-col items-center w-full gap-6'>
            <form
              onSubmit={handleSubmit}
              className='flex flex-col w-full gap-6'
            >
              <input type='hidden' name='remember' value='true' />
              <div className='flex flex-col gap-4'>
                <div className='relative input'>
                  <MdOutlineMailLock size={25} style={iconStyles} />
                  <input
                    id='email-address'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    placeholder='Email Address'
                    value={userEmail}
                    onChange={handleEmailChange}
                  />
                </div>
                <div className='relative input'>
                  <RiLockPasswordLine size={25} style={iconStyles} />
                  <input
                    id='password'
                    name='password'
                    type={showUserPassword2 ? 'text' : 'password'}
                    required
                    minLength={8}
                    maxLength={20}
                    placeholder='Current Password'
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <span
                    onClick={() => setShowUserPassword2(!showUserPassword2)}
                    className='absolute transform -translate-y-1/2 cursor-pointer right-2 top-6'
                  >
                    {!showUserPassword2 ? <IoEyeOffSharp /> : <IoEye />}
                  </span>
                </div>
                <div className='relative input'>
                  <RiLockPasswordLine size={25} style={iconStyles} />
                  <input
                    id='new-password'
                    name='newPassword'
                    type={showUserPassword ? 'text' : 'new-password'}
                    autoComplete='new-password'
                    required
                    minLength={8}
                    maxLength={20}
                    placeholder='New Password'
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    onFocus={() => setNewFocus(true)}
                    onBlur={() => setNewFocus(false)}
                  />
                </div>
                <div className='relative input'>
                  <RiLockPasswordLine size={25} style={iconStyles} />
                  <input
                    id='confirm-password'
                    name='confirmPassword'
                    type={showUserPassword ? 'text' : 'new-password'}
                    autoComplete='new-password'
                    minLength={8}
                    maxLength={20}
                    required
                    placeholder='Confirm Password'
                    value={confPassword}
                    onChange={(e) => setConfPassword(e.target.value)}
                    onFocus={() => setConfFocus(true)}
                    onBlur={() => setConfFocus(false)}
                  />
                </div>
              </div>
              <div className='mb-6 login_button_holder'>
                <button
                  type='submit'
                  className={`login_button ${
                    (isLoading || !isValid) && 'opacity-[.8]'
                  }`}
                  disabled={isLoading || !isValid}
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
          </div>
        </div>
      </div>
    </div>
  )
}
export default ChangePassword
