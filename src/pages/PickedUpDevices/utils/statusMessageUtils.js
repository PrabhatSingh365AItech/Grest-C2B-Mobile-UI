import {
  PickConf,
  PickDelivered,
  ApprovDelivery,
  checkOnPkd,
} from '../constants'

export const getStatusUpdateMessages = (newStatus, uniqueCode) => {
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

  return { msg, msg1, msg2 }
}
