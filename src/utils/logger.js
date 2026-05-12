import {
  maskAadhaar,
  maskPhone,
  maskEmail,
  maskIMEI,
  maskPAN,
  maskGST,
  containsPII,
} from './piiMasking'

const sanitizeString = (data) => {
  const cleaned = data.replace(/[\s-()]/g, '')

  if (/^\d{12}$/.test(cleaned)) {
    return maskAadhaar(data)
  }

  if (/^(\+91)?\d{10}$/.test(cleaned)) {
    return maskPhone(data)
  }

  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data)) {
    return maskEmail(data)
  }

  if (/^\d{15}$/.test(cleaned)) {
    return maskIMEI(data)
  }

  if (/^[A-Z]{5}\d{4}[A-Z]$/i.test(data.replace(/\s/g, ''))) {
    return maskPAN(data)
  }

  if (
    /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/i.test(
      data.replace(/\s/g, ''),
    )
  ) {
    return maskGST(data)
  }

  if (containsPII(data)) {
    return '[CONTAINS PII - MASKED]'
  }

  return data
}

const sanitizeNumber = (num) => {
  const str = String(num)

  if (str.length === 12) {
    return maskAadhaar(str)
  }
  if (str.length === 10) {
    return maskPhone(str)
  }
  if (str.length === 15) {
    return maskIMEI(str)
  }

  return num
}

const sanitizeObject = (obj, sanitizeFn) => {
  const piiKeys = [
    'aadhaar',
    'aadhar',
    'phone',
    'mobile',
    'email',
    'imei',
    'pan',
    'gst',
    'password',
    'token',
    'secret',
  ]

  const sanitized = {}

  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase()

    if (piiKeys.some((piiKey) => keyLower.includes(piiKey))) {
      sanitized[key] = '[MASKED]'
    } else {
      sanitized[key] = sanitizeFn(value)
    }
  }

  return sanitized
}

class SecureLogger {
  constructor() {
    this.isProduction = import.meta.env.PROD
    this.isDevelopment = import.meta.env.DEV

    // Store original console methods
    this._originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    }
  }

  sanitize(data) {
    if (data === null || data === undefined) {
      return data
    }

    if (typeof data === 'string') {
      return sanitizeString(data)
    }

    if (typeof data === 'number') {
      return sanitizeNumber(data)
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item))
    }

    if (typeof data === 'object') {
      return sanitizeObject(data, (value) => this.sanitize(value))
    }

    return data
  }

  log(...args) {
    if (this.isProduction) {
      return
    } // Disable in production

    const sanitized = args.map((arg) => this.sanitize(arg))
    this._originalConsole.log(...sanitized)
  }

  /**
   * Safe warn method - masks PII before logging
   */
  warn(...args) {
    if (this.isProduction) {
      return
    } // Disable in production

    const sanitized = args.map((arg) => this.sanitize(arg))
    this._originalConsole.warn(...sanitized)
  }

  /**
   * Safe error method - masks PII before logging
   * Note: Errors are still logged in production but with PII masked
   */
  error(...args) {
    const sanitized = args.map((arg) => this.sanitize(arg))
    this._originalConsole.error(...sanitized)
  }

  /**
   * Safe info method - masks PII before logging
   */
  info(...args) {
    if (this.isProduction) {
      return
    } // Disable in production

    const sanitized = args.map((arg) => this.sanitize(arg))
    this._originalConsole.info(...sanitized)
  }

  /**
   * Safe debug method - masks PII before logging
   */
  debug(...args) {
    if (this.isProduction) {
      return
    } // Disable in production

    const sanitized = args.map((arg) => this.sanitize(arg))
    this._originalConsole.debug(...sanitized)
  }

  /**
   * Replaces global console methods with secure versions
   * Call this once in main.jsx to secure all console.log calls
   */
  replaceGlobalConsole() {
    if (this.isProduction) {
      // In production, completely disable console except errors
      console.log = () => {}
      console.warn = () => {}
      console.info = () => {}
      console.debug = () => {}
      console.error = (...args) => this.error(...args)
    } else {
      // In development, replace with sanitizing versions
      console.log = (...args) => this.log(...args)
      console.warn = (...args) => this.warn(...args)
      console.error = (...args) => this.error(...args)
      console.info = (...args) => this.info(...args)
      console.debug = (...args) => this.debug(...args)
    }
  }

  /**
   * Restores original console methods
   * Useful for debugging if needed
   */
  restoreGlobalConsole() {
    console.log = this._originalConsole.log
    console.warn = this._originalConsole.warn
    console.error = this._originalConsole.error
    console.info = this._originalConsole.info
    console.debug = this._originalConsole.debug
  }
}

// Export singleton instance
const logger = new SecureLogger()
export default logger
