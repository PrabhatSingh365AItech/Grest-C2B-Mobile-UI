import React, { useState } from 'react'
import styles from '../PickedUpDevices.module.css'
import { failTextColor } from '../constants'

const ReasonModal = ({ title, placeholder, onSubmit, onClose }) => {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    onSubmit(reason)
    setReason('')
  }

  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <h6 className={failTextColor}>{title}</h6>
        <input
          type='text'
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className='border-2 border-primary rounded-md px-4 py-2 mb-4 w-full'
          placeholder={placeholder}
        />
        <div className='flex flex-row gap-2'>
          <button
            onClick={handleSubmit}
            className='bg-primary text-white px-4 py-2 rounded'
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className='bg-white text-primary border border-primary px-4 py-2 rounded'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReasonModal
