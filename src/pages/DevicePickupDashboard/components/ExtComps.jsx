import React, { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io'
import styles from '../DevicePickupDashboard.module.css'
import SideMenu from '../../../components/SideMenu'
import AdminNavbar from '../../../components/Admin_Navbar'
import axios from 'axios'

const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg'
const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO
const buttonStyles = 'bg-primary text-white'
const succTextColor = 'text-green-500'
const failTextColor = 'text-primary'
const PickupAvail = 'Available For Pickup'
const LoggedInUser = JSON.parse(sessionStorage.getItem('profile'))

const ExtComps = ({
  successMod,
  errorMsg,
  errorMsg1,
  errorMsg2,
  setSuccessMod,
  isTableLoaded,
  setIsTableLoaded,
  failMod,
  setFailMode,
  confMod,
  setConfMod,
  setErrorMsg,
  setErrorMsg1,
  setErrorMsg2,
  getData,
  selectedIds,
  pendingTableData,
  allStore,
  storeName,
  setSelectedIds,
  setSelectedData,
  setSelectedRows,
}) => {
  const [sideMenu, setsideMenu] = useState(false)
  const token1 = sessionStorage.getItem('authToken')
  const LoggedInUser1 = JSON.parse(sessionStorage.getItem('profile'))

  const reqPickupHandler = () => {
    setConfMod(false)
    const statuschk = selectedIds.every((sId) =>
      pendingTableData.some(
        (device) => device._id === sId && device.status === PickupAvail
      )
    )
    if (!statuschk) {
      setIsTableLoaded(false)
      setErrorMsg('Some devices are not Available for Pickup')
      setFailMode(true)
      return
    }
    const address =
      allStore.find((store) => store.storeName === storeName)?._id ||
      pendingTableData?.filter((obj) => selectedIds[0] === obj._id)[0]
        ?.storeDetails?.storeId

    const LDIds = pendingTableData
      ?.filter((obj) => selectedIds.includes(obj._id))
      .map((obj) => obj._id.toString())

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/pickupreq`,
      headers: {
        Authorization: token1,
      },
      data: {
        deviceIDs: LDIds,
        storeid: address,
        userid: LoggedInUser1?._id,
      },
    }
    axios
      .request(config)
      .then((response) => {
        setSelectedIds([])
        setSelectedData([])
        setSelectedRows([])
        getData()
        setErrorMsg(`Successfully Created Lot`)
        setErrorMsg1(`Lot No. :- ${response.data.data.uniqueCode}`)
        setErrorMsg2(`Check it On Picked Up`)
        setSuccessMod(true)
        setIsTableLoaded(false)
      })
      .catch((error) => {
        setErrorMsg(`Failed to create lot`)
        setFailMode(true)
        setIsTableLoaded(false)
      })
  }
  return (
    <React.Fragment>
      {isTableLoaded && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isTableLoaded}
            size={15}
          />
        </div>
      )}
      {successMod && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${succTextColor}`}>
            <IoIosCheckmarkCircle className={succTextColor} size={90} />
            <h6 className={succTextColor}>Success!</h6>
            <p className='text-slate-500'>{errorMsg}</p>
            {errorMsg1 && <p className='text-slate-500'>{errorMsg1}</p>}
            {errorMsg2 && <p className='text-slate-500'>{errorMsg2}</p>}
            <button
              onClick={() => {
                setSuccessMod(false)
                setErrorMsg1(null)
                setErrorMsg2(null)
              }}
              className={'text-white  bg-green-500 '}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {failMod && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center h-full w-full bg-black bg-opacity-50'>
          <div className={` ${failTextColor} ${styles.err_mod_box}`}>
            <IoIosCloseCircle size={90} className={failTextColor} />
            <h6 className={failTextColor}>Error!</h6>
            <p className='text-slate-500'>{errorMsg}</p>
            <button
              className={buttonStyles}
              onClick={() => {
                setFailMode(false)
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confMod && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${failTextColor}`}>
            <h6 className={failTextColor}>Confirmation!</h6>
            <p className='text-slate-500'>
              {`Do you want to send ${selectedIds.length} devices for Pickup ?`}
            </p>
            <div className='flex flex-row gap-2'>
              <button onClick={reqPickupHandler} className={buttonStyles}>
                Okay
              </button>
              <button
                onClick={() => {
                  setConfMod(false)
                  setIsTableLoaded(false)
                }}
                className='bg-white text-primary'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className='flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER header'>
        <div className='navbar'>
          <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
          <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
        </div>
      </div>
    </React.Fragment>
  )
}

export default ExtComps
