import React from 'react'
import styles from '../PickedUpDevices.module.css'
import {
  FLEX_COL_GAP_1,
  DeliveredConf,
  PickDelivered,
  ApprovDelivery,
  OUT_FOR_PICKUP,
  PickupCompleteConf,
  PickupCancelConf,
  OutForPickup,
} from '../constants'

const UserAdminContent = ({
  confHandler,
  val,
  statusUpdateHandler,
  viewHandler,
}) => {
  return (
    <div className={FLEX_COL_GAP_1}>
      <button
        className={`${styles.view_btn}`}
        onClick={() => viewHandler(val?._id)}
      >
        View
      </button>
      {val?.status === 'Pending Payment Confirmation' && (
        <div className={FLEX_COL_GAP_1}>
          <button
            onClick={() => confHandler(val?._id, val?.uniqueCode)}
            className={`${styles.acpt_btn}`}
          >
            Confirm Payment
          </button>
        </div>
      )}
      {val?.status === 'Pickup Complete' && (
        <div className={FLEX_COL_GAP_1}>
          <button
            onClick={() =>
              statusUpdateHandler(val?._id, DeliveredConf, val?.uniqueCode)
            }
            className={`${styles.acpt_btn}`}
          >
            Accept
          </button>
        </div>
      )}
      {val?.status === PickDelivered && (
        <div className={FLEX_COL_GAP_1}>
          <button
            onClick={() =>
              statusUpdateHandler(val?._id, ApprovDelivery, val?.uniqueCode)
            }
            className={`${styles.acpt_btn}`}
          >
            Approve Delivery
          </button>
        </div>
      )}
      {val.status === OUT_FOR_PICKUP && (
        <div className={FLEX_COL_GAP_1}>
          <div className={FLEX_COL_GAP_1}>
            <button
              onClick={() =>
                statusUpdateHandler(
                  val?._id,
                  PickupCompleteConf,
                  val?.uniqueCode
                )
              }
              className={`${styles.acpt_btn}`}
            >
              Pickup Complete
            </button>
          </div>
          <div className={FLEX_COL_GAP_1}>
            {/* <button
              onClick={() =>
                statusUpdateHandler(val?._id, PickupCancelConf, val?.uniqueCode)
              }
              className={`${styles.acpt_btn}`}
            >
              Pickup Cancel
            </button> */}
          </div>
        </div>
      )}
      {val.status === PickupCancelConf && (
        <div className={FLEX_COL_GAP_1}>
          <button
            onClick={() =>
              statusUpdateHandler(val?._id, OutForPickup, val?.uniqueCode)
            }
            className={`${styles.acpt_btn}`}
          >
            Out For Pickup
          </button>
        </div>
      )}
    </div>
  )
}

export default UserAdminContent
