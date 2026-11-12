import axios from 'axios'

const BASE = `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/logistics`

const authHeaders = () => ({
  headers: { Authorization: sessionStorage.getItem('authToken') },
})

// Turns an axios error into the server's message, or a readable fallback.
export const errorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback

// True when a request was cancelled on purpose (a newer one replaced it).
export const isCancelled = (error) => axios.isCancel(error) || error?.name === 'CanceledError'

const toQueryString = (params) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    const empty = value === '' || value === null || value === undefined ||
      (Array.isArray(value) && value.length === 0)
    if (!empty) {
      query.set(key, Array.isArray(value) ? value.join(',') : String(value))
    }
  })
  return query.toString()
}

export const fetchPaidLeads = async (params, signal) => {
  const { data } = await axios.get(`${BASE}/paid-leads?${toQueryString(params)}`, {
    ...authHeaders(),
    signal,
  })
  return data
}

// Every row matching the filters, page by page: the list endpoint caps limit at
// 100, so export walks the pages instead of asking for an unbounded result.
const EXPORT_PAGE_SIZE = 100

export const fetchAllPaidLeads = async (params, signal) => {
  const rows = []
  let page = 0
  let totalPages = 0
  do {
    const { data } = await axios.get(
      `${BASE}/paid-leads?${toQueryString({ ...params, page, limit: EXPORT_PAGE_SIZE })}`,
      { ...authHeaders(), signal }
    )
    rows.push(...(data.data || []))
    totalPages = data.pagination?.totalPages || 0
    page += 1
  } while (page < totalPages)
  return rows
}

export const fetchFilterOptions = async () => {
  const { data } = await axios.get(`${BASE}/filters`, authHeaders())
  return data.data
}

export const fetchItem = async (leadId) => {
  const { data } = await axios.get(`${BASE}/items/${leadId}`, authHeaders())
  return data.data
}

export const updateItem = async (leadId, body) => {
  const { data } = await axios.patch(`${BASE}/items/${leadId}`, body, authHeaders())
  return data
}

export const saveManualBooking = async (leadId, body) => {
  const { data } = await axios.post(
    `${BASE}/items/${leadId}/manual-booking`,
    body,
    authHeaders()
  )
  return data
}

export const updateLogisticsStatus = async (leadId, body) => {
  const { data } = await axios.post(
    `${BASE}/items/${leadId}/status`,
    body,
    authHeaders()
  )
  return data
}

export const fetchBookingContext = async (leadId) => {
  const { data } = await axios.get(`${BASE}/items/${leadId}/bluedart`, authHeaders())
  return data.data
}

export const checkPincode = async (pincode, value) => {
  const { data } = await axios.get(
    `${BASE}/bluedart/pincode/${pincode}?value=${encodeURIComponent(value || 0)}`,
    authHeaders()
  )
  return data.data
}

// Bluedart bookings can take several seconds; allow up to a minute.
export const bookWithBluedart = async (leadId, body) => {
  const { data } = await axios.post(`${BASE}/items/${leadId}/bluedart`, body, {
    ...authHeaders(),
    timeout: 60000,
  })
  return data
}

export const bulkBookWithBluedart = async (body) => {
  const { data } = await axios.post(`${BASE}/bluedart/bulk`, body, {
    ...authHeaders(),
    timeout: 300000,
  })
  return data
}

// Asks Bluedart for the latest scan; the server updates the status from it.
export const trackBluedartShipment = async (leadId) => {
  const { data } = await axios.post(`${BASE}/items/${leadId}/track`, {}, {
    ...authHeaders(),
    timeout: 60000,
  })
  return data
}

export const fetchLabelUrl = async (leadId) => {
  const { data } = await axios.get(`${BASE}/items/${leadId}/label`, authHeaders())
  return data.data.url
}

export const cancelShipment = async (leadId, body) => {
  const { data } = await axios.post(
    `${BASE}/items/${leadId}/cancel`,
    body,
    authHeaders()
  )
  return data
}
