import PropTypes from 'prop-types'
import {
  CANCELLABLE_STATUSES,
  EDITABLE_STATUSES,
  SHADOW,
  STATUS,
  STATUS_ORDER,
  STATUS_STYLES,
  SUB_TEXT,
  TD,
  TH,
  describeLead,
  formatDimensions,
  formatPrice,
  orDash,
  statusLabel,
} from './constants'

export const StatusBadge = ({ lead }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap ${
      STATUS_STYLES[lead.logisticsStatus] || STATUS_STYLES[STATUS.NOT_BOOKED]
    }`}
  >
    {statusLabel(lead)}
  </span>
)

StatusBadge.propTypes = {
  lead: PropTypes.shape({
    logisticsStatus: PropTypes.string,
    reTransitCount: PropTypes.number,
  }).isRequired,
}

const BTN = 'px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors'
const BTN_PRIMARY = `${BTN} bg-primary text-white hover:opacity-90`
const BTN_OUTLINE = `${BTN} bg-white text-primary border border-primary hover:bg-primary hover:text-white`
const BTN_DANGER = `${BTN} bg-white text-red-600 border border-red-300 hover:bg-red-600 hover:text-white`
export const isBookable = (lead) => EDITABLE_STATUSES.includes(lead.logisticsStatus)

/**
 * Actions offered for the current logistics status. Bluedart shipments move
 * only from Bluedart tracking (Track); manual shipments use Update Status.
 */
export const RowActions = ({ lead, onAction }) => {
  const status = lead.logisticsStatus
  const canEdit = isBookable(lead)
  const canCancel = CANCELLABLE_STATUSES.includes(status)
  const inProgress = STATUS_ORDER.includes(status) && status !== STATUS.DELIVERED
  const isBluedart = lead.bookingMode === 'Bluedart'
  const canAdvance = inProgress && !isBluedart
  const canTrack = inProgress && isBluedart
  const isCancelled = status === STATUS.CANCELLED

  return (
    <div className='flex flex-wrap justify-center gap-1.5 min-w-[150px]'>
      <button className={BTN_OUTLINE} onClick={() => onAction('view', lead)}>
        View
      </button>
      {canEdit && (
        <>
          <button className={BTN_OUTLINE} onClick={() => onAction('edit', lead)}>
            Edit
          </button>
          <button
            className={BTN_PRIMARY}
            onClick={() => onAction('request', lead)}
            title='Choose Bluedart or manual logistics'
          >
            {isCancelled ? 'Re-transit' : 'Request Logistics'}
          </button>
        </>
      )}
      {lead.bookingMode === 'Bluedart' && !isCancelled && lead.awbNo && (
        <button className={BTN_OUTLINE} onClick={() => onAction('label', lead)}>
          Label
        </button>
      )}
      {canTrack && (
        <button
          className={BTN_PRIMARY}
          onClick={() => onAction('track', lead)}
          title='Check the latest status with Bluedart'
        >
          Track
        </button>
      )}
      {canAdvance && (
        <button className={BTN_PRIMARY} onClick={() => onAction('status', lead)}>
          Update Status
        </button>
      )}
      {canCancel && (
        <button className={BTN_DANGER} onClick={() => onAction('cancel', lead)}>
          Cancel
        </button>
      )}
    </div>
  )
}

RowActions.propTypes = {
  lead: PropTypes.object.isRequired,
  onAction: PropTypes.func.isRequired,
}

// Column order follows the Warehouse requirements (section 6).
const COLUMNS = [
  'Unique ID',
  'IMEI No.',
  'Company Name',
  'Store Name',
  'Store Location',
  'Store Address',
  'Lot No.',
  'Store Contact No.',
  'Amount',
  'Quantity',
  'Weight',
  'Dimensions',
  'Model Name',
  'Description',
  'Logistics Status',
  'AWB No.',
  'Courier Name',
]

const STICKY_LEFT = 'sticky left-0 z-[1]'
const FIRST_TH = `${TH} ${STICKY_LEFT} bg-primary text-left`

const CHECKBOX = 'w-4 h-4 accent-[var(--primary-color)] cursor-pointer disabled:cursor-not-allowed'

export const WarehouseTable = ({ leads, onAction, selectedIds, onToggle, onToggleAll }) => {
  const bookable = leads.filter(isBookable)
  const allSelected = bookable.length > 0 && bookable.every((l) => selectedIds.includes(l._id))

  return (
  <div className='hidden md:block overflow-x-auto rounded-lg border border-primary'>
    <table className='w-full min-w-[1800px]'>
      <thead className='bg-primary text-white'>
        <tr>
          {COLUMNS.map((column, index) => (
            <th
              key={column}
              className={index === 0 ? FIRST_TH : TH}
            >
              {index === 0 ? (
                <span className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    aria-label='Select all bookable items on this page'
                    className={CHECKBOX}
                    checked={allSelected}
                    disabled={bookable.length === 0}
                    onChange={() => onToggleAll(bookable.map((l) => l._id), !allSelected)}
                  />
                  {column}
                </span>
              ) : (
                column
              )}
            </th>
          ))}
          <th className={TH}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead, index) => {
          const selected = selectedIds.includes(lead._id)
          let rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          if (selected) {
            rowBg = 'bg-rose-50'
          }
          return (
            <tr
              key={`${lead.lotId}-${lead._id}`}
              className={`${rowBg} border-b border-gray-200 transition-colors hover:bg-rose-50 group`}
            >
              <td
                className={`px-3 py-3 text-sm md:text-base font-semibold text-gray-900 align-middle whitespace-nowrap ${STICKY_LEFT} ${rowBg} group-hover:bg-rose-50`}
              >
                <span className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    aria-label={`Select ${lead.leadCode}`}
                    className={CHECKBOX}
                    checked={selected}
                    disabled={!isBookable(lead)}
                    title={isBookable(lead) ? '' : 'Already booked'}
                    onChange={() => onToggle(lead._id)}
                  />
                  {lead.leadCode}
                </span>
              </td>
              <td className={`${TD} text-gray-600 tabular-nums whitespace-nowrap`}>
                {orDash(lead.imei)}
              </td>
              <td className={TD}>{orDash(lead.companyName)}</td>
              <td className={TD}>{orDash(lead.storeName)}</td>
              <td className={TD}>{orDash(lead.storeRegion)}</td>
              <td className={TD}>
                <div className='min-w-[220px] max-w-[300px] mx-auto whitespace-normal break-words'>
                  {orDash(lead.storeAddress)}
                </div>
              </td>
              <td className={`${TD} text-gray-600 whitespace-nowrap`}>{orDash(lead.lotCode)}</td>
              <td className={`${TD} whitespace-nowrap tabular-nums`}>{orDash(lead.storeContact)}</td>
              <td className={`${TD} font-medium text-gray-900 whitespace-nowrap tabular-nums`}>
                {formatPrice(lead.amount)}
                {lead.amountEdited && <div className={SUB_TEXT}>edited</div>}
              </td>
              <td className={`${TD} tabular-nums`}>{lead.quantity}</td>
              <td className={`${TD} whitespace-nowrap tabular-nums`}>{lead.weight} kg</td>
              <td className={`${TD} whitespace-nowrap tabular-nums`}>
                {formatDimensions(lead.dimensions)}
              </td>
              <td className={TD}>
                <div className='font-medium text-gray-900'>{orDash(lead.deviceName)}</div>
              </td>
              <td className={TD}>
                <div className='min-w-[200px] max-w-[260px] mx-auto whitespace-normal break-words'>
                  {orDash(describeLead(lead))}
                </div>
              </td>
              <td className={TD}>
                <StatusBadge lead={lead} />
                {lead.bookingMode === 'Bluedart' && lead.trackingStatus && (
                  <div className={`${SUB_TEXT} max-w-[180px] mx-auto whitespace-normal`}>
                    Bluedart: {lead.trackingStatus}
                  </div>
                )}
              </td>
              <td className={`${TD} whitespace-nowrap tabular-nums`}>
                {orDash(lead.awbNo)}
                {lead.bookingMode && <div className={SUB_TEXT}>{lead.bookingMode}</div>}
              </td>
              <td className={TD}>{orDash(lead.courierName)}</td>
              <td className={TD}>
                <RowActions lead={lead} onAction={onAction} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
  )
}

const selectionPropTypes = {
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAction: PropTypes.func.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
}

WarehouseTable.propTypes = {
  ...selectionPropTypes,
  onToggleAll: PropTypes.func.isRequired,
}

const CardField = ({ label, children, wide = false }) => (
  <div className={wide ? 'col-span-2' : ''}>
    <dt className='text-xs text-gray-500'>{label}</dt>
    <dd className='text-gray-800 break-words'>{children}</dd>
  </div>
)

CardField.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
  wide: PropTypes.bool,
}

// Phones: one card per item with the key dispatch fields and the same actions.
export const WarehouseCards = ({ leads, onAction, selectedIds, onToggle }) => (
  <div className='md:hidden flex flex-col gap-3'>
    {leads.map((lead) => (
      <div
        key={`${lead.lotId}-${lead._id}`}
        className={`rounded-lg border p-4 ${SHADOW} ${
          selectedIds.includes(lead._id) ? 'bg-rose-50 border-primary' : 'bg-white border-gray-200'
        }`}
      >
        <div className='flex items-start justify-between gap-2'>
          <label className='flex items-center gap-2 font-semibold text-gray-900'>
            {isBookable(lead) && (
              <input
                type='checkbox'
                className={CHECKBOX}
                checked={selectedIds.includes(lead._id)}
                onChange={() => onToggle(lead._id)}
              />
            )}
            {lead.leadCode}
          </label>
          <StatusBadge lead={lead} />
        </div>
        <div className='mt-1 text-sm text-gray-600'>{orDash(describeLead(lead))}</div>
        <dl className='mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
          <CardField label='IMEI No.'>{orDash(lead.imei)}</CardField>
          <CardField label='Amount'>{formatPrice(lead.amount)}</CardField>
          <CardField label='Company'>{orDash(lead.companyName)}</CardField>
          <CardField label='Store'>{orDash(lead.storeName)}</CardField>
          <CardField label='Lot No.'>{orDash(lead.lotCode)}</CardField>
          <CardField label='Contact'>{orDash(lead.storeContact)}</CardField>
          <CardField label='Package'>
            {lead.quantity} × {lead.weight} kg
          </CardField>
          <CardField label='Dimensions'>{formatDimensions(lead.dimensions)}</CardField>
          {lead.awbNo && (
            <CardField label='AWB / Courier' wide>
              {lead.awbNo} · {orDash(lead.courierName)}
            </CardField>
          )}
        </dl>
        <div className='mt-3 pt-3 border-t border-gray-100'>
          <RowActions lead={lead} onAction={onAction} />
        </div>
      </div>
    ))}
  </div>
)

WarehouseCards.propTypes = selectionPropTypes
