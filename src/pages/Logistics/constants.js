export const PAGE_SIZE = 20

export const STATUS = {
  NOT_BOOKED: 'Not Booked',
  BOOKED: 'Booked',
  OUT_FOR_PICKUP: 'Out For Pickup',
  PICKUP_COMPLETE: 'Pickup Complete',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

// Forward order a manual shipment moves through.
export const STATUS_ORDER = [
  STATUS.BOOKED,
  STATUS.OUT_FOR_PICKUP,
  STATUS.PICKUP_COMPLETE,
  STATUS.IN_TRANSIT,
  STATUS.DELIVERED,
]

export const EDITABLE_STATUSES = [STATUS.NOT_BOOKED, STATUS.CANCELLED]
export const CANCELLABLE_STATUSES = [STATUS.BOOKED, STATUS.OUT_FOR_PICKUP]

export const STATUS_STYLES = {
  [STATUS.NOT_BOOKED]: 'bg-gray-100 text-gray-700 border-gray-300',
  [STATUS.BOOKED]: 'bg-blue-50 text-blue-700 border-blue-200',
  [STATUS.OUT_FOR_PICKUP]: 'bg-amber-50 text-amber-700 border-amber-200',
  [STATUS.PICKUP_COMPLETE]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [STATUS.IN_TRANSIT]: 'bg-purple-50 text-purple-700 border-purple-200',
  [STATUS.DELIVERED]: 'bg-green-50 text-green-700 border-green-200',
  [STATUS.CANCELLED]: 'bg-red-50 text-red-700 border-red-200',
}

export const HISTORY_LABELS = {
  AMOUNT_EDIT: 'Amount edited',
  PACKAGE_EDIT: 'Package edited',
  BOOKED: 'Booked',
  STATUS_CHANGE: 'Status changed',
  CANCELLED: 'Cancelled',
  RE_TRANSIT: 'Re-transit booked',
  BOOKING_FAILED: 'Bluedart booking failed',
}

// Header and cell styling shared with the other admin tables.
export const TH =
  'px-3 py-3 text-sm md:text-[15px] font-semibold tracking-wide whitespace-nowrap align-middle text-center'
export const TD = 'px-3 py-3 text-sm md:text-base text-center align-middle text-gray-700'
export const SUB_TEXT = 'text-xs text-gray-500 mt-0.5'
export const SHADOW =
  'shadow-[1px_1px_2px_0px_rgba(0,0,0,0.158),-1px_-1px_2px_0px_rgba(0,0,0,0.034)]'

export const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB') : '—'

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-GB') : '—'

export const orDash = (value) =>
  value === 0 || value ? value : '—'

export const isUrl = (value) => /^https?:\/\//i.test(String(value || ''))

export const deviceVariant = (lead) =>
  [lead.ram, lead.storage].filter(Boolean).join(' / ')

// Description from the lead: model, configuration and grade.
export const describeLead = (lead) =>
  [
    lead.deviceName,
    deviceVariant(lead),
    lead.grade ? `Grade ${lead.grade}` : '',
  ]
    .filter(Boolean)
    .join(', ')

export const formatDimensions = (d = {}) =>
  `${d.length ?? 12} × ${d.width ?? 12} × ${d.height ?? 12} cm`

export const statusLabel = (lead) =>
  lead.logisticsStatus === STATUS.BOOKED && lead.reTransitCount > 0
    ? 'Booked (Re-transit)'
    : lead.logisticsStatus
