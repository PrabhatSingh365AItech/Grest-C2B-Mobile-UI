import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg'

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO
import { useDispatch } from 'react-redux'
import { setUserProfile, setStoreFilter } from '../store/slices/userSlice'
import '../styles/login.scss'
import { RiLockPasswordLine } from 'react-icons/ri'
import { MdOutlineMailLock } from 'react-icons/md'
import LoadingSpinner from '../components/LoadingSpinner'
import { IoEye, IoEyeOffSharp } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
const homeroute = '/SelectDeviceType'

// Email Input Component
const EmailInput = ({ userEmail, setUserEmail }) => {
  return (
    <div className=''>
      <label htmlFor='userEmail'>Email</label>
      <div className='input'>
        <MdOutlineMailLock
          size={25}
          style={{ margin: '0px 10px', color: 'var(--primary-color)' }}
        />
        <input
          type='text'
          id='userEmail'
          name='userEmail'
          placeholder='Enter email address'
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          required
          className='relative block w-[85%] px-2 py-1 rounded-none appearance-none rounded-b-md focus:outline-none focus:z-10 sm:text-sm'
        />
      </div>
    </div>
  )
}

// Password Input Component
const PasswordInput = ({
  userPassword,
  setUserPassword,
  showUserPassword,
  setShowUserPassword,
}) => {
  return (
    <div className='relative input'>
      <RiLockPasswordLine
        size={25}
        style={{ margin: '0px 10px', color: 'var(--primary-color)' }}
      />
      <input
        type={showUserPassword ? 'text' : 'password'}
        id='password'
        name='password'
        placeholder='Enter password'
        required
        value={userPassword}
        onChange={(e) => setUserPassword(e.target.value)}
        className='relative block w-[85%] px-2 py-1 rounded-none appearance-none rounded-b-md focus:outline-none focus:z-10 sm:text-sm'
      />
      <span
        onClick={() => setShowUserPassword(!showUserPassword)}
        className='absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer z-10'
        style={{ padding: '5px' }}
      >
        {showUserPassword ? <IoEye size={22} /> : <IoEyeOffSharp size={22} />}
      </span>
    </div>
  )
}

// Login Button Component
const LoginButton = ({ userLogin, isLoading }) => {
  return (
    <Link to='/' className='login_button_holder'>
      <button
        onClick={userLogin}
        type='button'
        className={`login_button ${isLoading && 'opacity-[.9]'}`}
        disabled={isLoading}
      >
        {isLoading && (
          <div className='spinner'>
            <LoadingSpinner />
          </div>
        )}
        {isLoading ? (
          <span className='-ml-4'>Loading</span>
        ) : (
          <span>Login</span>
        )}
      </button>
    </Link>
  )
}

// Redirect user based on role
const redirectUser = (role, navigate) => {
  const customTable = '/customertable'
  switch (role) {
    case 'Super Admin':
      navigate('/adminmodels')
      break
    case 'Admin Manager':
    case 'Company Admin':
    case 'Super_Admin_Unicorn':
    case 'Admin_Manager_Unicorn':
      navigate(customTable)
      break
    case 'Technician':
      navigate('/devicepickupdashboard')
      break
    case 'Sale User':
    default:
      navigate(homeroute)
  }
}

// Handle buyback domain logic
const handleBuybackDomain = (dispatch, navigate) => {
  const WEBSITE_SHORT_NAME = import.meta.env.VITE_BUYBACK_SHORT_NAME
  sessionStorage.setItem('authToken', '')
  sessionStorage.setItem(
    'profile',
    JSON.stringify({ firstName: WEBSITE_SHORT_NAME })
  )
  sessionStorage.setItem('DeviceType', 'CTG1')
  localStorage.removeItem('formData')
  dispatch(setUserProfile({ firstName: WEBSITE_SHORT_NAME }))
  navigate(homeroute)
}

// Validate stored session
const validateStoredSession = (
  storedProfile,
  storedToken,
  dispatch,
  navigate
) => {
  if (!storedProfile || !storedToken) {
    return
  }

  axios
    .get(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/getAll`, {
      headers: { Authorization: storedToken },
    })
    .then((response) => {
      dispatch(setUserProfile(storedProfile))
      dispatch(
        setStoreFilter({
          selStore: storedProfile.storeName,
          selRegion: storedProfile.region,
        })
      )
      redirectUser(storedProfile.role, navigate)
    })
    .catch(() => {
      sessionStorage.clear()
      localStorage.clear()
      toast.error('Session expired. Please log in again.')
    })
}

/* ==================== MAIN LOGIN COMPONENT ==================== */

const Login = () => {
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showUserPassword, setShowUserPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const bypassedDomain = import.meta.env.BYPASSED_DOMAIN
    console.log(currentDomain, '  ', bypassedDomain)

    if (currentDomain === import.meta.env.VITE_BUYBACK_URL) {
      handleBuybackDomain(dispatch, navigate)
    } else {
      const storedProfile = JSON.parse(localStorage.getItem('profile'))
      const storedToken = localStorage.getItem('authToken')
      sessionStorage.setItem('authToken', storedToken)
      sessionStorage.setItem('profile', JSON.stringify(storedProfile))
      sessionStorage.setItem('DeviceType', 'CTG1')
      localStorage.removeItem('formData')

      validateStoredSession(storedProfile, storedToken, dispatch, navigate)
    }
  }, [])

  const userLogin = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!emailRegex.test(userEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(null)
    sessionStorage.clear()
    localStorage.clear()

    axios
      .post(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/login`, {
        email: userEmail,
        password: userPassword,
      })
      .then((response) => {
        toast.success('Login successfully')
        const { profile, authToken } = response.data

        sessionStorage.setItem('authToken', authToken)
        sessionStorage.setItem('profile', JSON.stringify(profile))
        sessionStorage.setItem('DeviceType', 'CTG1')

        localStorage.setItem('authToken', authToken)
        localStorage.setItem('profile', JSON.stringify(profile))
        localStorage.setItem('DeviceType', 'CTG1')

        localStorage.removeItem('formData')

        dispatch(setUserProfile(profile))
        dispatch(
          setStoreFilter({
            selStore: profile?.storeName,
            selRegion: profile?.region,
          })
        )

        redirectUser(profile.role, navigate)
      })
      .catch((err) => {
        toast.error('Please enter correct login credentials')
        setIsLoading(false)
        setError(
          err.response?.data?.error || 'Please enter correct login credentials'
        )
      })
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-white Container'>
      <div className='flex flex-col items-center justify-center px-10 pb-4 secondContainer'>
        <img className='w-48 pt-4 mt-2 mb-4' src={GREST_LOGO} alt='app logo' />
        <h1 className='font-sans text-primary mt-2 text-3xl font-bold sm:text-4xl'>
          Login
        </h1>
        {error && <p className='text-sm text-red-500 sm:text-base'>{error}</p>}
        <div
          id='loginForm'
          className='flex flex-col border-b-2 pb-6 gap-4 w-[32vw] formOuter'
        >
          <EmailInput userEmail={userEmail} setUserEmail={setUserEmail} />

          <PasswordInput
            userPassword={userPassword}
            setUserPassword={setUserPassword}
            showUserPassword={showUserPassword}
            setShowUserPassword={setShowUserPassword}
          />

          <Link to='/PasswordRecovery'>
            <span className='text-right text-sm font-medium block text-primary forgetpass'>
              Forgot Password?
            </span>
          </Link>

          <LoginButton userLogin={userLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default Login
