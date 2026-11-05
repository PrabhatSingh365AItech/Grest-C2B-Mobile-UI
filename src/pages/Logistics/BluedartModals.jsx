import { useCallback, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { BeatLoader } from 'react-spinners'
import {
  BulkResultsModal,
  DIMENSION_KEYS,
  Field,
  INPUT,
  Modal,
  NumberField,
  packageErrors,
  twoDecimals,
  useOncePerKey,
  useSubmitLock,
} from './WarehouseModals'
import { formatDate, formatPrice, orDash } from './constants'
import {
  bookWithBluedart,
  bulkBookWithBluedart,
  checkPincode,
  errorMessage,
  fetchBookingContext,
  fetchLabelUrl,
} from './warehouseApi'

const SUBMIT_BTN =
  'px-4 py-2 rounded bg-primary text-white text-sm font-medium min-w-[150px] disabled:opacity-60 disabled:cursor-not-allowed'
const SECONDARY_BTN = 'px-4 py-2 rounded border border-gray-300 text-sm text-gray-700'

const Section = ({ title, children }) => (
  <section className='mt-4'>
    <h3 className='font-semibold text-primary mb-2'>{title}</h3>
    {children}
  </section>
)

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
}

const ReadOnlyBox = ({ children }) => (
  <div className='text-sm bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-700 leading-relaxed'>
    {children}
  </div>
)

ReadOnlyBox.propTypes = { children: PropTypes.node }

const Banner = ({ tone = 'amber', children }) => {
  const tones = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-green-50 border-green-200 text-green-800',
  }
  return <div className={`text-sm border rounded px-3 py-2 ${tones[tone]}`}>{children}</div>
}

Banner.propTypes = {
  tone: PropTypes.oneOf(['amber', 'red', 'green']),
  children: PropTypes.node,
}

/**
 * Service choice as cards; services Bluedart cannot run for this pickup are
 * shown disabled with the reason.
 */
const ServicePicker = ({ services, value, onChange }) => (
  <div className='grid grid-cols-1 sm:grid-cols-3 gap-2' role='radiogroup'>
    {services.map((service) => {
      const selected = value === service.code
      return (
        <button
          key={service.code}
          type='button'
          role='radio'
          aria-checked={selected}
          disabled={!service.available}
          onClick={() => onChange(service.code)}
          className={`text-left rounded-lg border px-3 py-2 transition-colors ${
            selected
              ? 'border-primary bg-rose-50 ring-1 ring-primary'
              : 'border-gray-300 bg-white hover:border-primary'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300`}
        >
          <span className='block text-sm font-semibold text-gray-800'>{service.label}</span>
          <span className={`block text-xs ${service.available ? 'text-green-700' : 'text-gray-500'}`}>
            {service.available ? 'Available' : service.reason}
          </span>
        </button>
      )
    })}
  </div>
)

ServicePicker.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      label: PropTypes.string,
      available: PropTypes.bool,
      reason: PropTypes.string,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

const openLabel = async (leadId, setError) => {
  try {
    const url = await fetchLabelUrl(leadId)
    window.open(url, '_blank', 'noopener')
  } catch (err) {
    setError(errorMessage(err, 'Label is not available'))
  }
}

/* ------------------------------ Single booking ---------------------------- */

const PINCODE_PATTERN = /^[1-9]\d{5}$/

const placeLabel = (city, state) => [city, state].filter(Boolean).join(', ')

// Initial form values from the booking context.
const formFromContext = (data) => ({
  serviceCode: data.services.find((s) => s.available)?.code || '',
  pickupPincode: data.pickup.pincode,
  pickupDate: data.pickupDate.default,
  amount: String(data.package.amount),
  quantity: String(data.package.quantity),
  weight: String(data.package.weight),
  length: String(data.package.length),
  width: String(data.package.width),
  height: String(data.package.height),
})

// Field errors for the booking form; empty when valid.
const validateBookingForm = (form) => {
  const next = {}
  if (!form.serviceCode) {
    next.serviceCode = 'Choose a service'
  }
  if (!PINCODE_PATTERN.test(form.pickupPincode)) {
    next.pickupPincode = 'Pickup pincode is required'
  }
  if (!form.pickupDate) {
    next.pickupDate = 'Choose a pickup date'
  }
  if (!twoDecimals(form.amount) || Number(form.amount) <= 0) {
    next.amount = 'Above 0, up to 2 decimals'
  }
  return { ...next, ...packageErrors(form, { quantity: 'At least 1', weight: 'Above 0 kg' }) }
}

