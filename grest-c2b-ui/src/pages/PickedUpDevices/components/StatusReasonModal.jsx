import React from 'react'
import ReasonModal from './ReasonModal'
import {
  PickConf,
  PickupCompleteConf,
  PickupCancelConf,
  PickDelivered,
  DeliveredConf,
  ApprovDelivery,
  OutForPickup,
} from '../constants'

const STATUS_TITLES = {
  [PickConf]: 'Pickup Reason',
  [PickupCompleteConf]: 'Pickup Complete Reason',
  [PickupCancelConf]: 'Pickup Cancel Reason',
  [PickDelivered]: 'Pickup Delivered Reason',
  [DeliveredConf]: 'Accept Delivery Reason',
  [ApprovDelivery]: 'Approve Delivery Reason',
  [OutForPickup]: 'Out For Pickup Reason',
}

export const StatusReasonModal = ({ statusKey, isOpen, onClose, onSubmit }) => {
  if (!isOpen) {
    return null
  }

  return (
    <ReasonModal
      title={STATUS_TITLES[statusKey] || 'Reason'}
      placeholder={`Enter reason for ${
        STATUS_TITLES[statusKey]?.toLowerCase() || 'this action'
      }`}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  )
}
