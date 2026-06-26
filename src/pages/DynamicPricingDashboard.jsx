import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import { toast } from 'react-hot-toast'

const DEFAULT_SLABS = [
  { minValue: 0, maxValue: 2999, bonusAmount: 0 },
  { minValue: 3000, maxValue: 9999, bonusAmount: 3000 },
  { minValue: 10000, maxValue: 14999, bonusAmount: 4000 },
  { minValue: 15000, maxValue: 19999, bonusAmount: 6000 },
  { minValue: 20000, maxValue: 34999, bonusAmount: 8000 },
  { minValue: 35000, maxValue: 999999, bonusAmount: 10000 },
]

const DynamicPricingDashboard = () => {
  const token = sessionStorage.getItem('authToken')
  const location = useLocation()
  const editCompanyId = location.state?.companyId
  const [sideMenu, setsideMenu] = useState(false)
  const [companies, setCompanies] = useState([])
  const [formData, setFormData] = useState({
    companyId: editCompanyId || '',
    isEnabled: '',
    slabs: [...DEFAULT_SLABS],
    effectiveFrom: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (editCompanyId && companies.length > 0) {
      handleCompanyChange({ target: { value: editCompanyId } })
      window.history.replaceState({}, document.title)
    }
  }, [editCompanyId, companies])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll?limit=100`,
        { headers: { Authorization: token } }
      )
      setCompanies(res.data.result || [])
    } catch (err) {
      console.error('Failed to fetch companies', err)
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSlabChange = (index, field, value) => {
    const updated = [...formData.slabs]
    updated[index] = { ...updated[index], [field]: Number(value) }
    setFormData((prev) => ({ ...prev, slabs: updated }))
  }

  const addSlab = () => {
    setFormData((prev) => ({
      ...prev,
      slabs: [...prev.slabs, { minValue: 0, maxValue: 0, bonusAmount: 0 }],
    }))
  }

  const removeSlab = (index) => {
    if (formData.slabs.length <= 1) return
    setFormData((prev) => ({
      ...prev,
      slabs: prev.slabs.filter((_, i) => i !== index),
    }))
  }

  const fetchConfig = async (companyId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/config/${companyId}`,
        { headers: { Authorization: token } }
      )
      const data = res.data.success && res.data.data?._id ? res.data.data : null
      if (data) {
        setFormData((prev) => ({
          ...prev,
          isEnabled: data.isEnabled ? 'true' : 'false',
          slabs: data.slabs?.length ? data.slabs : prev.slabs,
          effectiveFrom: data.effectiveFrom ? data.effectiveFrom.split('T')[0] : '',
          notes: data.notes || '',
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          isEnabled: '',
          slabs: prev.slabs,
          effectiveFrom: '',
          notes: '',
        }))
      }
    } catch (err) {
      console.error('Failed to fetch config', err)
    }
  }

  const handleCompanyChange = (e) => {
    const companyId = e.target.value
    setFormData((prev) => ({
      ...prev,
      companyId,
      isEnabled: '',
      slabs: [...DEFAULT_SLABS],
      effectiveFrom: '',
      notes: '',
    }))
    if (companyId) {
      fetchConfig(companyId)
    }
  }

  const validate = () => {
    if (!formData.companyId) {
      toast.error('Please select a company')
      return false
    }
    if (!formData.isEnabled) {
      toast.error('Please select Enable or Disable')
      return false
    }
    if (formData.isEnabled === 'true') {
      if (!formData.slabs.length) {
        toast.error('Please add at least one pricing slab before saving.')
        return false
      }
      for (let i = 0; i < formData.slabs.length; i++) {
        const s = formData.slabs[i]
        if (Number(s.maxValue) <= Number(s.minValue)) {
          toast.error('Max Value must be greater than Min Value in every slab row.')
          return false
        }
        if (Number(s.bonusAmount) > Number(s.maxValue)) {
          toast.error('Bonus Amount cannot exceed the Exact Value for this slab range.')
          return false
        }
        if (i > 0 && Number(s.minValue) <= Number(formData.slabs[i - 1].maxValue)) {
          toast.error('Slab ranges overlap. Please ensure slabs are contiguous with no gaps.')
          return false
        }
      }
      if (!formData.effectiveFrom) {
        toast.error('Effective From Date is required')
        return false
      }
      if (!editCompanyId) {
        const selectedDate = new Date(formData.effectiveFrom)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selectedDate < today) {
          toast.error('Effective From Date cannot be set in the past.')
          return false
        }
      }
    }
    return true
  }

  const handleSubmitClick = (e) => {
    e.preventDefault()
    if (!validate()) return
    setConfirmModal(true)
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/config`,
        {
          companyId: formData.companyId,
          isEnabled: formData.isEnabled === 'true',
          slabs: formData.slabs.map((s) => ({
            minValue: Number(s.minValue),
            maxValue: Number(s.maxValue),
            bonusAmount: Number(s.bonusAmount),
          })),
          effectiveFrom: formData.effectiveFrom || new Date().toISOString().split('T')[0],
          notes: formData.notes,
        },
        { headers: { Authorization: token } }
      )
      toast.success('Configuration saved successfully')
      setConfirmModal(false)
      navigate('/dynamic-pricing-details')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
    setSaving(false)
  }

  return (
    <div className='min-h-screen pb-8 bg-[#F5F4F9]'>
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>

      {confirmModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl'>
            <p className='text-lg font-semibold mb-2'>
              {editCompanyId ? 'Update Dynamic Pricing?' : formData.isEnabled === 'true' ? 'Enable Dynamic Pricing?' : 'Disable Dynamic Pricing?'}
            </p>
            <p className='text-sm text-gray-600 mb-4'>
              {editCompanyId
                ? `This will update the pricing configuration for this company. Confirm?`
                : formData.isEnabled === 'true'
                  ? `Enabling this will apply dynamic pricing. Existing slabs will become active. Confirm?`
                  : `Disabling this will revert this company to standard pricing. Existing transactions are unaffected. Confirm?`
              }
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                type='button'
                onClick={() => setConfirmModal(false)}
                className='border-2 border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={saveConfig}
                disabled={saving}
                className={`font-medium text-sm text-white px-4 py-2 rounded disabled:opacity-50 ${
                  formData.isEnabled === 'false' || !formData.isEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {saving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          boxShadow:
            'rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px',
        }}
        className='items-center bg-white max-w-full sm:max-w-[900px] flex py-6 sm:py-8 mx-2 sm:mx-auto mt-10 justify-center flex-col'
      >
        <div className='flex flex-col w-full px-4 sm:px-10'>
          <div className='mb-6 flex flex-col gap-2 border-b-2 pb-2'>
            <p className='text-2xl sm:text-4xl font-bold'>{editCompanyId ? 'Edit Dynamic Pricing Configuration' : 'Add Dynamic Pricing Configuration'}</p>
          </div>

          <div className='flex flex-wrap gap-2 mb-6'>
            <button
              type='button'
              onClick={() => navigate('/dynamic-pricing-details')}
              className='font-medium text-sm text-white p-3 rounded bg-primary'
            >
              View Configurations
            </button>
          </div>

          <form className='flex flex-col gap-4' onSubmit={handleSubmitClick} autoComplete='off'>
            <label className='flex flex-col w-full sm:w-[70%] gap-2'>
              <span className='font-medium text-lg sm:text-xl'>Company*</span>
              <select
                name='companyId'
                value={formData.companyId}
                className='outline-none text-base border-2 px-2 py-2 rounded-lg'
                onChange={handleCompanyChange}
                required
              >
                <option value=''>Select Company</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name} ({company.companyCode})
                  </option>
                ))}
              </select>
            </label>

            <label className='flex flex-col w-full sm:w-[70%] gap-2'>
              <span className='font-medium text-lg sm:text-xl'>Enable Dynamic Pricing*</span>
              <select
                name='isEnabled'
                value={formData.isEnabled}
                className='outline-none text-base border-2 px-2 py-2 rounded-lg'
                onChange={handleChange}
                required
              >
                <option value=''>-- Select --</option>
                <option value='true'>ON</option>
                <option value='false'>OFF</option>
              </select>
            </label>

            {formData.isEnabled === 'true' && (
            <>
            <div className='flex flex-col w-full sm:w-[70%] gap-2'>
              <span className='font-medium text-lg sm:text-xl'>Bonus Amount Slab Table</span>
            </div>

            <div className='flex flex-col w-full sm:w-[70%] gap-2'>
              <div className='hidden sm:flex gap-2 text-sm font-medium text-gray-600 border-b border-gray-200 pb-1'>
                <span className='w-[110px]'>Min Value (Rs.)</span>
                <span className='w-[30px]'></span>
                <span className='w-[110px]'>Max Value (Rs.)</span>
                <span className='w-[110px]'>Bonus Amount (Rs.)</span>
              </div>
              {formData.slabs.map((slab, idx) => (
                <div key={idx} className='flex flex-col gap-1'>
                  <div className='flex gap-2 items-center flex-wrap sm:flex-nowrap'>
                    <input
                      type='number'
                      placeholder='Min'
                      className='border-2 px-2 py-2 rounded-lg outline-none w-full sm:w-[110px]'
                      value={slab.minValue}
                      onChange={(e) => handleSlabChange(idx, 'minValue', e.target.value)}
                    />
                    <span className='text-gray-400 hidden sm:inline'>-</span>
                    <input
                      type='number'
                      placeholder='Max'
                      className='border-2 px-2 py-2 rounded-lg outline-none w-full sm:w-[110px]'
                      value={slab.maxValue}
                      onChange={(e) => handleSlabChange(idx, 'maxValue', e.target.value)}
                    />
                    <input
                      type='number'
                      placeholder='Bonus'
                      className='border-2 px-2 py-2 rounded-lg outline-none w-full sm:w-[110px]'
                      value={slab.bonusAmount}
                      onChange={(e) => handleSlabChange(idx, 'bonusAmount', e.target.value)}
                    />
                    <button
                      type='button'
                      onClick={() => removeSlab(idx)}
                      className='text-red-500 font-bold text-lg'
                    >
                      X
                    </button>
                  </div>
                  <p className='text-xs text-gray-400 ml-1'>
                    Quoted Price = Exact Value - Rs.{slab.bonusAmount || 0}
                  </p>
                </div>
              ))}
              <button
                type='button'
                onClick={addSlab}
                className='border-2 border-dashed border-gray-400 px-3 py-1 rounded-lg text-sm w-full sm:w-[180px] hover:bg-gray-100'
              >
                + Add Slab
              </button>
            </div>

            <label className='flex flex-col w-full sm:w-[70%] gap-2'>
              <span className='font-medium text-lg sm:text-xl'>Effective From Date*</span>
              <p className='text-xs text-gray-400'>
                Set the date when these pricing rules take effect. Must be today or a future date. Cannot be set in the past.
              </p>
              <input
                type='date'
                name='effectiveFrom'
                min={new Date().toISOString().split('T')[0]}
                className='border-2 px-2 py-2 rounded-lg outline-none w-full sm:w-[220px]'
                value={formData.effectiveFrom}
                onChange={handleChange}
              />
            </label>

            <label className='flex flex-col w-full sm:w-[70%] gap-2'>
              <span className='font-medium text-lg sm:text-xl'>Notes / Remarks</span>
              <textarea
                name='notes'
                className='border-2 px-2 py-2 rounded-lg outline-none'
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder='Internal notes for this pricing configuration...'
              />
            </label>
            </>
            )}

            <div className='mt-6'>
              <button
                type='submit'
                disabled={saving}
                className='font-medium text-sm text-white p-3 rounded bg-primary disabled:opacity-50'
              >
                {saving ? 'Saving...' : editCompanyId ? 'Update Configuration' : 'Submit Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DynamicPricingDashboard