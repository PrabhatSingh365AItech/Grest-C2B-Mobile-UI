// Constants for Price component
export const AADHAR_LENGTH = 12
export const IMEI_LENGTH = 15
export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB in bytes

export const UPLOAD_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
}

export const FILE_KEYS = {
  ADHAAR_FRONT: 'adhaarFront',
  ADHAAR_BACK: 'adhaarBack',
  PHONE_BILL: 'phoneBill',
  PHONE_FRONT: 'phoneFront',
  PHONE_BACK: 'phoneBack',
  PHONE_LEFT: 'phoneLeft',
  PHONE_RIGHT: 'phoneRight',
  PHONE_TOP: 'phoneTop',
  PHONE_BOTTOM: 'phoneBottom',
  SIGNATURE: 'signature', // <-- Added new signature key
  CUSTOMER_PHOTO:'customerPhoto',
  CEIR: 'ceir' // <-- Added new CEIR key
}

export const GREST_LOGO = window.location.origin === import.meta.env.VITE_BUYBACK_URL
  ? '/Grest_Logo_2.jpg'
  : '/Grest_Logo.jpg'
