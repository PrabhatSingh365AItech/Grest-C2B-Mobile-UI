import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { toYMD } from './dateRange'
import { maskPII } from '../../../utils/piiMasking'

const FILE_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'

const round2 = (n) => Math.round((n || 0) * 100) / 100

// Numbers stay numeric in the sheet so they can be summed and filtered.
export const breakdownRows = (rows, labelHeader, extraHeader) => {
  const total = rows.reduce((s, r) => s + r.count, 0)
  return rows.map((r, i) => {
    const out = { '#': i + 1, [labelHeader]: r.label }
    if (extraHeader) {
      out[extraHeader] = r.extra ?? ''
    }
    out.Devices = r.count
    out['Value (INR)'] = Math.round(r.value)
    out['Avg ticket (INR)'] = Math.round(r.avgTicket)
    out['Active stores'] = r.stores
    out['Received at warehouse'] = r.received
    out['Received %'] = round2(r.receivedPct)
    out['Share of devices %'] = round2(total ? (r.count / total) * 100 : 0)
    return out
  })
}

const deviceRows = (records) =>
  records.map((r) => ({
    'Purchase date': Number.isNaN(r.date.getTime()) ? '' : toYMD(r.date),
    Company: r.companyName,
    Store: r.storeName,
    Region: r.region,
    Category: r.categoryName,
    Brand: r.brand,
    Model: r.model,
    Grade: r.grade,
    Staff: r.staff,
    'Base price (INR)': r.basePrice,
    'Paid to customer (INR)': r.paid,
    'Add-ons (INR)': r.extras,
    'Received at warehouse': r.received ? 'Yes' : 'No',
  }))

const trendRows = (trend) =>
  trend.buckets.map((b) => ({
    [{ hour: 'Hour', week: 'Week starting' }[trend.granularity] || 'Date']: b.key,
    Devices: b.count,
    'Value (INR)': Math.round(b.value),
  }))

const save = (workbook, filename) => {
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buffer], { type: FILE_TYPE }), `${filename}.xlsx`)
}

const appendSheet = (wb, name, rows) => {
  // An empty array produces a sheet with no header; keep a placeholder row.
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: 'No data' }])
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
}

const rangeSuffix = (range) => `${toYMD(range.from)}_to_${toYMD(range.to)}`

/** Single-card download: one sheet. */
export const downloadSheet = (name, rows, range) => {
  const wb = XLSX.utils.book_new()
  appendSheet(wb, name, rows)
  save(wb, `${name.replace(/\s+/g, '_')}_${rangeSuffix(range)}`)
}

/** Card with several breakdowns: one workbook, one sheet per breakdown. */
export const downloadSheets = (name, sheets, range) => {
  const wb = XLSX.utils.book_new()
  sheets.forEach((sheet) => appendSheet(wb, sheet.name, sheet.rows))
  save(wb, `${name.replace(/\s+/g, '_')}_${rangeSuffix(range)}`)
}

const TRACKER_HEADERS = [
  'S.N',
  'Store Name',
  'Technician Name',
  'Quote Given',
  'Converted',
  'Conv%',
  'FOS Available',
  'Quoted',
  'Converted',
  'Conv%',
  'FOS Total Avail. Days',
  'AVG Conv',
]

const pct = (v) => (v === null ? '' : Math.round(v * 100) / 100)
const avg = (v) => (v === null ? '' : Math.round(v * 10) / 10)

// Columns still loading when the file is saved are written as "…".
const trackerLine = (r, { recentReady = true, monthReady = true } = {}) => {
  const recent = (v) => (recentReady ? v : '…')
  const month = (v) => (monthReady ? v : '…')
  return [
    r.recentQuoted,
    recent(r.recentConverted),
    recent(pct(r.recentConv)),
    r.fosAvailable || '-',
    r.monthQuoted,
    month(r.monthConverted),
    month(pct(r.monthConv)),
    r.availDays || '-',
    month(avg(r.avgConv)),
  ]
}

/** Tracker sheet laid out like the daily tracker spreadsheet. */
const trackerSheet = ({ rows, totals, title, asOf, recentLabel, ...ready }) => {
  const pendingNote =
    ready.recentReady === false || ready.monthReady === false
      ? ' (… = conversions still loading when saved)'
      : ''
  const aoa = [
    [`${title}${pendingNote}`, '', '', '', '', '', asOf],
    ['', '', '', recentLabel || 'Last 48 hours', '', '', 'Last 1 month'],
    TRACKER_HEADERS,
    ...rows.map((r, i) => [i + 1, r.storeName, r.name, ...trackerLine(r, ready)]),
    ['', 'Total', '', ...trackerLine(totals, ready)],
  ]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 0, c: 6 }, e: { r: 0, c: 11 } },
    { s: { r: 1, c: 3 }, e: { r: 1, c: 5 } },
    { s: { r: 1, c: 6 }, e: { r: 1, c: 11 } },
  ]
  ws['!cols'] = [6, 26, 24, 12, 11, 8, 13, 9, 11, 8, 20, 10].map((wch) => ({ wch }))
  // Conv% cells hold fractions; show them as percentages.
  for (let r = 3; r < aoa.length; r++) {
    for (const c of [5, 9]) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })]
      if (cell && typeof cell.v === 'number') {
        cell.z = '0%'
      }
    }
  }
  return ws
}