// Sunday or Bluedart holiday at the pickup location.
const pickupDateWarning = (form, ctx) => {
  if (!form?.pickupDate) {
    return ''
  }
  if (new Date(`${form.pickupDate}T00:00:00`).getDay() === 0) {
    return 'Bluedart does not pick up on Sundays.'
  }
  if (ctx?.pickup.holidays?.includes(form.pickupDate)) {
    return 'This is a Bluedart holiday at the pickup location.'
  }
  return ''
}

const bookingPayload = (form) => ({
  serviceCode: form.serviceCode,
  pickupDate: form.pickupDate,
  pickupPincode: form.pickupPincode,
  amount: Number(form.amount),
  quantity: Number(form.quantity),
  weight: Number(form.weight),
  length: Number(form.length),
  width: Number(form.width),
  height: Number(form.height),
})

const BookedSummary = ({ booked, leadId, onDone }) => {
  const [labelError, setLabelError] = useState('')
  const { shipment } = booked
  const done = () => onDone(booked.message)
  return (
    <Modal title='Booked with Bluedart' onClose={done}>
      <Banner tone='green'>{booked.message}</Banner>
      <div className='mt-4 grid grid-cols-2 gap-y-2 text-sm'>
        <span className='text-gray-500'>AWB No.</span>
        <span className='font-semibold text-gray-900'>{shipment.awbNo}</span>
        <span className='text-gray-500'>Courier</span>
        <span>{shipment.courierName}</span>
        <span className='text-gray-500'>Service</span>
        <span>{shipment.serviceType}</span>
        <span className='text-gray-500'>Pickup date</span>
        <span>{formatDate(shipment.pickupDate)}</span>
        <span className='text-gray-500'>EDD</span>
        <span>{shipment.edd ? formatDate(shipment.edd) : 'Shown once tracking is available'}</span>
      </div>
      {labelError && <p className='mt-3 text-sm text-red-600'>{labelError}</p>}
      <div className='flex justify-end gap-2 mt-5'>
        {shipment.labelKey && (
          <button type='button' className={SECONDARY_BTN} onClick={() => openLabel(leadId, setLabelError)}>
            View / print label
          </button>
        )}
        <button type='button' className={SUBMIT_BTN} onClick={done}>
          Done
        </button>
      </div>
    </Modal>
  )
}

BookedSummary.propTypes = {
  booked: PropTypes.shape({ message: PropTypes.string, shipment: PropTypes.object }).isRequired,
  leadId: PropTypes.string.isRequired,
  onDone: PropTypes.func.isRequired,
}

const ContextNotices = ({ ctx, onUseManual }) => (
  <>
    {!ctx.configured && (
      <div className='mt-4'>
        <Banner tone='red'>Bluedart is not configured on the server. Use Manual for now.</Banner>
      </div>
    )}
    {ctx.pickup.areaMessage && (
      <div className='mt-4'>
        <Banner>
          {ctx.pickup.areaMessage}
          {onUseManual && (
            <button type='button' onClick={onUseManual} className='ml-2 underline font-medium'>
              Use Manual
            </button>
          )}
        </Banner>
      </div>
    )}
  </>
)

ContextNotices.propTypes = {
  ctx: PropTypes.object.isRequired,
  onUseManual: PropTypes.func,
}

const PickupSection = ({ pickup, form, errors, pickupCheck, set, verifyPincode }) => (
  <Section title='Pickup (store)'>
    <ReadOnlyBox>
      <div className='font-medium text-gray-800'>{orDash(pickup.name)}</div>
      <div>{orDash(pickup.address)}</div>
      <div>Contact: {orDash(pickup.contact)}</div>
    </ReadOnlyBox>
    <div className='mt-2'>
      {pickup.pincode ? (
        <p className='text-sm text-gray-700'>
          Pincode <span className='font-semibold'>{pickup.pincode}</span>
          {pickupCheck.city && <span className='text-gray-500'> · {pickupCheck.city}</span>}
        </p>
      ) : (
        <Field
          label='Pickup pincode*'
          error={errors.pickupPincode || pickupCheck.error}
          hint={pickupCheck.city || 'Not found in the store address — please enter it'}
        >
          <div className='flex gap-2'>
            <input
              inputMode='numeric'
              maxLength={6}
              value={form.pickupPincode}
              onChange={set('pickupPincode')}
              onBlur={verifyPincode}
              className={`${INPUT} flex-1`}
            />
            <button type='button' onClick={verifyPincode} className={SECONDARY_BTN}>
              {pickupCheck.checking ? 'Checking…' : 'Check'}
            </button>
          </div>
        </Field>
      )}
      {pickup.pincode && pickupCheck.error && (
        <p className='text-xs text-red-600 mt-1'>{pickupCheck.error}</p>
      )}
    </div>
  </Section>
)

