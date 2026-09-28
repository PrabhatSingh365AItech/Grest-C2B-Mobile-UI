import { buildBuckets, bucketKeyFor } from './dateRange'
import {
  ApprovDelivery,
  DeliveredConf,
  FinalStatus,
  OUT_FOR_PICKUP,
  PendingConf,
  PickConf,
  PickDelivered,
  PickupCancelConf,
  PickupCompleteConf,
} from '../../PickedUpDevices/constants'

// Pickup-flow statuses used by the pickup pages. A lead's `status` is only
// trusted as its stage when it is one of these; otherwise the stage falls back
// to the warehouse-received flag, which every sold lead carries.
const PICKUP_STAGES = new Set([
  OUT_FOR_PICKUP,
  PendingConf,
  PickConf,
  PickDelivered,
  DeliveredConf,
  ApprovDelivery,
  PickupCompleteConf,
  PickupCancelConf,
  FinalStatus,
])

// Prices use the same fields the app's own tables show:
//   actualPrice -> "Price" (the device price)
//   finalPrice  -> "Final Price Offered to Customer"
// Only prices recorded on the lead are used: when finalPrice is missing we fall
// back to another recorded price, never to device price + add-ons, because the
// recorded price may already include them (that would inflate the total).
const devicePriceOf = (item) => num(item?.actualPrice ?? item?.price)
const customerPrice = (item) => num(item?.finalPrice ?? item?.price ?? item?.actualPrice)

// Same rules as the Leads Completed table.
const userNameOf = (item) =>
  item?.userId?.firstName
    ? `${item.userId.firstName} ${item.userId.lastName || ''}`.trim()
    : item?.userId?.name || ''

const variantOf = (item) => {
  if (item?.modelId?.type !== 'CTG1') {
    return '-'
  }
  return item?.storage && item?.ram ? `${item.ram}/${item.storage}` : item?.storage || '-'
}

/**
 * Per-device fields for the device dump export (customer, pricing, IMEI).
 * Kept raw here; masking by role happens at export time.
 */
const detailOf = (item) => {
  const doc = item?.documentId || {}
  return {
    companyName: item?.companyInfo?.name || item?.companyId?.name || '',
    purchaseGrade: item?.gradeId?.grade || item?.grade || item?.purchaseGrade || '',
    username: userNameOf(item),
    category: item?.categoryInfo?.categoryName || '',
    product: item?.modelId?.name || '',
    variant: variantOf(item),
    price: item?.actualPrice ?? '',
    negotiation: item?.negotiatedAmount ?? 0,
    coupon: item?.couponDiscount ?? 0,
    bonus: item?.slabApplied ? item?.slabBonusAmount ?? 0 : 0,
    // Raw recorded value, so the dump can be reconciled with Leads Completed.
    finalPrice: item?.finalPrice ?? '',
    imei: doc.IMEI || '',
    uniqueCode: item?.uniqueCode || '',
    reason: item?.reason || '',
    customerName: item?.name || '',
    customerPhone: item?.phoneNumber || '',
    customerEmail: item?.emailId || '',
    receivedDate: item?.grestRecDate || '',
  }
}

const stageOf = (item) => {
  if (PICKUP_STAGES.has(item?.status)) {
    return item.status
  }
  return item?.grestReceived === 'yes' ? 'Received at warehouse' : 'Awaiting pickup'
}

const UNKNOWN = 'Unknown'

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * Flattens a raw prospect (populated differently across endpoints) into the
 * few fields the overview needs. All fallbacks mirror the existing reports.
 */
export const normalizeRecord = (item, fallbackCategory) => {
  const modelName = item?.modelId?.name || UNKNOWN
  const company = item?.companyInfo || item?.companyId || item?.store?.companyId
  const devicePrice = devicePriceOf(item)
  const slabBonus = item?.slabApplied ? num(item?.slabBonusAmount) : 0
  const negotiation = num(item?.negotiatedAmount)
  const coupon = num(item?.couponDiscount)
  const extras = slabBonus + negotiation + coupon
  const paidToCustomer = customerPrice(item)

  return {
    id: item?._id || item?.uniqueCode,
    date: new Date(item?.createdAt || item?.updatedAt),
    categoryName:
      item?.categoryInfo?.categoryName || fallbackCategory?.categoryName || UNKNOWN,
    // The category it was fetched under, for client-side category filtering.
    categoryCode: fallbackCategory?.categoryCode || '',
    companyId: (typeof company === 'object' ? company?._id : company) || UNKNOWN,
    companyName: (typeof company === 'object' && company?.name) || UNKNOWN,
    storeId: item?.store?._id || UNKNOWN,
    storeName: item?.store?.storeName || UNKNOWN,
    region: item?.store?.region || UNKNOWN,
    // Brand isn't populated on prospects; the admin models page derives it the same way.
    brand: modelName === UNKNOWN ? UNKNOWN : modelName.split(' ')[0],
    model: modelName,
    grade: item?.grade || item?.purchaseGrade || UNKNOWN,
    staff: item?.userId?.firstName
      ? `${item.userId.firstName} ${item.userId.lastName || ''}`.trim()
      : UNKNOWN,
    staffEmail: item?.userId?.email || '',
    basePrice: devicePrice,
    devicePrice,
    slabBonus,
    negotiation,
    coupon,
    // Whatever the recorded final price doesn't explain (rounding, fees).
    adjustment: paidToCustomer - (devicePrice + extras),
    // Paid to the customer. Commission comes from the per-company rate and is
    // added later, so changing a rate needs no refetch.
    customerPrice: paidToCustomer,
    customerExtras: extras,
    commission: 0,
    paid: paidToCustomer,
    extras,
    received: item?.grestReceived === 'yes',
    stage: stageOf(item),
    detail: detailOf(item),
  }
}

