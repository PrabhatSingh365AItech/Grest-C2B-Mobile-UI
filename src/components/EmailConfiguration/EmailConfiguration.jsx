import React, { useState, useEffect } from 'react'
import { MdAdd, MdDelete, MdMail } from 'react-icons/md'

const EmailConfiguration = ({ value, onChange }) => {
  const [emailConfig, setEmailConfig] = useState(
    value || {
      enabled: false,
      recipients: [],
      notificationTypes: ['paymentReceipt'],
    },
  )

  const [newEmail, setNewEmail] = useState({
    email: '',
    name: '',
    type: 'cc',
  })

  useEffect(() => {
    if (value) {
      setEmailConfig(value)
    }
  }, [value])

  const handleToggleEnabled = () => {
    const updated = { ...emailConfig, enabled: !emailConfig.enabled }
    setEmailConfig(updated)
    onChange(updated)
  }

  const handleAddRecipient = () => {
    if (!newEmail.email) {
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail.email)) {
      alert('Please enter a valid email address')
      return
    }

    const updated = {
      ...emailConfig,
      recipients: [...emailConfig.recipients, { ...newEmail, active: true }],
    }
    setEmailConfig(updated)
    onChange(updated)

    // Reset form
    setNewEmail({ email: '', name: '', type: 'cc' })
  }

  const handleRemoveRecipient = (index) => {
    const updated = {
      ...emailConfig,
      recipients: emailConfig.recipients.filter((_, i) => i !== index),
    }
    setEmailConfig(updated)
    onChange(updated)
  }

  return (
    <div className='border border-gray-300 rounded-lg p-4 mb-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <MdMail className='text-xl' />
          Email Configuration
        </h3>
        <label className='flex items-center gap-2 cursor-pointer'>
          <input
            type='checkbox'
            checked={emailConfig.enabled}
            onChange={handleToggleEnabled}
            className='w-4 h-4 cursor-pointer'
          />
          <span className='text-sm'>Enable Payment Emails</span>
        </label>
      </div>

      {emailConfig.enabled && (
        <>
          {/* Add Recipient Form */}
          <div className='grid grid-cols-12 gap-2 mb-4'>
            <input
              type='email'
              placeholder='Email address'
              value={newEmail.email}
              onChange={(e) =>
                setNewEmail({ ...newEmail, email: e.target.value })
              }
              className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <input
              type='text'
              placeholder='Name (optional)'
              value={newEmail.name}
              onChange={(e) =>
                setNewEmail({ ...newEmail, name: e.target.value })
              }
              className='col-span-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <select
              value={newEmail.type}
              onChange={(e) =>
                setNewEmail({ ...newEmail, type: e.target.value })
              }
              className='col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='cc'>CC</option>
              <option value='bcc'>BCC</option>
              <option value='primary'>Primary</option>
            </select>
            <button
              type='button'
              onClick={handleAddRecipient}
              className='col-span-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors'
            >
              <MdAdd className='text-xl' />
            </button>
          </div>

          {/* Recipients List */}
          {emailConfig.recipients.length > 0 && (
            <div className='mb-4 space-y-2'>
              {emailConfig.recipients.map((recipient, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between bg-gray-50 p-2 rounded-md'
                >
                  <div className='flex-1'>
                    <span className='font-medium'>{recipient.email}</span>
                    {recipient.name && (
                      <span className='text-gray-500 ml-2'>
                        ({recipient.name})
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs bg-gray-200 px-2 py-1 rounded uppercase'>
                      {recipient.type}
                    </span>
                    <button
                      type='button'
                      onClick={() => handleRemoveRecipient(index)}
                      className='text-red-600 hover:text-red-800 transition-colors'
                    >
                      <MdDelete className='text-xl' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className='p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800'>
            <strong>Note:</strong> These emails will receive payment receipt
            notifications for all stores belonging to this company.
          </div>
        </>
      )}
    </div>
  )
}

export default EmailConfiguration
