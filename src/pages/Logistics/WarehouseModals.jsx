import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { BeatLoader } from 'react-spinners'
import {
  HISTORY_LABELS,
  STATUS,
  STATUS_ORDER,
  describeLead,
  deviceVariant,
  formatDate,
  formatDateTime,
  formatDimensions,
  formatPrice,
  isUrl,
  orDash,
  statusLabel,
} from './constants'
import {
  cancelShipment,
  errorMessage,
  fetchItem,
  fetchLabelUrl,
  saveManualBooking,
  updateItem,
  trackBluedartShipment,
  updateLogisticsStatus,
} from './warehouseApi'

/* --------------------------------- Shell --------------------------------- */

export const Modal = ({ title, onClose, children, wide = false }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50 p-4'
      onClick={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label={title}
        className={`bg-white rounded-lg w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex justify-between items-center border-b pb-3 mb-3'>
          <h2 className='text-xl font-bold text-gray-800'>{title}</h2>
          <button
            onClick={onClose}
            className='text-white bg-primary rounded px-3 py-1 text-sm'
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  wide: PropTypes.bool,
}

export const Field = ({ label, error, children, hint }) => (
  <label className='flex flex-col gap-1'>
    <span className='text-sm font-semibold text-gray-600'>{label}</span>
    {children}
    {hint && !error && <span className='text-xs text-gray-500'>{hint}</span>}
    {error && <span className='text-xs text-red-600'>{error}</span>}
  </label>
)

Field.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.node,
}

export const INPUT =
  'h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-primary'

export const DIMENSION_KEYS = ['length', 'width', 'height']

export const twoDecimals = (value) => /^\d+(\.\d{1,2})?$/.test(String(value))

// Quantity, weight and dimension errors, with the caller's messages.
export const packageErrors = (form, { quantity, weight }) => {
  const next = {}
  if (!/^\d+$/.test(form.quantity) || Number(form.quantity) < 1) {
    next.quantity = quantity
  }
  if (!twoDecimals(form.weight) || Number(form.weight) <= 0) {
    next.weight = weight
  }
  for (const key of DIMENSION_KEYS) {
    const value = Number(form[key])
    if (Number.isNaN(value) || value <= 0) {
      next[key] = 'Above 0'
    }
  }
  return next
}

const RESULT_TONES = {
  green: 'bg-green-50 border-green-200 text-green-800',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
}

// Outcome of a bulk action, one line per item.
export const BulkResultsModal = ({ title, message, rows, onDone, doneClassName }) => {
  const tone = rows.every((r) => r.success) ? 'green' : 'amber'
  return (
    <Modal title={title} onClose={() => onDone(message)} wide>
      <p className={`text-sm border rounded px-3 py-2 ${RESULT_TONES[tone]}`}>{message}</p>
      <ul className='mt-3 divide-y border rounded'>
        {rows.map((row) => (
          <li key={row.key} className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2 text-sm'>
            <span className='font-semibold text-gray-800 sm:w-36 shrink-0'>{row.code}</span>
            {row.success ? (
              <span className='text-green-700'>{row.successText}</span>
            ) : (
              <span className='text-red-600'>{row.message}</span>
            )}
          </li>
        ))}
      </ul>
      <div className='flex justify-end mt-5'>
        <button type='button' onClick={() => onDone(message)} className={doneClassName}>
          Done
        </button>
      </div>
    </Modal>
  )
}

BulkResultsModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      code: PropTypes.string,
      success: PropTypes.bool,
      successText: PropTypes.string,
      message: PropTypes.string,
    })
  ).isRequired,
  onDone: PropTypes.func.isRequired,
  doneClassName: PropTypes.string.isRequired,
}

// Labelled numeric input bound to one key of a form ({ form, errors, set }).
export const NumberField = ({ name, label, form, errors, set, hint, integer = false }) => (
  <Field label={label} error={errors[name]} hint={hint}>
    <input
      inputMode={integer ? 'numeric' : 'decimal'}
      value={form[name]}
      onChange={set(name)}
      className={INPUT}
    />
  </Field>
)

NumberField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired,
  hint: PropTypes.string,
  integer: PropTypes.bool,
}

const FormFooter = ({ submitting, submitLabel, onClose, error }) => (
  <>
    {error && (
      <p className='mt-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2'>{error}</p>
    )}
    <div className='flex justify-end gap-2 mt-5'>
      <button
        type='button'
        onClick={onClose}
        className='px-4 py-2 rounded border border-gray-300 text-sm text-gray-700'
      >
        Cancel
      </button>
      <button
        type='submit'
        disabled={submitting}
        className='px-4 py-2 rounded bg-primary text-white text-sm font-medium min-w-[110px] disabled:opacity-60'
      >
        {submitting ? <BeatLoader color='#fff' size={6} /> : submitLabel}
      </button>
    </div>
  </>
)

FormFooter.propTypes = {
  submitting: PropTypes.bool.isRequired,
  submitLabel: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  error: PropTypes.string,
}

// Shared submit flow: one request at a time, server message on failure.
// Runs `run` once per key, even when React StrictMode mounts the popup twice
// in development, so opening a popup never sends its request twice.
export const useOncePerKey = (key, run) => {
  const ranFor = useRef(null)
  useEffect(() => {
    if (ranFor.current === key) {
      return
    }
    ranFor.current = key
    run()
  }, [key, run])
}

// Instant lock (a ref, not state) so a fast double click cannot submit twice
// before the button re-renders as disabled.
export const useSubmitLock = () => {
  const locked = useRef(false)
  return async (task) => {
    if (locked.current) {
      return undefined
    }
    locked.current = true
    try {
      return await task()
    } finally {
      locked.current = false
    }
  }
}

const useSubmit = (action, onDone) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const withLock = useSubmitLock()
  const submit = (...args) => withLock(async () => {
    setSubmitting(true)
    setError('')
    try {
      const result = await action(...args)
      onDone(result?.message)
    } catch (err) {
      setError(errorMessage(err, 'Something went wrong. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  })
  return { submitting, error, submit }
}

const leadSummary = (lead) => (
  <p className='text-sm text-gray-600 mb-4'>
    <span className='font-semibold text-gray-800'>{lead.leadCode}</span>
    {' · '}
    {orDash(describeLead(lead))}
  </p>
)

/* ---------------------------- Request logistics --------------------------- */

const ChoiceCard = ({ title, description, onClick, primary = false }) => (
  <button
    type='button'
    onClick={onClick}
    className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
      primary
        ? 'border-primary bg-rose-50 hover:bg-rose-100'
        : 'border-gray-300 bg-white hover:border-primary hover:bg-rose-50'
    }`}
  >
    <span className='block text-base font-semibold text-gray-900'>{title}</span>
    <span className='block text-sm text-gray-600 mt-0.5'>{description}</span>
  </button>
)

ChoiceCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  primary: PropTypes.bool,
}

