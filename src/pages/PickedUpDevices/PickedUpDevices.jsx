import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import NavigateTable from '../../components/NavigateTable/NavigateTable'
import ExtComps from './components/ExtComps'
import PickedUpFilter from './components/PickedUpFilter'
import PickedUpDevicesTable from './components/PickedUpDevicesTable'
import styles from './PickedUpDevices.module.css'

const PickedUpDevices = () => {
  const LoggedInUser = JSON.parse(sessionStorage.getItem('profile'))
  const userRole = LoggedInUser?.role || ''
  const QRole = userRole === 'Technician' ? userRole : 'Admin'
  const token = sessionStorage.getItem('authToken')
  const isSuperAdmin = userRole === 'Super Admin'
  const userProfile = useSelector((state) => state.user)
  const [data, setData] = useState([])
  const [isTableLoaded, setIsTableLoaded] = useState(false)
  const [dateValue, setDateValue] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [tempId, setTempId] = useState()
  const [tempUCode, setTempUCode] = useState()
  const [successMod, setSuccessMod] = useState(false)
  const [errorMsg, setErrorMsg] = useState('successfully updated status')
  const [errorMsg1, setErrorMsg1] = useState(null)
  const [errorMsg2, setErrorMsg2] = useState(null)
  const [confMod, setConfMod] = useState(false)
  const [failMod, setFailMode] = useState(false)
  const [region, setRegion] = useState(userProfile.selRegion)
  const [storeName, setStoreName] = useState(userProfile.selStore)
  const [regionData, setRegionData] = useState([])
  const [storeData, setStoreData] = useState([])
  const firsttime = useRef(true)
  const [allStore, setAllStore] = useState([])
  const [uploadReceiptMod, setUploadReceiptMod] = useState(false)

  const getData = () => {
    setIsTableLoaded(true)
    const configuration = {
      method: 'get',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pickupDevices/all?region=${region}&storeName=${storeName}&userRole=${QRole}`,
      headers: { Authorization: token },
    }
    axios
      .request(configuration)
      .then((res) => {
        setData(res.data.data)
        setIsTableLoaded(false)
      })
      .catch((error) => {
        setErrorMsg(`Failed to load data`)
        setIsTableLoaded(false)
        setFailMode(true)
      })
  }

  const getStore = () => {
    setIsTableLoaded(true)
    const configuration = {
      method: 'get',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/findAll?page=0&limit=9999`,
      headers: { Authorization: token },
    }
    axios
      .request(configuration)
      .then((res) => {
        const allData = res.data.result
        const storeNamesArr = res.data.result.map((store) => store.storeName)
        const uniqueRegionsArr = [
          ...new Set(res.data.result.map((store) => store.region)),
        ]
        setStoreData(storeNamesArr)
        setAllStore(allData)
        setIsTableLoaded(false)
        setRegionData(uniqueRegionsArr)
      })
      .catch((error) => {
        setIsTableLoaded(false)
      })
  }

  const getDataBySearch = () => {
    setIsTableLoaded(true)
    const configuration = {
      method: 'get',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pickupDevices/search?rid=${searchValue}&date=${dateValue}&region=${region}&storeName=${storeName}&userRole=${QRole}`,
      headers: { Authorization: token },
    }
    axios
      .request(configuration)
      .then((response) => {
        setData(response.data.data)
        setIsTableLoaded(false)
      })
      .catch((error) => {
        setErrorMsg(`Failed to load data`)
        setFailMode(true)
        setIsTableLoaded(false)
      })
  }

  useEffect(() => {
    if (firsttime.current && !!storeName && !!region) {
      getData()
      if (isSuperAdmin) {
        getStore()
      }
      firsttime.current = false
    } else if (!firsttime.current) {
      getDataBySearch()
    }
  }, [dateValue, storeName, region, searchValue])

  const confHandler = (id, uniqueCode) => {
    console.log(id)
    setTempId(id)
    setTempUCode(uniqueCode)
    setConfMod(true)
  }

  return (
    <div className={`${styles.pickedup_page}`}>
      <ExtComps
        successMod={successMod}
        errorMsg={errorMsg}
        errorMsg1={errorMsg1}
        errorMsg2={errorMsg2}
        setSuccessMod={setSuccessMod}
        isTableLoaded={isTableLoaded}
        setIsTableLoaded={setIsTableLoaded}
        failMod={failMod}
        setFailMode={setFailMode}
        tempUCode={tempUCode}
        confMod={confMod}
        setConfMod={setConfMod}
        setErrorMsg={setErrorMsg}
        setErrorMsg1={setErrorMsg1}
        setErrorMsg2={setErrorMsg2}
        getData={getData}
        tempId={tempId}
        uploadReceiptMod={uploadReceiptMod}
        setUploadReceiptMod={setUploadReceiptMod}
      />
      <div className='flex flex-row m-2 gap-4'></div>
      <NavigateTable />
      <PickedUpFilter
        setSearchValue={setSearchValue}
        searchValue={searchValue}
        getDataBySearch={getDataBySearch}
        setDateValue={setDateValue}
        dateValue={dateValue}
        setRegion={setRegion}
        region={region}
        regionData={regionData}
        storeName={storeName}
        setStoreName={setStoreName}
        allStore={allStore}
        setStoreData={setStoreData}
        storeData={storeData}
        getData={getData}
        isSuperAdmin={isSuperAdmin}
      />
      <PickedUpDevicesTable
        data={data}
        confHandler={confHandler}
        setIsTableLoaded={setIsTableLoaded}
        setConfMod={setConfMod}
        getData={getData}
        setErrorMsg={setErrorMsg}
        setErrorMsg1={setErrorMsg1}
        setErrorMsg2={setErrorMsg2}
        setSuccessMod={setSuccessMod}
        setFailMode={setFailMode}
      />
    </div>
  )
}

export default PickedUpDevices
