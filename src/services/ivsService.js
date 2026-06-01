import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_REACT_APP_ENDPOINT

export const IVS_STATUS = {
  CLEAN: 'CLEAN',
  BLOCKED: 'BLOCKED',
  STOLEN: 'STOLEN',
  UNKNOWN: 'UNKNOWN',
  ERROR: 'ERROR',
}

export const STATUS_CONFIG = {
  [IVS_STATUS.CLEAN]: {
    label: 'Clean / Valid',
    color: 'green',
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-800',
    icon: '✅',
    allowTransaction: true,
  },
  [IVS_STATUS.BLOCKED]: {
    label: 'Blocked',
    color: 'red',
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-800',
    icon: '🚫',
    allowTransaction: false,
  },
  [IVS_STATUS.STOLEN]: {
    label: 'Stolen',
    color: 'red',
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-800',
    icon: '⚠️',
    allowTransaction: false,
  },
  [IVS_STATUS.UNKNOWN]: {
    label: 'Unknown / No Record',
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-800',
    icon: '❓',
    allowTransaction: false,
  },
  [IVS_STATUS.ERROR]: {
    label: 'IVS Unavailable',
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-800',
    icon: '⚠️',
    allowTransaction: false,
  },
}

export async function verifyIMEI({
  imei1,
  imei2,
  deviceModel,
  storeId,
  agentId,
  leadId,
}) {
  const token = sessionStorage.getItem('authToken')
  if (!token) {
    throw new Error('Authentication token not found')
  }

  const payload = {
    imei1,
    storeId,
    agentId,
  }

  if (imei2) payload.imei2 = imei2
  if (deviceModel) payload.deviceModel = deviceModel
  if (leadId) payload.leadId = leadId

  const response = await axios.post(
    `${API_BASE_URL}/api/imei/verify`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    },
  )

  return response.data?.data
}
