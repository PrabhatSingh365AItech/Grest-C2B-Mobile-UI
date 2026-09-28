import { useState } from 'react'
import axios from 'axios'

export const useDevicePickupData = (token, region, storeName) => {
  const [pendingTableData, setPendingTableData] = useState([])
  const [isTableLoaded, setIsTableLoaded] = useState(false)
  const [devicesCount, setDevicesCount] = useState(0)
  const [devicesPrice, setDevicesPrice] = useState('0')

  const getData = () => {
    setIsTableLoaded(true)
    const config = {
      method: 'get',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/all?region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        if (response?.data?.data?.length > 0) {
          setPendingTableData(response?.data?.data[0]?.documents || [])
          setDevicesPrice(
            response?.data?.data[0]?.totalPrices?.toString() || '0'
          )
          setDevicesCount(response?.data?.data[0]?.count || 0)
        } else {
          setPendingTableData([])
          setDevicesPrice('0')
          setDevicesCount(0)
        }
        setIsTableLoaded(false)
      })
      .catch((error) => {
        console.error('Failed to load data:', error)
        setIsTableLoaded(false)
      })
  }

  return {
    pendingTableData,
    isTableLoaded,
    devicesCount,
    devicesPrice,
    getData,
    setPendingTableData,
    setDevicesCount,
    setDevicesPrice,
    setIsTableLoaded,
  }
}

export const useStoreData = (token) => {
  const [storeData, setStoreData] = useState([])
  const [regionData, setRegionData] = useState([])
  const [allStore, setAllStore] = useState([])

  const getStore = () => {
    const config = {
      method: 'get',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/findAll?page=0&limit=9999`,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        const allData = response.data.result || []
        const storeNamesArray = allData.map((store) => store.storeName)
        const uniqueRegionsArray = [
          ...new Set(allData.map((store) => store.region)),
        ]
        setAllStore(allData)
        setStoreData(storeNamesArray)
        setRegionData(uniqueRegionsArray)
      })
      .catch((error) => {
        console.error('Failed to load store data:', error)
      })
  }

  return { storeData, regionData, allStore, getStore, setStoreData }
}
