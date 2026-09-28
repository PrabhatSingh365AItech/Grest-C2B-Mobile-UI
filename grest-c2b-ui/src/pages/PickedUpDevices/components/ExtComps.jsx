import React, { useState } from 'react'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'
import AdminNavbar from '../../../components/Admin_Navbar'
import SideMenu from '../../../components/SideMenu'
import UploadReceiptModal from '../../../components/UploadReceiptModal'
import { OUT_FOR_PICKUP, ApprovDelivery } from '../constants'
import { StatusModals } from './StatusModals'

const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg'

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO

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
  tempUCode,
  setConfMod,
  setErrorMsg,
  setErrorMsg1,
  setErrorMsg2,
  getData,
  tempId,
  uploadReceiptMod,
  setUploadReceiptMod,
}) => {
  const [sideMenu, setsideMenu] = useState(false)
  const token1 = sessionStorage.getItem('authToken')

  const handleUploadReceipt = (file, remarks) => {
    const formData = new FormData()
    formData.append('paymentReceipt', file)
    formData.append('remarks', remarks || '')

    const config = {
      method: 'put',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pickupDevices/updatePaymentReceipt/${tempId}`,
      headers: {
        Authorization: token1,
      },
      data: formData,
      timeout: 60000,
    }

    return axios
      .request(config)
      .then((response) => {
        const statusConfig = {
          method: 'post',
          url: `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/pickupDevices/update`,
          headers: { Authorization: token1 },
          data: {
            refIDs: [tempId],
            newStatus: OUT_FOR_PICKUP,
          },
        }

        return axios.request(statusConfig).then(() => {
          setUploadReceiptMod(false)
          setErrorMsg(`Payment confirmed successfully for Lot ${tempUCode}`)
          setErrorMsg1('Status updated to OUT_FOR_PICKUP.')
          setErrorMsg2(
            'Receipt uploaded and email sent to store with Excel report.'
          )
          setSuccessMod(true)
          getData()
        })
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          `Failed to upload receipt for Lot ${tempUCode}`
        setErrorMsg(errorMessage)
        setFailMode(true)
        throw error
      })
  }

  const statusUpdHandler = (refID, newStatus, skipSuccessModal = false) => {
    setConfMod(false)
    if (!skipSuccessModal) {
      setIsTableLoaded(true)
      const config = {
        method: 'post',
        url: `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/pickupDevices/update`,
        headers: { Authorization: token1 },
        data: {
          refIDs: [refID],
          newStatus: newStatus,
        },
      }
      axios
        .request(config)
        .then((response) => {
          getData()
          setErrorMsg(
            `Successfully Updated Status of Lot ${tempUCode} to ${newStatus}`
          )
          if (newStatus === ApprovDelivery) {
            setErrorMsg(`Delivery Approved for Lot ${refID}.`)
            setErrorMsg1('Check it on history.')
          }
          setSuccessMod(true)
          setIsTableLoaded(false)
        })
        .catch((error) => {
          setErrorMsg(
            `Failed to Updated Status of Lot ${refID} to ${newStatus}`
          )
          setFailMode(true)
          setIsTableLoaded(false)
        })
    } else {
      setUploadReceiptMod(true)
      setIsTableLoaded(false)
    }
  }

  return (
    <React.Fragment>
      <div className='flex items-center border-b-2 w-screen h-16 py-4 bg-white HEADER '>
        <div className='navbar'>
          <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
          <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
        </div>
      </div>
      <StatusModals
        successMod={successMod}
        failMod={failMod}
        confMod={confMod}
        errorMsg={errorMsg}
        errorMsg1={errorMsg1}
        errorMsg2={errorMsg2}
        setSuccessMod={setSuccessMod}
        setFailMode={setFailMode}
        setConfMod={setConfMod}
        tempUCode={tempUCode}
        onConfirm={() => statusUpdHandler(tempId, OUT_FOR_PICKUP, true)}
      />
      <UploadReceiptModal
        isOpen={uploadReceiptMod}
        onClose={() => {
          setUploadReceiptMod(false)
          setIsTableLoaded(false)
        }}
        onUpload={handleUploadReceipt}
        lotCode={tempUCode}
        isLoading={false}
      />
      {isTableLoaded && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isTableLoaded}
            size={15}
          />
        </div>
      )}
    </React.Fragment>
  )
}

export default ExtComps
