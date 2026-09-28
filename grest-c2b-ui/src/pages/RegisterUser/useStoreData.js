import { useState, useEffect } from 'react'
import axios from 'axios'

const getStoreApi = async () => {
  const token = sessionStorage.getItem('authToken')

  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/findAll?page=0&limit=9999`,
      { headers: { Authorization: token } }
    )

    return response.data.result.map((store) => ({
      storeName: store.storeName,
      _id: store._id,
      region: store.region,
    }))
  } catch (err) {
    console.log(err)
    return []
  }
}

export const useStoreData = (isSuperAdmin, setFormData) => {
  const [storeData, setStoreData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true)
      const stores = await getStoreApi()
      setStoreData(stores)

      if (!isSuperAdmin && stores.length === 1) {
        setFormData((prev) => ({ ...prev, storeId: stores[0]._id }))
      }

      setLoading(false)
    }

    fetchStores()
  }, [isSuperAdmin])

  return { storeData, loading }
}
