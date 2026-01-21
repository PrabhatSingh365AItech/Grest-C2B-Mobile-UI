import React, { useState } from 'react'
import axios from 'axios'
import ViewPickupTable from '../../../components/ViewPickupTable/ViewPickupTable'
import UserAdminContent from './UserAdminContent'
import styles from '../PickedUpDevices.module.css'
import { StatusReasonModal } from './StatusReasonModal'
import {
  userRoles,
  TABLE_CELL_BASE,
  TABLE_CELL_CENTER,
  FLEX_COL_GAP_1,
  checkOnPkd,
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

const renderTableRow = (val, index, renderActionCell) => (
  <tr key={index} className={index % 2 === 0 ? 'bg-gray-200' : ''}>
    {renderActionCell(val)}
    <td className={TABLE_CELL_CENTER}>{val?.status}</td>
    <td className={TABLE_CELL_CENTER}>
      {new Date(val.createdAt).toLocaleDateString('en-GB')}
    </td>
    <td className={TABLE_CELL_CENTER}>{val?.uniqueCode || val?._id}</td>
    <td className={TABLE_CELL_CENTER}>{val?.totalDevice}</td>
    <td className={TABLE_CELL_CENTER}>{val?.totalAmount}</td>
    <td className={TABLE_CELL_CENTER}>{val?.remarks || ''}</td>
    {/* Added Location Data Cell */}
    <td className={TABLE_CELL_CENTER}>{val?.location || ''}</td>
  </tr>
)

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
        { headers: { Authorization: token2 } }
      )
      .then(() => {
        // Success messages
        let msg = `Successfully Updated Status to ${newStatus}`
        let msg1 = `Lot No. :- ${uniqueCode}`
        let msg2 = checkOnPkd

        if (newStatus === PickConf) {
          msg = `Pickup Confirmed Successfully, Lot No. ${uniqueCode}`
          msg1 = `Status Pending for Delivery at Warehouse`
        } else if (newStatus === PickDelivered) {
          msg1 = `Pending Admin Approval for Delivery for Lot No. :- ${uniqueCode}`
          msg2 = 'Check it On History'
        } else if (newStatus === ApprovDelivery) {
          msg2 = 'Check it On History'
        }

        setErrorMsg(msg)
        setErrorMsg1(msg1)
        setErrorMsg2(msg2)
        setSuccessMod(true)
        getData()
        setIsTableLoaded(false)
      })
      .catch(() => {
        setErrorMsg(
          `Failed to update the status of lot ${uniqueCode} to ${newStatus}`
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

  // Check if there's no data
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
          <table className='w-full border border-primary'>
            <thead className='bg-primary text-white'>
              <tr>
                <th className={TABLE_CELL_BASE}>Action</th>
                <th className={TABLE_CELL_BASE}>Status</th>
                <th className={TABLE_CELL_BASE}>Date</th>
                <th className={TABLE_CELL_BASE}>Lot Number</th>
                <th className={TABLE_CELL_BASE}>Number Of Device</th>
                <th className={TABLE_CELL_BASE}>Amount</th>
                <th className={TABLE_CELL_BASE}>Reason</th>
                <th className={TABLE_CELL_BASE}>Location</th>
              </tr>
            </thead>
            <tbody>
              {data.map((val, index) =>
                renderTableRow(val, index, renderActionCell)
              )}
            </tbody>
          </table>
        )}
      </div>

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