/**
 * First step of Request Logistics / Re-transit: choose Bluedart or manual.
 * Works for one row (lead) or for the selected rows (count).
 */
export const LogisticsChoiceModal = ({ lead, count, onClose, onChoose }) => {
  const isBulk = !lead
  const isReTransit = lead?.logisticsStatus === STATUS.CANCELLED
  const itemWord = isBulk && count !== 1 ? 'these items' : 'this item'
  return (
    <Modal title={isReTransit ? 'Re-transit' : 'Request Logistics'} onClose={onClose}>
      {isBulk ? (
        <p className='text-sm text-gray-600 mb-4'>
          <span className='font-semibold text-gray-800'>{count}</span> item{count === 1 ? '' : 's'} selected
        </p>
      ) : (
        leadSummary(lead)
      )}
      <p className='text-sm text-gray-600 mb-3'>How do you want to ship {itemWord}?</p>
      <div className='flex flex-col gap-3'>
        <ChoiceCard
          primary
          title='Via Bluedart'
          description='Book a Bluedart pickup from the store. AWB and label are created automatically.'
          onClick={() => onChoose('bluedart')}
        />
        <ChoiceCard
          title='Manually'
          description={
            isBulk
              ? 'Logistics arranged outside Bluedart. Enter an AWB No. for each item and the courier name.'
              : 'Logistics arranged outside Bluedart. Enter the AWB No. and courier name.'
          }
          onClick={() => onChoose('manual')}
        />
      </div>
    </Modal>
  )
}

