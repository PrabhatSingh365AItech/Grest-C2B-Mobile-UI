import axios from 'axios'

const API_BASE = import.meta.env.VITE_REACT_APP_ENDPOINT

export const getAdminReport = async (token, queryParams) => {
  return axios.get(`${API_BASE}/api/store/adminReport?${queryParams}`, {
    headers: { Authorization: `${token}` },
  })
}

export const downloadAdminReport = async (token) => {
  return axios.get(`${API_BASE}/api/store/adminReport`, {
    headers: { Authorization: `${token}` },
  })
}
