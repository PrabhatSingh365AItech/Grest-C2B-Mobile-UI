import React, { useState } from 'react'
import axios from 'axios'
import styles from '../DevicePickupDashboard.module.css'

const buttonStyles = 'bg-primary text-white'
const updateStatusError = 'Failed to update status'
const failTextColor = 'text-primary'

export const CancelModal = ({
  setShowCancelModal,
  setIsTableLoaded,
  token2,
  selectedIds,
  getData,
  setSelectedIds,
  setSelectedData,
  setSelectedRows,
  setErrorMsg,
  setErrorMsg1,
  setErrorMsg2,
  setSuccessMod,
  setFailMode,
}) => {
  const [cancelReason, setCancelReason] = useState('')
  const handleCancelSubmit = () => {
    setIsTableLoaded(true)
    const config = {
      method: 'post',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/update`,
      headers: {
        Authorization: token2,
      },
      data: {
        deviceIDs: selectedIds,
        newStatus: 'Cancelled',
        reason: cancelReason,
      },
    }
    axios
      .request(config)
      .then((response) => {
        getData()
        setSelectedIds([])
        setSelectedData([])
        setSelectedRows([])
        setErrorMsg(`Successfully Updated status to Cancelled`)
        setErrorMsg1(`Lot No. not updated yet.`)
        setErrorMsg2(`Check it on Outstanding`)
        setSuccessMod(true)
      })
      .catch((error) => {
        setIsTableLoaded(false)
        setErrorMsg(updateStatusError)
        setFailMode(true)
      })
    setShowCancelModal(false)
    setCancelReason('')
  }
  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <h6 className={failTextColor}>Cancellation Reason</h6>
        <input
          type='text'
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          className='border-2 border-primary rounded-md px-4 py-2 mb-4 w-full'
          placeholder='Enter Reason for Cancellation'
        />
        <div className='flex flex-row gap-2'>
          <button onClick={handleCancelSubmit} className={buttonStyles}>
            Okay
          </button>
          <button
            onClick={() => {
              setShowCancelModal(false)
              setIsTableLoaded(false)
            }}
            className='bg-white text-primary'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export const HoldModal = ({
  setShowHoldModal,
  setIsTableLoaded,
  token2,
  selectedIds,
  getData,
  setSelectedIds,
  setSelectedData,
  setSelectedRows,
  setErrorMsg,
  setSuccessMod,
  setFailMode,
}) => {
  const [holdReason, setHoldReason] = useState('')
  const handleHoldSubmit = () => {
    setIsTableLoaded(true)
    const config = {
      method: 'post',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/update`,
      headers: {
        Authorization: token2,
      },
      data: {
        deviceIDs: selectedIds,
        newStatus: 'On Hold',
        reason: holdReason,
      },
    }
    axios
      .request(config)
      .then((response) => {
        getData()
        setSelectedIds([])
        setSelectedData([])
        setSelectedRows([])
        setErrorMsg(`Successfully updated status to On Hold`)
        setSuccessMod(true)
      })
      .catch((error) => {
        setIsTableLoaded(false)
        setErrorMsg(updateStatusError)
        setFailMode(true)
      })
    setShowHoldModal(false)
    setHoldReason('')
  }
  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <h6 className={failTextColor}>Hold Reason</h6>
        <input
          type='text'
          value={holdReason}
          onChange={(e) => setHoldReason(e.target.value)}
          className='border-2 border-primary rounded-md px-4 py-2 mb-4 w-full'
          placeholder='Enter Reason for Hold'
        />
        <div className='flex flex-row gap-2'>
          <button onClick={handleHoldSubmit} className={buttonStyles}>
            Okay
          </button>
          <button
            onClick={() => {
              setShowHoldModal(false)
              setIsTableLoaded(false)
            }}
            className='bg-white text-primary'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export const QCDoneModal = ({
  setShowQCDoneModal,
  setIsTableLoaded,
  token2,
  selectedIds,
  getData,
  setSelectedIds,
  setSelectedData,
  setSelectedRows,
  setErrorMsg,
  setSuccessMod,
  setFailMode,
}) => {
  const [qcDoneReason, setQCDoneReason] = useState('')
  const handleQCDoneSubmit = () => {
    setIsTableLoaded(true)
    const config = {
      method: 'post',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/update`,
      headers: {
        Authorization: token2,
      },
      data: {
        deviceIDs: selectedIds,
        newStatus: 'QC Done',
        reason: qcDoneReason,
      },
    }
    axios
      .request(config)
      .then((response) => {
        getData()
        setSelectedIds([])
        setSelectedData([])
        setSelectedRows([])
        setErrorMsg(`Successfully updated status to QC Done`)
        setSuccessMod(true)
      })
      .catch((error) => {
        setIsTableLoaded(false)
        setErrorMsg(updateStatusError)
        setFailMode(true)
      })
    setShowQCDoneModal(false)
    setQCDoneReason('')
  }
  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <h6 className={failTextColor}>QC Done Reason</h6>
        <input
          type='text'
          value={qcDoneReason}
          onChange={(e) => setQCDoneReason(e.target.value)}
          className='border-2 border-primary rounded-md px-4 py-2 mb-4 w-full'
          placeholder='Enter Reason for QC Done'
        />
        <div className='flex flex-row gap-2'>
          <button onClick={handleQCDoneSubmit} className={buttonStyles}>
            Okay
          </button>
          <button
            onClick={() => {
              setShowQCDoneModal(false)
              setIsTableLoaded(false)
            }}
            className='bg-white text-primary'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export const AvailableForPickupModal = ({
  setShowAvailableForPickupModal,
  setIsTableLoaded,
  token2,
  selectedIds,
  getData,
  setSelectedIds,
  setSelectedData,
  setSelectedRows,
  setErrorMsg,
  setSuccessMod,
  setFailMode,
}) => {
  const [availableForPickupReason, setAvailableForPickupReason] = useState('')
  const handleAvailableForPickupSubmit = () => {
    setIsTableLoaded(true)
    const config = {
      method: 'post',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/update`,
      headers: {
        Authorization: token2,
      },
      data: {
        deviceIDs: selectedIds,
        newStatus: 'Available For Pickup',
        reason: availableForPickupReason,
      },
    }
    axios
      .request(config)
      .then((response) => {
        getData()
        setSelectedIds([])
        setSelectedData([])
        setSelectedRows([])
        setErrorMsg(`Successfully updated status to Available For Pickup`)
        setSuccessMod(true)
      })
      .catch((error) => {
        setIsTableLoaded(false)
        setErrorMsg(updateStatusError)
        setFailMode(true)
      })
    setShowAvailableForPickupModal(false)
    setAvailableForPickupReason('')
  }
  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <h6 className={failTextColor}>Available For Pickup Reason</h6>
        <input
          type='text'
          value={availableForPickupReason}
          onChange={(e) => setAvailableForPickupReason(e.target.value)}
          className='border-2 border-primary rounded-md px-4 py-2 mb-4 w-full'
          placeholder='Enter Reason for Available For Pickup'
        />
        <div className='flex flex-row gap-2'>
          <button
            onClick={handleAvailableForPickupSubmit}
            className={buttonStyles}
          >
            Okay
          </button>
          <button
            onClick={() => {
              setShowAvailableForPickupModal(false)
              setIsTableLoaded(false)
            }}
            className='bg-white text-primary'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export const PendingInQCModal = ({
  setShowPendingInQCModal,
  setIsTableLoaded,
  token2,
  selectedIds,
  getData,
  setSelectedIds,
  setSelectedData,
  setSelectedRows,
  setErrorMsg,
  setSuccessMod,
  setFailMode,
}) => {
  const [pendingInQCReason, setPendingInQCReason] = useState('')
  const handlePendingInQCSubmit = () => {
    setIsTableLoaded(true)
    const config = {
      method: 'post',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/update`,
      headers: {
        Authorization: token2,
      },
      data: {
        deviceIDs: selectedIds,
        newStatus: 'Pending in QC',
        reason: pendingInQCReason,
      },
    }
    axios
      .request(config)
      .then((response) => {
        getData()
        setSelectedIds([])
        setSelectedData([])
        setSelectedRows([])
        setErrorMsg(`Successfully updated status to Pending in QC`)
        setSuccessMod(true)
      })
      .catch((error) => {
        setIsTableLoaded(false)
        setErrorMsg(updateStatusError)
        setFailMode(true)
      })
    setShowPendingInQCModal(false)
    setPendingInQCReason('')
  }
  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <h6 className={failTextColor}>Pending in QC Reason</h6>
        <input
          type='text'
          value={pendingInQCReason}
          onChange={(e) => setPendingInQCReason(e.target.value)}
          className='border-2 border-primary rounded-md px-4 py-2 mb-4 w-full'
          placeholder='Enter Reason for Pending in QC'
        />
        <div className='flex flex-row gap-2'>
          <button onClick={handlePendingInQCSubmit} className={buttonStyles}>
            Okay
          </button>
          <button
            onClick={() => {
              setShowPendingInQCModal(false)
              setIsTableLoaded(false)
            }}
            className='bg-white text-primary'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