PickupSection.propTypes = {
  pickup: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  pickupCheck: PropTypes.shape({
    city: PropTypes.string,
    error: PropTypes.string,
    checking: PropTypes.bool,
  }).isRequired,
  set: PropTypes.func.isRequired,
  verifyPincode: PropTypes.func.isRequired,
}

const DeliverySection = ({ drop }) => (
  <Section title='Delivery (warehouse)'>
    <ReadOnlyBox>
      <div className='font-medium text-gray-800'>{orDash(drop.name)}</div>
      <div>{orDash([drop.address1, drop.address2, drop.address3].filter(Boolean).join(', '))}</div>
      <div>
        Pincode {orDash(drop.pincode)}
        {drop.city ? ` · ${drop.city}` : ''}
      </div>
      <div>Contact: {orDash(drop.mobile)}</div>
    </ReadOnlyBox>
  </Section>
)

DeliverySection.propTypes = { drop: PropTypes.object.isRequired }

const PackageSection = ({ form, errors, set }) => (
  <Section title='Package'>
    <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
      <NumberField name='amount' label='Declared value (₹)' form={form} errors={errors} set={set} />
      <NumberField name='quantity' label='Quantity' integer form={form} errors={errors} set={set} />
      <NumberField name='weight' label='Weight (kg)' form={form} errors={errors} set={set} />
      {DIMENSION_KEYS.map((key) => (
        <NumberField
          key={key}
          name={key}
          label={`${key[0].toUpperCase()}${key.slice(1)} (cm)`}
          form={form}
          errors={errors}
          set={set}
        />
      ))}
    </div>
  </Section>
)

PackageSection.propTypes = {
  form: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired,
}

// Cancel and submit buttons; the submit button shows a spinner while busy.
const FormButtons = ({ onClose, submitting, disabled, label }) => (
  <div className='flex justify-end gap-2'>
    <button type='button' onClick={onClose} className={SECONDARY_BTN}>
      Cancel
    </button>
    <button type='submit' disabled={submitting || disabled} className={SUBMIT_BTN}>
      {submitting ? <BeatLoader color='#fff' size={6} /> : label}
    </button>
  </div>
)

FormButtons.propTypes = {
  onClose: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
}

const BookingActions = ({ onUseManual, onClose, submitting, canSubmit }) => (
  <>
    <div className='flex flex-col-reverse sm:flex-row sm:justify-between gap-2 mt-6'>
      {onUseManual ? (
        <button type='button' onClick={onUseManual} className='text-sm text-primary underline self-start'>
          Arranged outside Bluedart? Use Manual
        </button>
      ) : (
        <span />
      )}
      <FormButtons onClose={onClose} submitting={submitting} disabled={!canSubmit} label='Confirm booking' />
    </div>
    {submitting && (
      <p className='text-xs text-gray-500 text-right mt-2'>
        Booking with Bluedart… this can take a few seconds. Please don&apos;t close this window.
      </p>
    )}
  </>
)

BookingActions.propTypes = {
  onUseManual: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  canSubmit: PropTypes.bool.isRequired,
}

