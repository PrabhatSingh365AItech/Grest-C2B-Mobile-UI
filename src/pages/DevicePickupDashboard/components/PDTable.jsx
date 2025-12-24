import React, { useState } from 'react'
import PendingDevicesTable from '../../../components/PendingDevicesTable/PendingDevicesTable'
import StatusSelector from './StatusSelector'
import ModalContainer from './ModalContainer'
import { useStatusHandlers } from '../hooks/useStatusHandlers'
import axios from 'axios'

const PDTable = ({
  pendingTableData,
  setSelectedData,
  setSelectedIds,
  setSelectedRows,
  selectedData,
  selectedRows,
  selectedStatus,
  selectedIds,
  setConfMod,
  setErrorMsg,
  setErrorMsg1,
  setErrorMsg2,
  setFailMode,
  setSelectedStatus,
  setIsTableLoaded,
  setSuccessMod,
  getData,
}) => {
  const token2 = sessionStorage.getItem('authToken')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [showQCDoneModal, setShowQCDoneModal] = useState(false)
  const [showAvailableForPickupModal, setShowAvailableForPickupModal] =
    useState(false)
  const [showPendingInQCModal, setShowPendingInQCModal] = useState(false)

  const statusHandlers = {
    setSelectedIds,
    setSelectedData,
    setSelectedRows,
    setIsTableLoaded,
    setErrorMsg,
    setErrorMsg1,
    setErrorMsg2,
    setSuccessMod,
    setFailMode,
    getData
  }

  const {
    showModalForStatus,
    createStatusUpdateConfig,
    handleUpdateSuccess,
    handleUpdateError,
  } = useStatusHandlers(token2, statusHandlers)

  const handleStatusUpdate = (event) => {
    if (selectedIds.length === 0) {
      setErrorMsg('No device selected')
      setFailMode(true)
      return
    }
    const newStatus = event.target.value
    setSelectedStatus(newStatus)
    setIsTableLoaded(true)

    const LDIds = pendingTableData
      .filter((obj) => selectedIds.includes(obj._id))
      .map((obj) => obj._id.toString())

    if (
      showModalForStatus(
        newStatus,
        setShowAvailableForPickupModal,
        setShowHoldModal,
        setShowQCDoneModal,
        setShowPendingInQCModal,
        setShowCancelModal
      )
    ) {
      return
    }

    const config = createStatusUpdateConfig(LDIds, newStatus)
    axios
      .request(config)
      .then((response) => handleUpdateSuccess(response, newStatus))
      .catch(handleUpdateError)
    setSelectedStatus('')
  }

  const confHandler = () => {
    setIsTableLoaded(true)
    if (selectedIds.length === 0) {
      setIsTableLoaded(false)
      setErrorMsg('No device selected')
      setFailMode(true)
    } else {
      setConfMod(true)
    }
  }

  return (
    <React.Fragment>
      <PendingDevicesTable
        pendingTableData={pendingTableData}
        setSelectedIds={setSelectedIds}
        setSelectedData={setSelectedData}
        setSelectedRows={setSelectedRows}
        selectedData={selectedData}
        selectedRows={selectedRows}
      />
      <StatusSelector
        selectedStatus={selectedStatus}
        handleStatusUpdate={handleStatusUpdate}
        confHandler={confHandler}
      />
      <ModalContainer
        showCancelModal={showCancelModal}
        setShowCancelModal={setShowCancelModal}
        showHoldModal={showHoldModal}
        setShowHoldModal={setShowHoldModal}
        showQCDoneModal={showQCDoneModal}
        setShowQCDoneModal={setShowQCDoneModal}
        showAvailableForPickupModal={showAvailableForPickupModal}
        setShowAvailableForPickupModal={setShowAvailableForPickupModal}
        showPendingInQCModal={showPendingInQCModal}
        setShowPendingInQCModal={setShowPendingInQCModal}
        setIsTableLoaded={setIsTableLoaded}
        token2={token2}
        selectedIds={selectedIds}
        getData={getData}
        setSelectedIds={setSelectedIds}
        setSelectedData={setSelectedData}
        setSelectedRows={setSelectedRows}
        setErrorMsg={setErrorMsg}
        setErrorMsg1={setErrorMsg1}
        setErrorMsg2={setErrorMsg2}
        setSuccessMod={setSuccessMod}
        setFailMode={setFailMode}
      />
    </React.Fragment>
  )
}

export default PDTable
