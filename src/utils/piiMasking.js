function applyMask(value, userRole, permissionCheck, maskFn) {
  const shouldMask = !permissionCheck(userRole)
  return shouldMask ? maskFn(value) : value
}

export function maskAadhaar(aadharNumber) {
  if (!aadharNumber) {
    return ''
  }

  // Convert to string and remove any spaces or dashes
  const cleaned = String(aadharNumber).replace(/[\s-]/g, '')

  // Validate it's a 12-digit number
  if (!/^\d{12}$/.test(cleaned)) {
    return aadharNumber // Return original if invalid format
  }

  // Show only last 4 digits
  const lastFour = cleaned.slice(-4)
  return `XXXX XXXX ${lastFour}`
}

export function maskPhone(phoneNumber) {
  if (!phoneNumber) {
    return ''
  }

  // Convert to string and remove spaces, dashes, parentheses
  const cleaned = String(phoneNumber).replace(/[\s\-()]/g, '')

  // Handle +91 country code
  if (cleaned.startsWith('+91')) {
    const digits = cleaned.slice(3)
    if (digits.length === 10) {
      return `+91 XXXXX X${digits.slice(-4)}`
    }
  }

  // Handle 10-digit Indian number
  if (/^\d{10}$/.test(cleaned)) {
    return `+91 XXXXX X${cleaned.slice(-4)}`
  }

  // For other formats, just mask middle digits
  if (cleaned.length >= 4) {
    const lastFour = cleaned.slice(-4)
    return `${'X'.repeat(cleaned.length - 4)}${lastFour}`
  }

  return phoneNumber // Return original if too short
}

export function maskEmail(email) {
  if (!email || typeof email !== 'string') {
    return ''
  }

  const parts = email.split('@')
  if (parts.length !== 2) {
    return email // Invalid email format
  }

  const [localPart, domain] = parts

  // Show first 2 characters of local part
  if (localPart.length <= 2) {
    return `${localPart}****@${domain}`
  }

  return `${localPart.substring(0, 2)}****@${domain}`
}

export function maskIMEI(imei) {
  if (!imei) {
    return ''
  }

  // Convert to string and remove any dashes or spaces
  const cleaned = String(imei).replace(/[\s-]/g, '')

  // Validate it's a 15-digit number
  if (!/^\d{15}$/.test(cleaned)) {
    return imei // Return original if invalid format
  }

  // Show only last 4 digits in formatted style
  const lastFour = cleaned.slice(-4)
  return `XXXXXX-XXXXXX-${lastFour}`
}

export function maskPAN(pan) {
  if (!pan || typeof pan !== 'string') {
    return ''
  }

  // Remove spaces and convert to uppercase
  const cleaned = pan.replace(/\s/g, '').toUpperCase()

  // Validate PAN format (5 letters, 4 digits, 1 letter)
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(cleaned)) {
    return pan // Return original if invalid format
  }

  // Show only last 4 characters
  const lastFour = cleaned.slice(-4)
  return `XXXXX${lastFour}`
}

export function maskGST(gst) {
  if (!gst || typeof gst !== 'string') {
    return ''
  }

  // Remove spaces and convert to uppercase
  const cleaned = gst.replace(/\s/g, '').toUpperCase()

  // Validate GST format (15 characters)
  if (cleaned.length !== 15) {
    return gst // Return original if invalid format
  }

  // Show only last 4 characters
  const lastFour = cleaned.slice(-4)
  return `${'X'.repeat(11)}${lastFour}`
}

export function maskAccountNumber(accountNumber) {
  if (!accountNumber) {
    return ''
  }

  const cleaned = String(accountNumber).replace(/\s/g, '')

  if (cleaned.length <= 4) {
    return accountNumber
  }

  const lastFour = cleaned.slice(-4)
  return `${'X'.repeat(cleaned.length - 4)}${lastFour}`
}

export function canViewFullPII(userRole) {
  const fullAccessRoles = ['Super Admin', 'Admin Manager']
  return fullAccessRoles.includes(userRole)
}

export function canViewFullPhone(userRole) {
  const phoneAccessRoles = ['Super Admin', 'Admin Manager', 'Technician']
  return phoneAccessRoles.includes(userRole)
}

export function canViewFullEmail(userRole) {
  // All authenticated users can see full email (as per business requirement)
  return !!userRole
}

export function maskPII(value, type, userRole) {
  if (!value) {
    return ''
  }

  const normalizedType = type?.toLowerCase()

  switch (normalizedType) {
    case 'aadhaar':
      return applyMask(value, userRole, canViewFullPII, maskAadhaar)

    case 'phone':
    case 'mobile':
      return applyMask(value, userRole, canViewFullPhone, maskPhone)

    case 'email':
      return applyMask(value, userRole, canViewFullEmail, maskEmail)

    case 'imei':
      return applyMask(value, userRole, canViewFullPII, maskIMEI)

    case 'pan':
      return applyMask(value, userRole, canViewFullPII, maskPAN)

    case 'gst':
      return applyMask(value, userRole, canViewFullPII, maskGST)

    case 'account':
    case 'accountnumber':
      return applyMask(value, userRole, canViewFullPII, maskAccountNumber)

    default:
      return value
  }
}

export function containsPII(text) {
  if (!text || typeof text !== 'string') {
    return false
  }

  const piiPatterns = [
    /\d{12}/, // Aadhaar pattern
    /\d{10}/, // Phone pattern
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email pattern
    /\d{15}/, // IMEI pattern
    /[A-Z]{5}\d{4}[A-Z]/, // PAN pattern
    /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/, // GST pattern
  ]

  return piiPatterns.some((pattern) => pattern.test(text))
}