export const BluedartBookingModal = ({ lead, onClose, onDone, onUseManual }) => {
  const [ctx, setCtx] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState(null)
  const [services, setServices] = useState([])
  const [pickupCheck, setPickupCheck] = useState({ city: '', error: '', checking: false })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [booked, setBooked] = useState(null)

  const withLock = useSubmitLock()
  // Pincode last checked (or being checked), so blur + Check click do not
  // call Bluedart twice for the same pincode.
  const lastPincode = useRef('')

  const loadContext = useCallback(() => {
    fetchBookingContext(lead._id)
      .then((data) => {
        lastPincode.current = data.pickup.pincode || ''
        setCtx(data)
        setServices(data.services)
        setPickupCheck({
          city: placeLabel(data.pickup.city, data.pickup.state),
          error: data.pickup.pincodeError,
          checking: false,
        })
        setForm(formFromContext(data))
      })
      .catch((err) => setLoadError(errorMessage(err, 'Could not load booking details')))
  }, [lead._id])
  useOncePerKey(lead._id, loadContext)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  // When the store address has no pincode, the user types it and we check it.
  const verifyPincode = async () => {
    if (!PINCODE_PATTERN.test(form.pickupPincode)) {
      setPickupCheck({ city: '', error: 'Enter a valid 6-digit pincode', checking: false })
      return
    }
    if (lastPincode.current === form.pickupPincode) {
      return
    }
    lastPincode.current = form.pickupPincode
    setPickupCheck({ city: '', error: '', checking: true })
    try {
      const info = await checkPincode(form.pickupPincode, form.amount)
      setServices(info.options)
      setPickupCheck({ city: placeLabel(info.city, info.state), error: '', checking: false })
      if (!info.options.find((s) => s.code === form.serviceCode)?.available) {
        setForm((f) => ({ ...f, serviceCode: info.options.find((s) => s.available)?.code || '' }))
      }
    } catch (err) {
      // Allow checking the same pincode again after a failure.
      lastPincode.current = ''
      setPickupCheck({ city: '', error: errorMessage(err, 'Pincode check failed'), checking: false })
    }
  }

  const dateWarning = useMemo(() => pickupDateWarning(form, ctx), [form, ctx])

  const book = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await bookWithBluedart(lead._id, bookingPayload(form))
      setBooked({ message: result.message, shipment: result.data.shipment })
    } catch (err) {
      setSubmitError(errorMessage(err, 'Bluedart booking failed. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    const next = validateBookingForm(form)
    setErrors(next)
    if (Object.keys(next).length === 0 && !dateWarning) {
      withLock(book)
    }
  }

  if (booked) {
    return <BookedSummary booked={booked} leadId={lead._id} onDone={onDone} />
  }

  const title = lead.logisticsStatus === 'Cancelled' ? 'Re-transit — Via Bluedart' : 'Request Logistics — Via Bluedart'

  return (
    <Modal title={title} onClose={onClose} wide>
      <p className='text-sm text-gray-600'>
        <span className='font-semibold text-gray-800'>{lead.leadCode}</span>
        {' · '}
        {orDash(lead.deviceName)} · Lot {orDash(lead.lotCode)}
      </p>

      {!ctx && !loadError && (
        <div className='flex justify-center py-10'>
          <BeatLoader color='var(--primary-color)' />
        </div>
      )}
      {loadError && <div className='mt-4'><Banner tone='red'>{loadError}</Banner></div>}

      {ctx && form && (
        <form onSubmit={submit} noValidate>
          <ContextNotices ctx={ctx} onUseManual={onUseManual} />

          <Section title='Service type*'>
            <ServicePicker
              services={services}
              value={form.serviceCode}
              onChange={(code) => setForm({ ...form, serviceCode: code })}
            />
            {errors.serviceCode && <p className='text-xs text-red-600 mt-1'>{errors.serviceCode}</p>}
          </Section>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <PickupSection
              pickup={ctx.pickup}
              form={form}
              errors={errors}
              pickupCheck={pickupCheck}
              set={set}
              verifyPincode={verifyPincode}
            />
            <DeliverySection drop={ctx.drop} />
          </div>

          <PackageSection form={form} errors={errors} set={set} />

          <Section title='Pickup date*'>
            <div className='max-w-xs'>
              <Field label='' error={errors.pickupDate || dateWarning} hint='Default is the next working day'>
                <input
                  type='date'
                  value={form.pickupDate}
                  min={ctx.pickupDate.min}
                  max={ctx.pickupDate.max}
                  onChange={set('pickupDate')}
                  className={INPUT}
                />
              </Field>
            </div>
          </Section>

          {submitError && (
            <div className='mt-4'>
              <Banner tone='red'>{submitError}</Banner>
            </div>
          )}

          <BookingActions
            onUseManual={onUseManual}
            onClose={onClose}
            submitting={submitting}
            canSubmit={ctx.configured && services.some((s) => s.available)}
          />
        </form>
      )}
    </Modal>
  )
}

BluedartBookingModal.propTypes = {
  lead: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  onUseManual: PropTypes.func,
}

/* ------------------------------- Bulk booking ----------------------------- */

// yyyy-mm-dd in the user's local time (toISOString would shift to UTC).
const localDate = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const daysFromToday = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

const nextWorkingDay = () => {
  const date = daysFromToday(1)
  if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1)
  }
  return localDate(date)
}

