import React, { useState } from 'react'
import axios from 'axios'
import ViewPickupTable from '../../../components/ViewPickupTable/ViewPickupTable'
import UserAdminContent from './UserAdminContent'
import PaginationControls from './PaginationControls'
import PickedUpDevicesTableView from './PickedUpDevicesTableView'
import styles from '../PickedUpDevices.module.css'
import { StatusReasonModal } from './StatusReasonModal'
import {
  userRoles,
  TABLE_CELL_CENTER,
  FLEX_COL_GAP_1,
  PendingConf,
  PickConf,
  PickDelivered,
  DeliveredConf,
  ApprovDelivery,
  PickupCompleteConf,
  PickupCancelConf,
  OutForPickup,
} from '../constants'
import NoDataMessage from '../../../components/NoDataMessage'
import { getStatusUpdateMessages } from '../utils/statusMessageUtils'

const PickedUpDevicesTable = ({
  data,
  confHandler,
  setIsTableLoaded,
  setConfMod,
  getData,
  setErrorMsg,
  setErrorMsg1,
  setErrorMsg2,
  setSuccessMod,
  setFailMode,
  currentPage,
  setCurrentPage,
  totalCount,
}) => {
  const LoggedInUser = JSON.parse(sessionStorage.getItem('profile'))
  const userRole = LoggedInUser?.role || ''
  const token2 = sessionStorage.getItem('authToken')
  const [showView, setShowView] = useState(false)
  const [viewRef, setViewRef] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [tempRefId, setTempRefId] = useState('')
  const [tempUniqueCode, setTempUniqueCode] = useState('')
  const [tempNewStatus, setTempNewStatus] = useState('')

  const viewHandler = (refID) => {
    setViewRef(refID)
    setShowView(true)
  }

  const statusUpdateHandler = (refID, newStatus, uniqueCode) => {
    setTempRefId(refID)
    setTempUniqueCode(uniqueCode)
    setTempNewStatus(newStatus)

    const modalStatuses = [
      PickConf,
      PickupCompleteConf,
      PickupCancelConf,
      PickDelivered,
      DeliveredConf,
      ApprovDelivery,
      OutForPickup,
    ]

    if (modalStatuses.includes(newStatus)) {
      setActiveModal(newStatus)
    } else {
      performStatusUpdate(refID, newStatus, uniqueCode, '')
    }
  }

  const performStatusUpdate = (refID, newStatus, uniqueCode, reason = '') => {
    setIsTableLoaded(true)
    setConfMod(false)
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/pickupDevices/update`,
        { refIDs: [refID], newStatus, reason },
        { headers: { Authorization: token2 } },
      )
      .then(() => {
        const { msg, msg1, msg2 } = getStatusUpdateMessages(
          newStatus,
          uniqueCode,
        )
        setErrorMsg(msg)
        setErrorMsg1(msg1)
        setErrorMsg2(msg2)
        setSuccessMod(true)
        getData()
        setIsTableLoaded(false)
      })
      .catch(() => {
        setErrorMsg(
          `Failed to update the status of lot ${uniqueCode} to ${newStatus}`,
        )
        setFailMode(true)
        setIsTableLoaded(false)
      })
  }

  const renderTechnicianActions = (val) => (
    <div className={FLEX_COL_GAP_1}>
      <button className={styles.view_btn} onClick={() => viewHandler(val?._id)}>
        View
      </button>
      {val?.status === PendingConf && (
        <button
          className={styles.acpt_btn}
          onClick={() =>
            statusUpdateHandler(val?._id, PickConf, val?.uniqueCode)
          }
        >
          Pickup
        </button>
      )}
      {val?.status === PickConf && (
        <button
          className={styles.acpt_btn}
          onClick={() =>
            statusUpdateHandler(val?._id, PickDelivered, val?.uniqueCode)
          }
        >
          Pickup Delivered
        </button>
      )}
    </div>
  )

  const renderStoreActions = (val) => (
    <div className={FLEX_COL_GAP_1}>
      <button className={styles.view_btn} onClick={() => viewHandler(val?._id)}>
        View
      </button>
    </div>
  )

  const renderActionCell = (val) => (
    <td className={TABLE_CELL_CENTER}>
      {userRoles[userRole] === 'Store' && renderStoreActions(val)}
      {(userRole === 'Super Admin' ||
        userRole === 'Company Admin' ||
        userRole === 'Admin Manager') && (
        <UserAdminContent
          confHandler={confHandler}
          val={val}
          statusUpdateHandler={statusUpdateHandler}
          viewHandler={viewHandler}
        />
      )}
      {userRole === 'Technician' && renderTechnicianActions(val)}
    </td>
  )

  const hasData = data && data.length > 0

  return (
    <div className={styles.pd_cont}>
      <div className='m-2 overflow-x-auto md:m-5'>
        {showView && (
          <div className={styles.view_wrap}>
            <ViewPickupTable refNo={viewRef} setShowView={setShowView} />
          </div>
        )}

        {!hasData && <NoDataMessage />}

        {hasData && (
          <PickedUpDevicesTableView
            data={data}
            renderActionCell={renderActionCell}
          />
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalCount={totalCount}
      />
      <StatusReasonModal
        statusKey={activeModal}
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        onSubmit={(reason) => {
          performStatusUpdate(tempRefId, tempNewStatus, tempUniqueCode, reason)
          setActiveModal(null)
        }}
      />
    </div>
  )
}

export default PickedUpDevicesTable
