import axios from 'axios'
import toast from 'react-hot-toast'

// Constants
const TOAST_POSITION = 'top-center'

// Track active toasts to prevent duplicates
const activeToasts = {
  401: null,
  403: null,
  429: null,
  network: null,
}

// Track if a redirect is already happening
let isRedirecting = false

// Helper: show toast once per key
const showToastOnce = (key, message, options) => {
  if (activeToasts[key]) {
    console.log(`[Toast Blocked] Duplicate ${key} toast prevented`)
    return null
  }

  console.log(`[Toast Shown] ${key}: ${message}`)

  const toastId = toast.error(message, {
    ...options,
    onClose: () => {
      console.log(`[Toast Closed] ${key} toast closed, tracking cleared`)
      activeToasts[key] = null
    },
  })

  activeToasts[key] = toastId
  return toastId
}

// Helper: logout handler (void function now)
const handleLogout = (message) => {
  if (isRedirecting) {
    return
  }

  isRedirecting = true

  sessionStorage.removeItem('authToken')
  sessionStorage.removeItem('userProfile')
  sessionStorage.removeItem('role')

  showToastOnce('401', message, {
    duration: 3000,
    position: TOAST_POSITION,
  })

  setTimeout(() => {
    isRedirecting = false
    window.location.href = '/'
  }, 1500)
}

// Centralized API error handler
const handleResponseError = (error) => {
  // Check if this request should skip interceptor toast
  if (error.config?.headers?.['X-Skip-Interceptor'] === 'true') {
    return Promise.reject(error)
  }

  if (error.response) {
    const { status, data } = error.response

    // 401 Unauthorized
    if (status === 401) {
      const message = data?.message || 'Session expired. Please login again.'
      handleLogout(message)
      return Promise.reject(new Error(message))
    }

    // 403 Forbidden
    if (status === 403) {
      const message =
        data?.message || data?.msg || 'Access denied. Insufficient permissions.'
      showToastOnce('403', message, {
        duration: 4000,
        position: TOAST_POSITION,
      })
      return Promise.reject(new Error(message))
    }

    // 429 Too Many Requests
    if (status === 429) {
      const message =
        data?.message || 'Too many requests. Please try again later.'
      showToastOnce('429', message, {
        duration: 5000,
        position: TOAST_POSITION,
      })
      return Promise.reject(new Error(message))
    }
  }

  // Network error
  if (!error.response) {
    const message = 'Network error. Please check your connection.'
    showToastOnce('network', message, {
      duration: 4000,
      position: TOAST_POSITION,
    })
    return Promise.reject(new Error(message))
  }

  return Promise.reject(error)
}

// Request interceptor
const handleRequest = (config) => {
  const token = sessionStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = token
  }
  return config
}

// Track if global interceptors are already added
let globalInterceptorsSetup = false

// Install global axios interceptors (void function now)
export const setupGlobalInterceptors = () => {
  if (globalInterceptorsSetup) {
    console.log('[Axios] Global interceptors already setup, skipping')
    return
  }

  console.log('[Axios] Setting up global interceptors')
  globalInterceptorsSetup = true

  axios.interceptors.request.handlers = []
  axios.interceptors.response.handlers = []

  axios.interceptors.request.use(handleRequest, (error) =>
    Promise.reject(error)
  )
  axios.interceptors.response.use((response) => response, handleResponseError)
}

// Custom axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_ENDPOINT,
  timeout: 30000,
})

axiosInstance.interceptors.request.use(handleRequest, (error) =>
  Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  handleResponseError
)

export default axiosInstance