export const BulkBluedartModal = ({ leads, services, onClose, onDone }) => {
  const [serviceCode, setServiceCode] = useState(services[0]?.code || '')
  const [pickupDate, setPickupDate] = useState(nextWorkingDay())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)

  const today = localDate(new Date())
  const maxDate = localDate(daysFromToday(7))
  const isSunday = new Date(`${pickupDate}T00:00:00`).getDay() === 0

  const withLock = useSubmitLock()

  const submit = (e) => {
    e.preventDefault()
    if (isSunday) {
      return
    }
    withLock(bookAll)
  }

  const bookAll = async () => {
    setSubmitting(true)
    setError('')
    try {
      const result = await bulkBookWithBluedart({
        leadIds: leads.map((l) => l._id),
        serviceCode,
        pickupDate,
      })
      setResults({ message: result.message, rows: result.data })
    } catch (err) {
      setError(errorMessage(err, 'Bulk booking failed. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const byId = new Map(leads.map((l) => [l._id, l]))

  if (results) {
    return (
      <BulkResultsModal
        title='Bulk booking results'
        message={results.message}
        rows={results.rows.map((row) => ({
          key: row.leadId,
          code: byId.get(row.leadId)?.leadCode || row.leadId,
          success: row.success,
          successText: `Booked · AWB ${row.awbNo}` + (row.pickupFailed ? ' (pickup not registered)' : ''),
          message: row.message,
        }))}
        onDone={onDone}
        doneClassName={SUBMIT_BTN}
      />
    )
  }

  const totalValue = leads.reduce((sum, l) => sum + Number(l.amount || 0), 0)
  const itemsWord = leads.length === 1 ? 'item' : 'items'
  const submitLabel = `Book ${leads.length} ${itemsWord}`

  return (
    <Modal title='Request Logistics — Via Bluedart (bulk)' onClose={onClose} wide>
      <p className='text-sm text-gray-600'>
        {leads.length} {itemsWord} selected · total value {formatPrice(totalValue)}.
        Each item uses its own saved amount, weight and dimensions; items that cannot be booked are reported
        individually.
      </p>
      <ul className='mt-3 max-h-40 overflow-y-auto text-sm border rounded divide-y'>
        {leads.map((l) => (
          <li key={l._id} className='px-3 py-1.5 flex justify-between gap-3'>
            <span className='font-medium text-gray-800'>{l.leadCode}</span>
            <span className='text-gray-500 truncate'>{l.storeName}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={submit}>
        <Section title='Service type*'>
          <ServicePicker
            services={services.map((s) => ({ ...s, available: true, reason: '' }))}
            value={serviceCode}
            onChange={setServiceCode}
          />
          <p className='text-xs text-gray-500 mt-1'>
            Availability is checked per item when booking.
          </p>
        </Section>
        <Section title='Pickup date*'>
          <div className='max-w-xs'>
            <Field label='' error={isSunday ? 'Bluedart does not pick up on Sundays.' : ''}>
              <input
                type='date'
                value={pickupDate}
                min={today}
                max={maxDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
        </Section>
        {error && <div className='mt-4'><Banner tone='red'>{error}</Banner></div>}
        <div className='mt-6'>
          <FormButtons
            onClose={onClose}
            submitting={submitting}
            disabled={isSunday || !serviceCode}
            label={submitLabel}
          />
        </div>
        {submitting && (
          <p className='text-xs text-gray-500 text-right mt-2'>
            Booking one by one with Bluedart… please keep this window open.
          </p>
        )}
      </form>
    </Modal>
  )
}

BulkBluedartModal.propTypes = {
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
  services: PropTypes.arrayOf(
    PropTypes.shape({ code: PropTypes.string, label: PropTypes.string })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export { openLabel }
