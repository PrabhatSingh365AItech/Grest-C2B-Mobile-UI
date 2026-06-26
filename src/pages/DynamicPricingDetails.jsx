import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import AuditLogModal from '../components/AuditLogModal'
import { toast } from 'react-hot-toast'
import styles from './DynamicPricingDetails.module.css'

const DynamicPricingDetails = () => {
  const token = sessionStorage.getItem('authToken')
  const navigate = useNavigate()
  const [sideMenu, setsideMenu] = useState(false)
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [auditLogModal, setAuditLogModal] = useState(null)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/all`,
        { headers: { Authorization: token } }
      )
      setConfigs(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch configs', err)
    }
    setLoading(false)
  }

  const handleToggle = async (config, newValue) => {
    setConfirmModal({ config, newValue })
  }

  const doToggle = async (config, newValue) => {
    setToggling(config._id)
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/config`,
        {
          companyId: config.companyId._id,
          isEnabled: newValue,
          slabs: config.slabs?.map(s => ({
            minValue: Number(s.minValue),
            maxValue: Number(s.maxValue),
            bonusAmount: Number(s.bonusAmount)
          })) || [],
          effectiveFrom: config.effectiveFrom ? config.effectiveFrom.split('T')[0] : '',
          notes: config.notes || ''
        },
        { headers: { Authorization: token } }
      )
      toast.success(`Dynamic Pricing ${newValue ? 'enabled' : 'disabled'} successfully`)
      fetchConfigs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Toggle failed')
    }
    setToggling(null)
    setConfirmModal(null)
  }

  const handleEdit = (config) => {
    navigate('/dynamic-pricing', { state: { companyId: config.companyId?._id } })
  }

  const handleDelete = async (config) => {
    setDeleteConfirm(null)
    setToggling(config._id)
    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/config/${config.companyId?._id}`,
        { headers: { Authorization: token } }
      )
      toast.success('Configuration deleted successfully')
      fetchConfigs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
    setToggling(null)
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
              {confirmModal.newValue ? 'Enable Dynamic Pricing?' : 'Disable Dynamic Pricing?'}
            </p>
            <p className='text-sm text-gray-600 mb-4'>
              {confirmModal.newValue
                ? `Enabling this will apply dynamic pricing for ${confirmModal.config.companyId?.name || 'this company'}. Existing slabs will become active. Confirm?`
                : `Disabling this will revert ${confirmModal.config.companyId?.name || 'this company'} to standard pricing. Existing transactions are unaffected. Confirm?`
              }
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                type='button'
                onClick={() => setConfirmModal(null)}
                className='border-2 border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => doToggle(confirmModal.config, confirmModal.newValue)}
                disabled={toggling === confirmModal.config?._id}
                className={`font-medium text-sm text-white px-4 py-2 rounded disabled:opacity-50 ${
                  confirmModal.newValue ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {toggling === confirmModal.config?._id
                  ? `${confirmModal.newValue ? 'Enabling' : 'Disabling'}...`
                  : 'Confirm'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl'>
            <p className='text-lg font-semibold mb-2'>Delete Configuration?</p>
            <p className='text-sm text-gray-600 mb-4'>
              This will permanently delete the pricing configuration for {deleteConfirm.companyId?.name || 'this company'}. This action cannot be undone.
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                type='button'
                onClick={() => setDeleteConfirm(null)}
                className='border-2 border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => handleDelete(deleteConfirm)}
                disabled={toggling === deleteConfirm?._id}
                className='font-medium text-sm text-white px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50'
              >
                {toggling === deleteConfirm?._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AuditLogModal
        isOpen={!!auditLogModal}
        onClose={() => setAuditLogModal(null)}
        title='Pricing Audit Log'
        subtitle={
          auditLogModal
            ? `${auditLogModal.companyId?.name || 'Unknown Company'}${auditLogModal.companyId?.companyCode ? ` (${auditLogModal.companyId.companyCode})` : ''}`
            : ''
        }
        entries={auditLogModal?.auditLog || []}
      />

      <div
        style={{
          boxShadow:
            'rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px',
        }}
        className='items-center bg-white max-w-full sm:max-w-[1100px] flex py-6 sm:py-8 mx-2 sm:mx-auto mt-6 justify-center flex-col'
      >
        <div className='flex flex-col w-full px-4 sm:px-10'>
          <div className='mb-6 flex flex-col gap-2 border-b-2 pb-2'>
            <p className='text-2xl sm:text-4xl font-bold'>Dynamic Pricing Configurations</p>
          </div>

          <div className='flex flex-wrap gap-2 mb-6'>
            <button
              type='button'
              onClick={() => navigate('/dynamic-pricing')}
              className='font-medium text-sm text-white p-3 rounded bg-primary'
            >
              Add Configuration
            </button>
            <button
              type='button'
              onClick={fetchConfigs}
              className='border-2 border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50'
            >
              Refresh
            </button>
          </div>

          <div className='overflow-x-auto'>
            {loading ? (
              <p className='text-gray-500 text-center py-8'>Loading configurations...</p>
            ) : configs.length === 0 ? (
              <p className='text-gray-500 text-center py-8'>No configurations found</p>
            ) : (
              <table className='w-full border border-primary min-w-[600px]'>
                <thead className='bg-primary text-white'>
                  <tr>
                    <th className='p-2 text-xs sm:text-sm md:p-3 md:text-base'>Company</th>
                    <th className='p-2 text-xs sm:text-sm md:p-3 md:text-base'>Status</th>
                    <th className='p-2 text-xs sm:text-sm md:p-3 md:text-base'>Slabs</th>
                    <th className='p-2 text-xs sm:text-sm md:p-3 md:text-base'>Effective From</th>
                    <th className='p-2 text-xs sm:text-sm md:p-3 md:text-base'>Notes</th>
                    <th className='p-2 text-xs sm:text-sm md:p-3 md:text-base'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config, index) => (
                    <React.Fragment key={config._id}>
                      <tr className={index % 2 === 0 ? 'bg-gray-200' : ''}>
                        <td className='p-2 text-xs sm:text-sm text-center md:p-3 md:text-base font-medium'>
                          {config.companyId?.name || 'Unknown'}
                        </td>
                        <td className='p-2 text-xs sm:text-sm text-center md:p-3 md:text-base'>
                          <span className={
                            config.isEnabled
                              ? config.slabs?.length ? styles.status_on : styles.status_pending
                              : styles.status_off
                          }>
                            {config.isEnabled
                              ? config.slabs?.length ? 'ON' : 'Config Pending'
                              : 'OFF'}
                          </span>
                        </td>
                        <td className='p-2 text-xs sm:text-sm text-center md:p-3 md:text-base'>
                          <span
                            className={styles.slabs_link}
                            onClick={() => setExpanded(expanded === config._id ? null : config._id)}
                          >
                            {config.slabs?.length || 0} slabs
                          </span>
                        </td>
                        <td className='p-2 text-xs sm:text-sm text-center md:p-3 md:text-base'>
                          {config.effectiveFrom ? new Date(config.effectiveFrom).toLocaleDateString() : '-'}
                        </td>
                        <td className='p-2 text-xs sm:text-sm text-center md:p-3 md:text-base max-w-[150px] truncate'>
                          {config.notes || '-'}
                        </td>
                        <td className='p-2 text-xs sm:text-sm text-center md:p-3 md:text-base'>
                          <div className='flex flex-col gap-1 items-center'>
                            <button
                              className={styles.view_btn}
                              onClick={() => handleEdit(config)}
                            >
                              Edit
                            </button>
                            <button
                              className={config.isEnabled ? styles.disable_btn : styles.enable_btn}
                              disabled={toggling === config._id}
                              onClick={() => handleToggle(config, !config.isEnabled)}
                            >
                              {toggling === config._id ? '...' : config.isEnabled ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              className={styles.view_btn}
                              onClick={() => setAuditLogModal(config)}
                            >
                              Audit Log
                            </button>
                            <button
                              className={styles.delete_btn}
                              disabled={toggling === config._id}
                              onClick={() => setDeleteConfirm(config)}
                            >
                              Delete
                            </button>
                            
                          </div>
                        </td>
                      </tr>
                      {expanded === config._id && config.slabs?.length > 0 && (
                        <tr className={styles.expanded_row}>
                          <td colSpan={6} className='p-3'>
                            <div className='text-xs sm:text-sm'>
                              <p className='font-medium text-gray-600 mb-2 text-left'>Slab Details</p>
                              <div className='flex gap-2 sm:gap-4 text-xs font-medium text-gray-500 border-b border-gray-300 pb-1 mb-1'>
                                <span className='w-[70px] sm:w-[100px]'>Min Value</span>
                                <span className='w-[70px] sm:w-[100px]'>Max Value</span>
                                <span className='w-[70px] sm:w-[100px]'>Bonus Amt</span>
                                <span className='hidden sm:inline'>Formula</span>
                              </div>
                              {config.slabs.map((slab, idx) => (
                                <div key={idx} className='flex gap-2 sm:gap-4 py-1 text-xs border-b border-gray-200'>
                                  <span className='w-[70px] sm:w-[100px]'>Rs. {slab.minValue}</span>
                                  <span className='w-[70px] sm:w-[100px]'>Rs. {slab.maxValue}</span>
                                  <span className='w-[70px] sm:w-[100px]'>Rs. {slab.bonusAmount}</span>
                                  <span className='text-gray-400 truncate'>EV - Rs. {slab.bonusAmount}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DynamicPricingDetails