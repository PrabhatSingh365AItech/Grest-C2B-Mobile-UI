import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { describeLead, formatDimensions, statusLabel } from './constants'

const XLSX_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'

const text = (value) => (value === 0 || value ? String(value) : '')

const number = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : ''
}

const dateOnly = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB') : ''

const dateTime = (value) =>
  value ? new Date(value).toLocaleString('en-GB') : ''

// Columns follow the Warehouse table, plus the shipment dates the table shows
// through status/details. Customer PII (phone, email, Aadhaar) is left out.
const COLUMNS = [
  { header: 'Unique ID', width: 18, value: (lead) => text(lead.leadCode) },
  { header: 'IMEI No.', width: 20, value: (lead) => text(lead.imei) },
  { header: 'Company Name', width: 26, value: (lead) => text(lead.companyName) },
  { header: 'Store Name', width: 26, value: (lead) => text(lead.storeName) },
  { header: 'Store Location', width: 18, value: (lead) => text(lead.storeRegion) },
  { header: 'Store Address', width: 42, value: (lead) => text(lead.storeAddress) },
  { header: 'Lot No.', width: 18, value: (lead) => text(lead.lotCode) },
  { header: 'Store Contact No.', width: 18, value: (lead) => text(lead.storeContact) },
  {
    header: 'Amount (INR)',
    width: 14,
    numberFormat: '#,##0.00',
    value: (lead) => number(lead.amount),
  },
  { header: 'Amount Edited', width: 14, value: (lead) => (lead.amountEdited ? 'Yes' : 'No') },
  { header: 'Quantity', width: 10, value: (lead) => number(lead.quantity) },
  {
    header: 'Weight (Kg)',
    width: 12,
    numberFormat: '#,##0.00',
    value: (lead) => number(lead.weight),
  },
  { header: 'Dimensions', width: 22, value: (lead) => formatDimensions(lead.dimensions) },
  { header: 'Model Name', width: 24, value: (lead) => text(lead.deviceName) },
  { header: 'Description', width: 34, value: (lead) => describeLead(lead) },
  { header: 'Logistics Status', width: 18, value: (lead) => statusLabel(lead) || '' },
  { header: 'AWB No.', width: 18, value: (lead) => text(lead.awbNo) },
  { header: 'Courier Name', width: 20, value: (lead) => text(lead.courierName) },
  { header: 'Booking Mode', width: 14, value: (lead) => text(lead.bookingMode) },
  { header: 'Pickup Date', width: 14, value: (lead) => dateOnly(lead.pickupDate) },
  { header: 'Expected Delivery', width: 16, value: (lead) => dateOnly(lead.edd) },
  { header: 'Delivery Date', width: 14, value: (lead) => dateOnly(lead.deliveryDate) },
  { header: 'Tracking Status', width: 26, value: (lead) => text(lead.trackingStatus) },
  { header: 'Last Tracked On', width: 20, value: (lead) => dateTime(lead.trackedAt) },
]

const toRows = (leads) =>
  leads.map((lead) => {
    const row = {}
    COLUMNS.forEach(({ header, value }) => {
      row[header] = value(lead)
    })
    return row
  })

// Excel keeps the header row and adds filters, sensible widths and numeric
// formats so the file can be sorted and totalled as soon as it is opened.
const buildSheet = (rows) => {
  const headers = COLUMNS.map((column) => column.header)
  const sheet = XLSX.utils.json_to_sheet(rows, { header: headers })

  sheet['!cols'] = COLUMNS.map((column) => ({ wch: column.width }))
  if (sheet['!ref']) {
    sheet['!autofilter'] = { ref: sheet['!ref'] }
  }

  COLUMNS.forEach((column, columnIndex) => {
    if (!column.numberFormat) {
      return
    }
    for (let rowIndex = 1; rowIndex <= rows.length; rowIndex += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })]
      if (cell && cell.t === 'n') {
        cell.z = column.numberFormat
      }
    }
  })

  return sheet
}

const fileStamp = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`
}

/**
 * Downloads the given warehouse rows as a formatted .xlsx file and returns the
 * number of rows written.
 */
export const exportLogisticsToExcel = (leads) => {
  const rows = toRows(leads)
  const workbook = {
    Sheets: { Logistics: buildSheet(rows) },
    SheetNames: ['Logistics'],
  }
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  saveAs(
    new Blob([buffer], { type: XLSX_TYPE }),
    `Warehouse_Logistics_${fileStamp()}.xlsx`
  )
  return rows.length
}
