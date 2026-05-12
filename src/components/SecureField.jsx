import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { maskPII, canViewFullPII } from '../utils/piiMasking'

export function SecureField({
  value,
  type,
  showTooltip = true,
  className = '',
  emptyText = '-',
  copyable = false,
}) {
  const [userRole, setUserRole] = useState(null)

  // Get user role from sessionStorage/localStorage
  useEffect(() => {
    const LoggedInUser =
      JSON.parse(sessionStorage.getItem('profile')) ||
      JSON.parse(localStorage.getItem('profile'))
    setUserRole(LoggedInUser?.role)
  }, [])

  console.log(userRole, 'arijit')

  // Handle empty value
  if (!value) {
    return <span className={className}>{emptyText}</span>
  }

  // Apply role-based masking
  const displayValue = maskPII(value, type, userRole)
  const isFullAccess = canViewFullPII(userRole)

  // Tooltip text
  const tooltipText =
    showTooltip && !isFullAccess ? 'Masked for security (DPDP compliance)' : ''

  // Copy to clipboard handler (only if enabled)
  const handleCopy = copyable
    ? (e) => {
        e.preventDefault()
        navigator.clipboard.writeText(displayValue)
        // Optional: Show toast notification
      }
    : undefined

  return (
    <span
      className={`secure-field ${className}`}
      title={tooltipText}
      onClick={handleCopy}
      style={{
        cursor: copyable ? 'pointer' : 'default',
      }}
    >
      {displayValue}
    </span>
  )
}

SecureField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.oneOf([
    'aadhaar',
    'phone',
    'mobile',
    'email',
    'imei',
    'pan',
    'gst',
    'account',
    'accountnumber',
  ]).isRequired,
  showTooltip: PropTypes.bool,
  className: PropTypes.string,
  emptyText: PropTypes.string,
  copyable: PropTypes.bool,
}

export default SecureField