// Dimensions the page can group by and cross-filter on.
export const DIMENSIONS = {
  category: { idKey: 'categoryName', labelKey: 'categoryName' },
  company: { idKey: 'companyId', labelKey: 'companyName' },
  store: { idKey: 'storeId', labelKey: 'storeName', extraKey: 'region' },
  region: { idKey: 'region', labelKey: 'region' },
  brand: { idKey: 'brand', labelKey: 'brand' },
  model: { idKey: 'model', labelKey: 'model', extraKey: 'brand' },
  grade: { idKey: 'grade', labelKey: 'grade' },
  staff: { idKey: 'staff', labelKey: 'staff', extraKey: 'storeName' },
  stage: { idKey: 'stage', labelKey: 'stage' },
}

export const applyFocus = (records, focus) => {
  const active = Object.entries(focus).filter(([, f]) => f)
  if (!active.length) {
    return records
  }
  return records.filter((r) =>
    active.every(([dim, f]) => r[DIMENSIONS[dim].idKey] === f.id)
  )
}

export const summarize = (records) => {
  const stores = new Set()
  const companies = new Set()
  let value = 0
  let base = 0
  let extras = 0
  let received = 0
  // Purchase-value breakdown: amount and number of devices per component.
  const parts = {
    devicePrice: { amount: 0, devices: 0 },
    slabBonus: { amount: 0, devices: 0 },
    negotiation: { amount: 0, devices: 0 },
    coupon: { amount: 0, devices: 0 },
    adjustment: { amount: 0, devices: 0 },
    commission: { amount: 0, devices: 0 },
  }
  records.forEach((r) => {
    value += r.paid
    base += r.basePrice
    extras += r.extras
    Object.keys(parts).forEach((k) => {
      parts[k].amount += r[k] || 0
      if (r[k]) {
        parts[k].devices++
      }
    })
    if (r.received) {
      received++
    }
    if (r.storeId !== UNKNOWN) {
      stores.add(r.storeId)
    }
    if (r.companyId !== UNKNOWN) {
      companies.add(r.companyId)
    }
  })
  const count = records.length
  return {
    count,
    value,
    base,
    extras,
    parts,
    avgTicket: count ? value / count : 0,
    activeStores: stores.size,
    activeCompanies: companies.size,
    received,
    receivedPct: count ? (received / count) * 100 : 0,
    pendingReceipt: count - received,
  }
}

/** Groups records by a dimension, sorted by device count desc. */
export const groupBy = (records, dimension) => {
  const { idKey, labelKey, extraKey } = DIMENSIONS[dimension]
  const map = new Map()
  records.forEach((r) => {
    const id = r[idKey]
    let row = map.get(id)
    if (!row) {
      row = {
        id,
        label: r[labelKey],
        extra: extraKey ? r[extraKey] : undefined,
        count: 0,
        value: 0,
        received: 0,
        stores: new Set(),
      }
      map.set(id, row)
    }
    row.count++
    row.value += r.paid
    if (r.received) {
      row.received++
    }
    if (r.storeId !== UNKNOWN) {
      row.stores.add(r.storeId)
    }
  })
  return [...map.values()]
    .map((row) => ({
      ...row,
      stores: row.stores.size,
      avgTicket: row.count ? row.value / row.count : 0,
      receivedPct: row.count ? (row.received / row.count) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count || b.value - a.value)
}

export const buildTrend = (records, from, to) => {
  const { buckets, granularity } = buildBuckets(from, to)
  const index = new Map(buckets.map((b) => [b.key, b]))
  records.forEach((r) => {
    if (Number.isNaN(r.date.getTime())) {
      return
    }
    const bucket = index.get(bucketKeyFor(r.date, granularity))
    if (bucket) {
      bucket.count++
      bucket.value += r.paid
    }
  })
  return { buckets, granularity }
}

/** Commission by company, for the Approx commission breakdown. */
export const commissionByCompany = (records) => {
  const map = new Map()
  records.forEach((r) => {
    let row = map.get(r.companyId)
    if (!row) {
      row = {
        id: r.companyId,
        label: r.companyName,
        devices: 0,
        devicePrice: 0,
        commission: 0,
        earning: 0,
      }
      map.set(r.companyId, row)
    }
    row.devices++
    row.devicePrice += r.devicePrice
    row.commission += r.commission || 0
    if (r.commission > 0) {
      row.earning++
    }
  })
  return [...map.values()].sort((a, b) => b.commission - a.commission || b.devices - a.devices)
}