export const downloadTracker = (tracker) => {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, trackerSheet(tracker), 'Daily Tracker')
  save(wb, `${tracker.title.replace(/\s+/g, '_')}_${toYMD(new Date())}`)
}

/**
 * Device dump: one row per purchased device with customer, pricing and IMEI.
 * PII is masked exactly as on screen for the user's role (SecureField rules;
 * Company Admin sees full IMEI as in Leads Completed).
 */
export const downloadDeviceDump = (records, range, role) => {
  const imeiOf = (v) => (role === 'Company Admin' ? v : maskPII(v, 'imei', role))

  const header = [
    'Date',
    'Company Name',
    'Store',
    'Region',
    'Purchase Grade',
    'Username',
    'Category',
    'Product Name',
    'Variant',
    'Price',
    'Negotiation Amt',
    'Coupon Amt',
    'Bonus Amt',
    'Final Price Offered to Customer',
    'Commission',
    'IMEI No.',
    'Unique Id',
    'Reason',
    'Customer Name',
    'Customer Mobile',
    'Customer Email',
    'Received at Warehouse',
    'Receiving Date',
  ]
  const rows = records.map((r) => {
    const d = r.detail || {}
    return [
      Number.isNaN(r.date.getTime()) ? '' : r.date.toLocaleDateString('en-GB'),
      d.companyName || r.companyName,
      r.storeName,
      r.region,
      d.purchaseGrade,
      d.username,
      d.category || r.categoryName,
      d.product,
      d.variant,
      d.price,
      d.negotiation,
      d.coupon,
      d.bonus,
      d.finalPrice,
      Math.round(r.commission || 0),
      imeiOf(d.imei),
      d.uniqueCode,
      d.reason || 'N/A',
      d.customerName,
      maskPII(d.customerPhone, 'phone', role),
      maskPII(d.customerEmail, 'email', role),
      r.received ? 'Yes' : 'No',
      d.receivedDate ? new Date(d.receivedDate).toLocaleDateString('en-GB') : '',
    ]
  })

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  ws['!cols'] = header.map((h) => ({ wch: Math.max(10, Math.min(h.length + 2, 30)) }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Devices')
  save(wb, `Device_Dump_${rangeSuffix(range)}`)
}

/** Full report: summary + every breakdown + device-level rows. */
export const downloadReport = ({ view, records, range, filterSummary, tracker }) => {
  const wb = XLSX.utils.book_new()
  const k = view.kpis
  appendSheet(wb, 'Summary', [
    { Metric: 'Date range', Value: `${toYMD(range.from)} to ${toYMD(range.to)}` },
    ...filterSummary.map(([Metric, Value]) => ({ Metric, Value })),
    { Metric: 'Devices purchased', Value: k.count },
    { Metric: 'Purchase value incl. add-ons (INR)', Value: Math.round(k.value) },
    { Metric: 'Avg ticket (INR)', Value: Math.round(k.avgTicket) },
    { Metric: 'Active stores', Value: k.activeStores },
    { Metric: 'Stores in scope', Value: view.totalStores },
    { Metric: 'Active companies', Value: k.activeCompanies },
    { Metric: 'Received at warehouse', Value: k.received },
    { Metric: 'Received %', Value: round2(k.receivedPct) },
    { Metric: '  Device price (INR)', Value: Math.round(k.parts?.devicePrice?.amount || 0) },
    { Metric: '  Slab bonus (INR)', Value: Math.round(k.parts?.slabBonus?.amount || 0) },
    { Metric: '  Negotiation (INR)', Value: Math.round(k.parts?.negotiation?.amount || 0) },
    { Metric: '  Coupon (INR)', Value: Math.round(k.parts?.coupon?.amount || 0) },
    { Metric: '  Commission (INR)', Value: Math.round(k.parts?.commission?.amount || 0) },
    { Metric: 'Add-ons paid (INR)', Value: Math.round(k.extras) },
  ])
  appendSheet(wb, 'Trend', trendRows(view.trend))
  appendSheet(wb, 'Companies', breakdownRows(view.byCompany, 'Company'))
  appendSheet(wb, 'Categories', breakdownRows(view.byCategory, 'Category'))
  appendSheet(wb, 'Stores', breakdownRows(view.byStore, 'Store', 'Region'))
  if (tracker?.rows.length) {
    XLSX.utils.book_append_sheet(wb, trackerSheet(tracker), 'Daily Tracker')
  }
  appendSheet(wb, 'Brands', breakdownRows(view.byBrand, 'Brand'))
  appendSheet(wb, 'Models', breakdownRows(view.byModel, 'Model', 'Brand'))
  appendSheet(wb, 'Grades', breakdownRows(view.byGrade, 'Grade'))
  appendSheet(wb, 'Stages', breakdownRows(view.byStage, 'Stage'))
  appendSheet(wb, 'Staff', breakdownRows(view.byStaff, 'Staff', 'Store'))
  appendSheet(wb, 'Devices', deviceRows(records))
  save(wb, `Business_Overview_${rangeSuffix(range)}`)
}
