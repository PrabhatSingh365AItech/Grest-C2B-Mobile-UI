import React from 'react'
import {
  CancelModal,
  HoldModal,
  QCDoneModal,
  AvailableForPickupModal,
  PendingInQCModal,
} from './StatusModals'

const ModalContainer = ({
  showCancelModal,
  setShowCancelModal,
  showHoldModal,
  setShowHoldModal,
  showQCDoneModal,
  setShowQCDoneModal,
  showAvailableForPickupModal,
  setShowAvailableForPickupModal,
  showPendingInQCModal,
  setShowPendingInQCModal,
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
}) => (
  <React.Fragment>
    {showCancelModal && (
      <CancelModal
        setShowCancelModal={setShowCancelModal}
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
    )}
    {showHoldModal && (
      <HoldModal
        setShowHoldModal={setShowHoldModal}
        setIsTableLoaded={setIsTableLoaded}
        token2={token2}
        selectedIds={selectedIds}
        getData={getData}
        setSelectedIds={setSelectedIds}
        setSelectedData={setSelectedData}
        setSelectedRows={setSelectedRows}
        setErrorMsg={setErrorMsg}
        setSuccessMod={setSuccessMod}
        setFailMode={setFailMode}
      />
    )}
    {showQCDoneModal && (
      <QCDoneModal
        setShowQCDoneModal={setShowQCDoneModal}
        setIsTableLoaded={setIsTableLoaded}
        token2={token2}
        selectedIds={selectedIds}
        getData={getData}
        setSelectedIds={setSelectedIds}
        setSelectedData={setSelectedData}
        setSelectedRows={setSelectedRows}
        setErrorMsg={setErrorMsg}
        setSuccessMod={setSuccessMod}
        setFailMode={setFailMode}
      />
    )}
    {showAvailableForPickupModal && (
      <AvailableForPickupModal
        setShowAvailableForPickupModal={setShowAvailableForPickupModal}
        setIsTableLoaded={setIsTableLoaded}
        token2={token2}
        selectedIds={selectedIds}
        getData={getData}
        setSelectedIds={setSelectedIds}
        setSelectedData={setSelectedData}
        setSelectedRows={setSelectedRows}
        setErrorMsg={setErrorMsg}
        setSuccessMod={setSuccessMod}
        setFailMode={setFailMode}
      />
    )}
    {showPendingInQCModal && (
      <PendingInQCModal
        setShowPendingInQCModal={setShowPendingInQCModal}
        setIsTableLoaded={setIsTableLoaded}
        token2={token2}
        selectedIds={selectedIds}
        getData={getData}
        setSelectedIds={setSelectedIds}
        setSelectedData={setSelectedData}
        setSelectedRows={setSelectedRows}
        setErrorMsg={setErrorMsg}
        setSuccessMod={setSuccessMod}
        setFailMode={setFailMode}
      />
    )}
  </React.Fragment>
)

export default ModalContainer