LogisticsChoiceModal.propTypes = {
  lead: PropTypes.object,
  count: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onChoose: PropTypes.func.isRequired,
}

/* ------------------------------- Bulk manual ------------------------------ */

const AWB_PATTERN = /^[A-Za-z0-9]{6,30}$/

/**
 * Manual logistics for several items: one AWB per item (AWBs are unique),
 * one courier name and pickup date for all. Saves item by item and reports a
 * result for each, so a bad AWB does not block the others.
 */
export const BulkManualModal = ({ leads, onClose, onDone }) => {
  const [awbs, setAwbs] = useState(() => Object.fromEntries(leads.map((l) => [l._id, ''])))
  const [courierName, setCourierName] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const withLock = useSubmitLock()

  const validateForm = () => {
    const next = {}
    const seen = new Map()
    for (const lead of leads) {
      const awb = awbs[lead._id].trim()
      if (!AWB_PATTERN.test(awb)) {
        next[lead._id] = '6-30 letters or digits'
      } else if (seen.has(awb.toUpperCase())) {
        next[lead._id] = `Same AWB as ${seen.get(awb.toUpperCase())}`
      } else {
        seen.set(awb.toUpperCase(), lead.leadCode)
      }
    }
    if (courierName.trim().length < 2) {
      next.courierName = 'Enter the courier name'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    withLock(saveAll)
  }

  const saveAll = async () => {
    setSubmitting(true)
    const rows = []
    for (const lead of leads) {
      try {
        await saveManualBooking(lead._id, {
          awbNo: awbs[lead._id].trim(),
          courierName: courierName.trim(),
          pickupDate: pickupDate || null,
        })
        rows.push({ lead, success: true, awbNo: awbs[lead._id].trim() })
      } catch (err) {
        rows.push({ lead, success: false, message: errorMessage(err, 'Could not save') })
      }
    }
    const saved = rows.filter((r) => r.success).length
    setResults({ message: `${saved} of ${rows.length} items saved`, rows })
    setSubmitting(false)
  }

  if (results) {
    return (
      <BulkResultsModal
        title='Manual logistics results'
        message={results.message}
        rows={results.rows.map((row) => ({
          key: row.lead._id,
          code: row.lead.leadCode,
          success: row.success,
          successText: `Saved · AWB ${row.awbNo}`,
          message: row.message,
        }))}
        onDone={onDone}
        doneClassName='px-4 py-2 rounded bg-primary text-white text-sm font-medium min-w-[110px]'
      />
    )
  }

  return (
    <Modal title='Request Logistics — Manually (bulk)' onClose={onClose} wide>
      <p className='text-sm text-gray-600 mb-3'>
        Enter the AWB No. for each item. The courier name and pickup date apply to all{' '}
        {leads.length} items.
      </p>
      <form onSubmit={submit} noValidate>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
          <Field label='Courier name*' error={errors.courierName}>
            <input
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder='e.g. Delhivery'
              className={INPUT}
            />
          </Field>
          <Field label='Pickup date'>
            <input
              type='date'
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className={INPUT}
            />
          </Field>
        </div>
        <div className='border rounded divide-y max-h-[45vh] overflow-y-auto'>
          {leads.map((lead) => (
            <div key={lead._id} className='flex flex-col sm:flex-row sm:items-start gap-2 px-3 py-2'>
              <div className='sm:w-56 shrink-0 text-sm'>
                <div className='font-semibold text-gray-800'>{lead.leadCode}</div>
                <div className='text-xs text-gray-500'>
                  {orDash(lead.deviceName)} · {orDash(lead.storeName)}
                </div>
              </div>
              <div className='flex-1'>
                <input
                  aria-label={`AWB No. for ${lead.leadCode}`}
                  value={awbs[lead._id]}
                  onChange={(e) => setAwbs({ ...awbs, [lead._id]: e.target.value })}
                  placeholder='AWB No.'
                  className={`${INPUT} w-full`}
                />
                {errors[lead._id] && (
                  <span className='text-xs text-red-600'>{errors[lead._id]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <FormFooter
          submitting={submitting}
          submitLabel={`Save ${leads.length} AWB${leads.length === 1 ? '' : 's'}`}
          onClose={onClose}
        />
        {submitting && (
          <p className='text-xs text-gray-500 text-right mt-2'>Saving one by one… please keep this window open.</p>
        )}
      </form>
    </Modal>
  )
}

BulkManualModal.propTypes = {
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

/* ---------------------------------- Edit --------------------------------- */

export const EditModal = ({ lead, onClose, onDone }) => {
  const [form, setForm] = useState({
    amount: String(lead.amount ?? ''),
    quantity: String(lead.quantity),
    weight: String(lead.weight),
    length: String(lead.dimensions.length),
    width: String(lead.dimensions.width),
    height: String(lead.dimensions.height),
  })
  const [errors, setErrors] = useState({})
  const { submitting, error, submit } = useSubmit(
    (body) => updateItem(lead._id, body),
    onDone
  )

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const validateForm = () => {
    const next = {}
    if (!twoDecimals(form.amount) || Number(form.amount) <= 0) {
      next.amount = 'Enter an amount above 0 with up to 2 decimals'
    }
    Object.assign(
      next,
      packageErrors(form, {
        quantity: 'Whole number, at least 1',
        weight: 'Weight above 0 kg, up to 2 decimals',
      })
    )
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    // Send only what changed so the audit log records real edits.
    const original = {
      amount: lead.amount,
      quantity: lead.quantity,
      weight: lead.weight,
      ...lead.dimensions,
    }
    const body = {}
    for (const key of Object.keys(form)) {
      const value = Number(form[key])
      if (value !== Number(original[key])) {
        body[key] = value
      }
    }
    if (Object.keys(body).length === 0) {
      onClose()
      return
    }
    submit(body)
  }

  const fieldProps = { form, errors, set }

  return (
    <Modal title='Edit details' onClose={onClose}>
      {leadSummary(lead)}
      <form onSubmit={onSubmit} noValidate>
        <div className='grid grid-cols-2 gap-3'>
          <div className='col-span-2'>
            <NumberField name='amount' label='Amount (₹)' hint='Used as the declared value' {...fieldProps} />
          </div>
          <NumberField name='quantity' label='Quantity' integer {...fieldProps} />
          <NumberField name='weight' label='Weight (kg)' {...fieldProps} />
        </div>
        <p className='text-sm font-semibold text-gray-600 mt-3 mb-1'>Dimensions (cm)</p>
        <div className='grid grid-cols-3 gap-3'>
          {DIMENSION_KEYS.map((key) => (
            <NumberField key={key} name={key} label={key[0].toUpperCase() + key.slice(1)} {...fieldProps} />
          ))}
        </div>
        <FormFooter submitting={submitting} submitLabel='Save' onClose={onClose} error={error} />
      </form>
    </Modal>
  )
}

EditModal.propTypes = {
  lead: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

/* --------------------------- Manual / Re-transit -------------------------- */

export const ManualBookingModal = ({ lead, onClose, onDone }) => {
  const isReTransit = lead.logisticsStatus === STATUS.CANCELLED
  const [form, setForm] = useState({ awbNo: '', courierName: '', pickupDate: '' })
  const [errors, setErrors] = useState({})
  const { submitting, error, submit } = useSubmit(
    (body) => saveManualBooking(lead._id, body),
    onDone
  )

  const onSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!/^[A-Za-z0-9]{6,30}$/.test(form.awbNo.trim())) {
      next.awbNo = 'AWB No. must be 6-30 letters or digits'
    }
    if (form.courierName.trim().length < 2) {
      next.courierName = 'Enter the courier name'
    }
    setErrors(next)
    if (Object.keys(next).length) {
      return
    }
    submit({
      awbNo: form.awbNo.trim(),
      courierName: form.courierName.trim(),
      pickupDate: form.pickupDate || null,
    })
  }

  return (
    <Modal title={isReTransit ? 'Re-transit — Manually' : 'Request Logistics — Manually'} onClose={onClose}>
      {leadSummary(lead)}
      <div className='text-sm bg-gray-50 rounded px-3 py-2 mb-4 text-gray-700'>
        <div>Pickup: {orDash(lead.storeName)}{lead.storeRegion ? `, ${lead.storeRegion}` : ''}</div>
        <div>
          Package: {lead.quantity} × {lead.weight} kg, {formatDimensions(lead.dimensions)} · Value{' '}
          {formatPrice(lead.amount)}
        </div>
        {isReTransit && (
          <div className='mt-1 text-amber-700'>
            The cancelled AWB stays in history; enter a new AWB.
          </div>
        )}
      </div>
      <form onSubmit={onSubmit} noValidate className='flex flex-col gap-3'>
        <Field label='AWB No.*' error={errors.awbNo}>
          <input
            value={form.awbNo}
            onChange={(e) => setForm({ ...form, awbNo: e.target.value })}
            className={INPUT}
            autoFocus
          />
        </Field>
        <Field label='Courier name*' error={errors.courierName}>
          <input
            value={form.courierName}
            onChange={(e) => setForm({ ...form, courierName: e.target.value })}
            placeholder='e.g. Delhivery'
            className={INPUT}
          />
        </Field>
        <Field label='Pickup date'>
          <input
            type='date'
            value={form.pickupDate}
            onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
            className={INPUT}
          />
        </Field>
        <FormFooter
          submitting={submitting}
          submitLabel={isReTransit ? 'Re-transit' : 'Save AWB'}
          onClose={onClose}
          error={error}
        />
      </form>
    </Modal>
  )
}

ManualBookingModal.propTypes = EditModal.propTypes

/* ------------------------------ Update status ----------------------------- */

export const StatusModal = ({ lead, onClose, onDone }) => {
  const next = STATUS_ORDER.slice(STATUS_ORDER.indexOf(lead.logisticsStatus) + 1)
  const [status, setStatus] = useState(next[0] || '')
  const [date, setDate] = useState('')
  const { submitting, error, submit } = useSubmit(
    (body) => updateLogisticsStatus(lead._id, body),
    onDone
  )
  const showDate = status === STATUS.PICKUP_COMPLETE || status === STATUS.DELIVERED

  return (
    <Modal title='Update logistics status' onClose={onClose}>
      {leadSummary(lead)}
      <p className='text-sm text-gray-600 mb-3'>
        Current status: <span className='font-semibold'>{statusLabel(lead)}</span>
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit({ status, date: showDate && date ? date : null })
        }}
        className='flex flex-col gap-3'
      >
        <Field label='New status'>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={INPUT}>
            {next.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        {showDate && (
          <Field
            label={status === STATUS.DELIVERED ? 'Delivery date' : 'Pickup date'}
            hint='Leave empty to use today'
          >
            <input type='date' value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} />
          </Field>
        )}
        <FormFooter submitting={submitting} submitLabel='Update' onClose={onClose} error={error} />
      </form>
    </Modal>
  )
}

StatusModal.propTypes = EditModal.propTypes

/* --------------------------------- Cancel --------------------------------- */

/* ---------------------------------- Track --------------------------------- */

const TrackLine = ({ label, children }) => (
  <>
    <span className='text-gray-500'>{label}</span>
    <span className='text-gray-900'>{children}</span>
  </>
)

TrackLine.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node }

/**
 * Asks Bluedart for the latest scan as soon as it opens; the server moves the
 * logistics status when the scan means a later step.
 */
export const TrackModal = ({ lead, onClose, onDone }) => {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const startTracking = useCallback(() => {
    trackBluedartShipment(lead._id)
      .then(setResult)
      .catch((err) => setError(errorMessage(err, 'Could not reach Bluedart tracking')))
  }, [lead._id])
  useOncePerKey(lead._id, startTracking)

  const tracking = result?.data?.tracking
  const close = () => (result ? onDone(result.message) : onClose())

  return (
    <Modal title='Track shipment' onClose={close}>
      {leadSummary(lead)}
      <p className='text-sm text-gray-600 mb-3'>
        AWB <span className='font-semibold text-gray-800'>{lead.awbNo}</span> · Bluedart
      </p>

      {!result && !error && (
        <div className='flex flex-col items-center gap-2 py-6'>
          <BeatLoader color='var(--primary-color)' />
          <span className='text-sm text-gray-500'>Checking with Bluedart…</span>
        </div>
      )}

      {error && (
        <p className='text-sm bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2'>{error}</p>
      )}

      {tracking && (
        <>
          <p
            className={`text-sm border rounded px-3 py-2 ${
              tracking.moved
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            {tracking.moved
              ? `Status updated: ${tracking.from} → ${tracking.to}`
              : `No status change (still ${tracking.from})`}
          </p>
          <div className='mt-4 grid grid-cols-2 gap-y-2 text-sm'>
            <TrackLine label='Bluedart status'>
              {tracking.error ? tracking.error : orDash(tracking.bluedartStatus)}
            </TrackLine>
            <TrackLine label='Status time'>{orDash(tracking.statusAt)}</TrackLine>
            <TrackLine label='Expected delivery'>{orDash(tracking.expectedDeliveryDate)}</TrackLine>
          </div>
        </>
      )}

      <div className='flex justify-end mt-5'>
        <button
          type='button'
          onClick={close}
          className='px-4 py-2 rounded bg-primary text-white text-sm font-medium min-w-[110px]'
        >
          Done
        </button>
      </div>
    </Modal>
  )
}

TrackModal.propTypes = {
  lead: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export const CancelModal = ({ lead, onClose, onDone }) => {
  const [reason, setReason] = useState('')
  const [fieldError, setFieldError] = useState('')
  const { submitting, error, submit } = useSubmit(
    (body) => cancelShipment(lead._id, body),
    onDone
  )

  return (
    <Modal title='Cancel shipment' onClose={onClose}>
      {leadSummary(lead)}
      <p className='text-sm text-gray-600 mb-3'>
        AWB <span className='font-semibold'>{lead.awbNo}</span> ({orDash(lead.courierName)}) will be
        cancelled and kept in history. You can re-transit afterwards.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (reason.trim().length < 3) {
            setFieldError('Please enter a reason')
            return
          }
          setFieldError('')
          submit({ reason: reason.trim() })
        }}
        noValidate
      >
        <Field label='Cancellation reason*' error={fieldError}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            className='rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </Field>
        <FormFooter submitting={submitting} submitLabel='Cancel shipment' onClose={onClose} error={error} />
      </form>
    </Modal>
  )
}

CancelModal.propTypes = EditModal.propTypes

/* ---------------------------------- View ---------------------------------- */

const DetailRow = ({ label, children }) => (
  <div className='flex flex-col sm:flex-row sm:gap-4 py-2 border-b last:border-b-0'>
    <span className='sm:w-44 shrink-0 text-sm font-semibold text-gray-600'>{label}</span>
    <span className='text-sm text-gray-800 break-all'>{children}</span>
  </div>
)

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
}

const SectionTitle = ({ children, first = false }) => (
  <h3 className={`font-semibold text-primary ${first ? 'mt-2' : 'mt-4'}`}>{children}</h3>
)

SectionTitle.propTypes = {
  children: PropTypes.node,
  first: PropTypes.bool,
}

const describeHistory = (entry) => {
  if (entry.action === 'CANCELLED') {
    return `AWB ${entry.oldValue} — ${entry.note}`
  }
  if (entry.action === 'BOOKED' || entry.action === 'RE_TRANSIT') {
    const note = entry.note ? ' — ' + entry.note : ''
    return `AWB ${entry.newValue}${note}`
  }
  if (entry.field) {
    return `${entry.field}: ${orDash(entry.oldValue)} → ${orDash(entry.newValue)}`
  }
  return entry.note || ''
}

export const ViewModal = ({ lead, onClose }) => {
  const [item, setItem] = useState(null)
  const [loadError, setLoadError] = useState('')

  const loadItem = useCallback(() => {
    fetchItem(lead._id)
      .then(setItem)
      .catch((err) => setLoadError(errorMessage(err, 'Could not load history')))
  }, [lead._id])
  useOncePerKey(lead._id, loadItem)

  return (
    <Modal title={`Lead ${lead.leadCode}`} onClose={onClose} wide>
      <SectionTitle first>Device</SectionTitle>
      <DetailRow label='Device'>{orDash(lead.deviceName)}</DetailRow>
      <DetailRow label='RAM / Storage'>{orDash(deviceVariant(lead))}</DetailRow>
      <DetailRow label='Description'>{orDash(describeLead(lead))}</DetailRow>
      <DetailRow label='IMEI'>{orDash(lead.imei)}</DetailRow>
      <DetailRow label='Final Price'>{formatPrice(lead.finalPrice ?? lead.price)}</DetailRow>
      <DetailRow label='Amount (declared)'>
        {formatPrice(lead.amount)}
        {lead.amountEdited ? ' (edited)' : ''}
      </DetailRow>
      <DetailRow label='Package'>
        {lead.quantity} × {lead.weight} kg, {formatDimensions(lead.dimensions)}
      </DetailRow>

      <SectionTitle>Logistics</SectionTitle>
      <DetailRow label='Logistics Status'>{statusLabel(lead)}</DetailRow>
      <DetailRow label='Booking Mode'>{orDash(lead.bookingMode)}</DetailRow>
      <DetailRow label='AWB No.'>{orDash(lead.awbNo)}</DetailRow>
      <DetailRow label='Courier Name'>{orDash(lead.courierName)}</DetailRow>
      <DetailRow label='Service Type'>{orDash(lead.serviceType)}</DetailRow>
      <DetailRow label='Label'>
        {lead.labelUrl && lead.logisticsStatus !== STATUS.CANCELLED ? (
          <button
            type='button'
            className='text-primary underline'
            onClick={async () => {
              try {
                window.open(await fetchLabelUrl(lead._id), '_blank', 'noopener')
              } catch (err) {
                setLoadError(errorMessage(err, 'Label is not available'))
              }
            }}
          >
            View / print label
          </button>
        ) : (
          '—'
        )}
      </DetailRow>
      <DetailRow label='Pickup Date'>{formatDate(lead.pickupDate)}</DetailRow>
      <DetailRow label='EDD'>{formatDate(lead.edd)}</DetailRow>
      <DetailRow label='Delivery Date'>{formatDate(lead.deliveryDate)}</DetailRow>
      {lead.bookingMode === 'Bluedart' && (
        <>
          <DetailRow label='Bluedart Tracking'>
            {lead.trackingError || orDash(lead.trackingStatus)}
            {lead.trackingStatusAt ? ` (${lead.trackingStatusAt})` : ''}
          </DetailRow>
          <DetailRow label='Last Tracked'>{formatDateTime(lead.trackedAt)}</DetailRow>
        </>
      )}

      <SectionTitle>Store &amp; Company</SectionTitle>
      <DetailRow label='Company'>
        {orDash(lead.companyName)}
        {lead.companyCode ? ` (${lead.companyCode})` : ''}
      </DetailRow>
      <DetailRow label='Store'>{orDash(lead.storeName)}</DetailRow>
      <DetailRow label='Store Code'>{orDash(lead.storeCode)}</DetailRow>
      <DetailRow label='Location'>{orDash(lead.storeRegion)}</DetailRow>
      <DetailRow label='Address'>{orDash(lead.storeAddress)}</DetailRow>
      <DetailRow label='Contact No.'>{orDash(lead.storeContact)}</DetailRow>
      <DetailRow label='Sales User'>{orDash(lead.salesUserName)}</DetailRow>

      <SectionTitle>Customer</SectionTitle>
      <DetailRow label='Name'>{orDash(lead.customerName)}</DetailRow>
      <DetailRow label='Phone'>{orDash(lead.phoneNumber)}</DetailRow>
      <DetailRow label='Aadhaar Number'>{orDash(lead.aadharNumber)}</DetailRow>
      <DetailRow label='Email'>{orDash(lead.emailId)}</DetailRow>

      <SectionTitle>Payment &amp; Lot</SectionTitle>
      <DetailRow label='Lot Number'>{orDash(lead.lotCode)}</DetailRow>
      <DetailRow label='Lot Status'>{orDash(lead.lotStatus)}</DetailRow>
      <DetailRow label='Payment Receipt'>
        {isUrl(lead.paymentReceipt) ? (
          <a href={lead.paymentReceipt} target='_blank' rel='noreferrer' className='text-primary underline'>
            View receipt
          </a>
        ) : (
          orDash(lead.paymentReceipt)
        )}
      </DetailRow>
      <DetailRow label='Payment Remarks'>{orDash(lead.paymentRemarks)}</DetailRow>
      <DetailRow label='Lot Last Updated'>{formatDateTime(lead.lotUpdatedAt)}</DetailRow>
      <DetailRow label='Lead Created'>{formatDateTime(lead.leadCreatedAt)}</DetailRow>

      {item?.pastShipments?.length > 0 && (
        <>
          <SectionTitle>Cancelled shipments</SectionTitle>
          {item.pastShipments.map((past) => (
            <DetailRow key={past._id || past.awbNo} label={`AWB ${past.awbNo}`}>
              {past.courierName} · {past.bookingMode} · cancelled {formatDateTime(past.cancelledAt)}
              {past.cancelReason ? ` — ${past.cancelReason}` : ''}
              <span className='text-gray-400'> (label disabled)</span>
            </DetailRow>
          ))}
        </>
      )}

      <SectionTitle>History</SectionTitle>
      {loadError && <p className='text-sm text-red-600 py-2'>{loadError}</p>}
      {!item && !loadError && (
        <div className='py-3'>
          <BeatLoader color='var(--primary-color)' size={8} />
        </div>
      )}
      {item && item.history.length === 0 && (
        <p className='text-sm text-gray-500 py-2'>No changes yet.</p>
      )}
      {item?.history?.map((entry, index) => (
        <DetailRow
          key={`${entry.at}-${index}`}
          label={HISTORY_LABELS[entry.action] || entry.action}
        >
          {describeHistory(entry)}
          <span className='block text-xs text-gray-500'>
            {orDash(entry.byName)} · {formatDateTime(entry.at)}
          </span>
        </DetailRow>
      ))}
    </Modal>
  )
}

ViewModal.propTypes = {
  lead: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
}
