import React, { useState, useEffect } from 'react'
import { BeatLoader } from 'react-spinners'
import axios from 'axios'
import { IoClose } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import EmailConfiguration from '../EmailConfiguration/EmailConfiguration'

const LoadingSpinner = ({ isLoading }) => {
  if (!isLoading) {
    return null
  }
  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <BeatLoader color="var(--primary-color)" loading={isLoading} size={15} />
    </div>
  );
};

const FormHeader = ({ onClose }) => (
  <div className='sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
    <div>
      <p className='text-4xl font-bold'>Update Company Listing</p>
      <p className='text-lm text-gray-500'>All fields marked with * are required</p>
    </div>
    <IoClose size={28} className='text-gray-400 hover:text-gray-700 cursor-pointer transition' onClick={onClose} />
  </div>
);

const FormField = ({ label, name, value, onChange, required = false, readOnly = false, type = 'text' }) => (
  <div className='flex flex-col gap-1.5'>
    <span className='font-medium text-sm text-gray-700'>
      {label}{required && <span className='text-red-500 ml-0.5'>*</span>}
    </span>
    <input
      className='border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition text-sm'
      type={type}
      name={name}
      value={value}
      required={required}
      readOnly={readOnly}
      onChange={onChange}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className='flex flex-col gap-1.5'>
    <span className='font-medium text-sm text-gray-700'>{label}</span>
    <select
      className='border border-gray-300 px-3 py-2 rounded-lg outline-none bg-white focus:border-[var(--primary-color)] transition text-sm'
      name={name}
      value={value}
      onChange={onChange}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

const DisableConfirmModal = ({ show, onConfirm, onCancel }) => {
  if (!show) {
    return null
  }
  return (
    <div className='fixed inset-0 z-[300] flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white border border-gray-200 p-6 w-96 max-w-[90%] mx-auto rounded-xl shadow-2xl'>
        <p className='mb-2 text-lg font-semibold text-gray-900'>Disable Dynamic Pricing?</p>
        <p className='mb-5 text-sm text-gray-600'>Disabling this will revert this company to standard pricing. Existing transactions are unaffected. Confirm?</p>
        <div className='flex justify-end gap-3'>
          <button onClick={onConfirm} className='bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition'>Confirm</button>
          <button onClick={onCancel} className='border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition'>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const SlabRow = ({ slab, index, onChange, onRemove }) => (
  <div className='flex flex-col gap-1'>
    <div className='flex gap-2 items-center'>
      <input
        type='number'
        className='border border-gray-300 px-2 py-1.5 rounded-lg outline-none w-[100px] text-sm focus:border-[var(--primary-color)] transition'
        value={slab.minValue}
        onChange={(e) => onChange(index, 'minValue', e.target.value)}
        placeholder='Min'
      />
      <span className='text-gray-400'>-</span>
      <input
        type='number'
        className='border border-gray-300 px-2 py-1.5 rounded-lg outline-none w-[100px] text-sm focus:border-[var(--primary-color)] transition'
        value={slab.maxValue}
        onChange={(e) => onChange(index, 'maxValue', e.target.value)}
        placeholder='Max'
      />
      <input
        type='number'
        className='border border-gray-300 px-2 py-1.5 rounded-lg outline-none w-[100px] text-sm focus:border-[var(--primary-color)] transition'
        value={slab.bonusAmount}
        onChange={(e) => onChange(index, 'bonusAmount', e.target.value)}
        placeholder='Bonus'
      />
      <button type='button' onClick={() => onRemove(index)} className='text-red-500 hover:text-red-700 font-bold px-2 text-lg transition' title='Remove slab'>&times;</button>
    </div>
    <div className='text-xs text-gray-400 ml-1'>Quoted Price = Exact Value - ₹{slab.bonusAmount || 0}</div>
  </div>
)

const booleanOptions = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
]

const sectionTitle = (text) => (
  <span className='font-semibold text-base text-gray-800'>{text}</span>
)

const validateSlab = (slab, index, allSlabs) => {
  if (Number(slab.maxValue) <= Number(slab.minValue)) {
    toast.error('Max Value must be greater than Min Value in every slab row.')
    return false
  }
  if (Number(slab.bonusAmount) > Number(slab.maxValue)) {
    toast.error('Bonus Amount cannot exceed the Exact Value for this slab range.')
    return false
  }
  if (index > 0 && Number(slab.minValue) <= Number(allSlabs[index - 1].maxValue)) {
    toast.error('Slab ranges overlap. Please ensure slabs are contiguous with no gaps.')
    return false
  }
  return true
}

const validatePricing = (dynamicPricingEnabled, slabs, effectiveFrom) => {
  if (!dynamicPricingEnabled) {
    return true
  }
  if (slabs.length === 0) {
    toast.error('Please add at least one pricing slab before saving.')
    return false
  }
  for (let i = 0; i < slabs.length; i++) {
    if (!validateSlab(slabs[i], i, slabs)) {
      return false
    }
  }
  if (!effectiveFrom) {
    toast.error('Effective From Date is required')
    return false
  }
  const selectedDate = new Date(effectiveFrom)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (selectedDate < today) {
    toast.error('Effective From Date cannot be set in the past.')
    return false
  }
  return true
}

const DynamicPricingSection = ({
  dynamicPricingEnabled,
  handleDynamicPricingToggle,
  slabs,
  handleSlabChange,
  removeSlab,
  addSlab,
  effectiveFrom,
  setEffectiveFrom,
  pricingNotes,
  setPricingNotes,
}) => (
  <div className='border border-gray-200 rounded-lg p-4'>
    <div className='flex items-center justify-between mb-3'>
      {sectionTitle('Dynamic Pricing & Bonus Settings')}
    </div>
    <p className='text-xs text-gray-500 mb-4 leading-relaxed'>
      Configure bonus amount slabs and pricing rules for this company. When enabled,
      the system automatically deducts a fixed Bonus Amount from the device Exact Value
      to calculate the final Quoted Price shown to the customer.
    </p>
    <div className='flex flex-col gap-3 mb-4'>
      <span className='font-medium text-sm text-gray-700'>Enable Dynamic Pricing</span>
      <select
        className='border border-gray-300 px-3 py-2 rounded-lg outline-none bg-white focus:border-[var(--primary-color)] transition text-sm w-[120px]'
        value={dynamicPricingEnabled.toString()}
        onChange={(e) => handleDynamicPricingToggle(e.target.value)}
      >
        <option value='true'>ON</option>
        <option value='false'>OFF</option>
      </select>
    </div>
    {dynamicPricingEnabled && (
    <div className='flex flex-col gap-4 border-t border-gray-100 pt-4'>
      <div>
        {sectionTitle('Bonus Amount Slab Table')}
      </div>
      <div className='flex gap-2 text-xs font-medium text-gray-500'>
        <span className='w-[100px]'>Min Value (Rs.)</span>
        <span className='w-[30px]'></span>
        <span className='w-[100px]'>Max Value (Rs.)</span>
        <span className='w-[100px]'>Bonus Amount (Rs.)</span>
      </div>
      <div className='flex flex-col gap-3'>
        {slabs.map((slab, index) => (
          <SlabRow key={index} slab={slab} index={index} onChange={handleSlabChange} onRemove={removeSlab} />
        ))}
      </div>
      <button
        type='button'
        onClick={addSlab}
        className='self-start bg-gray-50 border-2 border-dashed border-gray-300 px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition'
      >
        + Add Slab
      </button>
      <div className='grid grid-row-2 gap-4'>
        <div className='flex flex-col gap-1.5'>
          <span className='font-medium text-sm text-gray-700'>Effective From Date</span>
          <p className='text-xs text-gray-400'>Set when pricing rules take effect. Must be today or future.</p>
          <input
            type='date'
            className='border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-[var(--primary-color)] transition text-sm'
            min={new Date().toISOString().split('T')[0]}
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
          />
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='font-medium text-sm text-gray-700'>Notes / Remarks</span>
          <textarea
            className='border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-[var(--primary-color)] transition text-sm resize-none'
            rows={2}
            value={pricingNotes}
            onChange={(e) => setPricingNotes(e.target.value)}
            placeholder='Internal notes for this pricing configuration...'
          />
        </div>
      </div>
    </div>
    )}
  </div>
)

const EditCompany = ({ companyData, setEditBoxOpen, setEditSuccess }) => {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    ...companyData,
    emailConfiguration: companyData.emailConfiguration || { enabled: false, recipients: [], notificationTypes: ['paymentReceipt'] }
  })
  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState(false)
  const [prevDynamicPricingEnabled, setPrevDynamicPricingEnabled] = useState(false)
  const [slabs, setSlabs] = useState([])
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [pricingNotes, setPricingNotes] = useState('')
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)

  useEffect(() => {
    const fetchPricingConfig = async () => {
      if (!companyData._id) {
        return
      }
      const token = sessionStorage.getItem('authToken')
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/config/${companyData._id}?_t=${Date.now()}`,
          { headers: { Authorization: token } }
        )
        if (res.data.success && res.data.data && res.data.data._id) {
          setDynamicPricingEnabled(res.data.data.isEnabled)
          setPrevDynamicPricingEnabled(res.data.data.isEnabled)
          setSlabs(res.data.data.slabs || [])
          setEffectiveFrom(res.data.data.effectiveFrom ? res.data.data.effectiveFrom.split('T')[0] : '')
          setPricingNotes(res.data.data.notes || '')
        }
      } catch (err) {
        console.log('No existing pricing config')
      }
    }
    fetchPricingConfig()
  }, [companyData._id])

  const handleDynamicPricingToggle = (value) => {
    const newVal = value === 'true'
    if (prevDynamicPricingEnabled === true && newVal === false) {
      setShowDisableConfirm(true)
    } else {
      setDynamicPricingEnabled(newVal)
    }
  }

  const confirmDisable = () => {
    setDynamicPricingEnabled(false)
    setShowDisableConfirm(false)
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    let newValue = type === 'checkbox' ? e.target.checked : value
    if (name === 'showPrice' || name === 'maskInfo') {
      newValue = value === 'true'
    }
    setFormValues(prev => ({ ...prev, [name]: newValue }))
  }

  const handleSlabChange = (index, field, value) => {
    const updated = [...slabs]
    updated[index] = { ...updated[index], [field]: Number(value) }
    setSlabs(updated)
  }

  const addSlab = () => setSlabs([...slabs, { minValue: 0, maxValue: 0, bonusAmount: 0 }])

  const removeSlab = (index) => {
    if (slabs.length <= 1) {
      return
    }
    setSlabs(slabs.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validatePricing(dynamicPricingEnabled, slabs, effectiveFrom)) {
      return
    }
    setIsTableLoading(true)
    const token = sessionStorage.getItem('authToken')
    try {
      const formData = new FormData()
      formData.append('name', formValues.name)
      formData.append('contactNumber', formValues.contactNumber)
      formData.append('address', formValues.address)
      formData.append('gstNumber', formValues.gstNumber)
      formData.append('panNumber', formValues.panNumber)
      formData.append('remarks', formValues.remarks)
      formData.append('showPrice', formValues.showPrice)
      formData.append('maskInfo', formValues.maskInfo)
      formData.append('emailConfiguration', JSON.stringify(formValues.emailConfiguration))
      formData.append('id', formValues._id)

      await axios.put(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/edit`, formData, { headers: { Authorization: token } })
      await axios.post(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/config`, {
        companyId: formValues._id,
        isEnabled: dynamicPricingEnabled,
        slabs: slabs.map(s => ({ minValue: Number(s.minValue), maxValue: Number(s.maxValue), bonusAmount: Number(s.bonusAmount) })),
        effectiveFrom: effectiveFrom || new Date().toISOString().split('T')[0],
        notes: pricingNotes
      }, { headers: { Authorization: token } })

      setIsTableLoading(false)
      setEditSuccess(true)
    } catch (err) {
      setIsTableLoading(false)
      toast.error(err.response?.data?.message || 'Failed to update company')
    }
  }

  return (
    <>
      <DisableConfirmModal show={showDisableConfirm} onConfirm={confirmDisable} onCancel={() => setShowDisableConfirm(false)} />
      <LoadingSpinner isLoading={isTableLoading} />
      <FormHeader onClose={() => setEditBoxOpen(false)} />
      <form onSubmit={handleSubmit} className='px-6 pb-6 flex flex-col gap-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField label='Name' name='name' value={formValues.name} onChange={handleChange} required />
          <FormField label='Company Code' name='companyCode' value={formValues.companyCode} onChange={handleChange} required readOnly />
          <FormField label='Address' name='address' value={formValues.address} onChange={handleChange} />
          <FormField label='Contact Number' name='contactNumber' value={formValues.contactNumber} onChange={handleChange} />
          <FormField label='GST Number' name='gstNumber' value={formValues.gstNumber} onChange={handleChange} />
          <FormField label='PAN Number' name='panNumber' value={formValues.panNumber} onChange={handleChange} />
          <FormField label='Remarks' name='remarks' value={formValues.remarks} onChange={handleChange} />
          <SelectField label='Show Price' name='showPrice' value={formValues.showPrice?.toString() || 'false'} onChange={handleChange} options={booleanOptions} />
          <SelectField label='Mask Info' name='maskInfo' value={formValues.maskInfo?.toString() || 'false'} onChange={handleChange} options={booleanOptions} />
        </div>

        <div className='border border-gray-200 rounded-lg p-4'>
          <EmailConfiguration value={formValues.emailConfiguration} onChange={(config) => setFormValues(prev => ({ ...prev, emailConfiguration: config }))} />
        </div>

        <DynamicPricingSection
          dynamicPricingEnabled={dynamicPricingEnabled}
          handleDynamicPricingToggle={handleDynamicPricingToggle}
          slabs={slabs}
          handleSlabChange={handleSlabChange}
          removeSlab={removeSlab}
          addSlab={addSlab}
          effectiveFrom={effectiveFrom}
          setEffectiveFrom={setEffectiveFrom}
          pricingNotes={pricingNotes}
          setPricingNotes={setPricingNotes}
        />

        <div className='sticky bottom-0 bg-white pt-2 pb-1 flex justify-end gap-3 border-t border-gray-100'>
          <button
            type='button'
            onClick={() => setEditBoxOpen(false)}
            className='border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition'
          >
            Cancel
          </button>
          <button type='submit' className='bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition'>Update Details</button>
        </div>
      </form>
    </>
  )
}

export default EditCompany
