import React, { useEffect, useState } from 'react'
import { CiBarcode } from 'react-icons/ci'
import { IMEI_LENGTH } from '../../constants/priceConstants'
import Scanner from '../Scanner'
import { Capacitor } from '@capacitor/core'
import toast from 'react-hot-toast'

const ImeiField = ({ imeinumber, setImeiNumber, prod }) => {
  const [error, setError] = useState('')
  const [isScanOpen, setIsScanOpen] = useState(false)
  const pink = 'bg-primary'

  const validateImeiNumber = (value) => {
    if (value.length !== IMEI_LENGTH) {
      setError('IMEI number must less than or equal to 15 digits.')
      return false
    } else if (!/^\d{15}$/.test(value)) {
      setError('IMEI number must only contain digits.')
      return false
    }
    setError('')
    return true
  }

  const handleChange = (e) => {
    const value = e.target.value
    setImeiNumber(value)
    validateImeiNumber(value)

    // Auto-blur on mobile when IMEI is complete (15 digits)
    if (value.length === IMEI_LENGTH && /^\d{15}$/.test(value)) {
      e.target.blur()
    }
  }

  useEffect(() => {
    validateImeiNumber(imeinumber)
  }, [imeinumber])

  const handleVerify = () => {
    if (validateImeiNumber(imeinumber)) {
      console.log('IMEI number is valid.')
    }
  }

  const handleScanClick = () => {
    const platform = Capacitor.getPlatform()
    if (platform === 'web') {
      toast.error(
        'Barcode scanning is only available on the mobile app. Please use the Android or iOS app to scan barcodes.',
        {
          duration: 4000,
          position: 'top-center',
        }
      )
      return
    }
    setIsScanOpen(true)
  }

  return (
    <>
      <div className='flex flex-col eminumber mt-[4px]'>
        <div className='flex gap-1 two'>
          <p className='text-base font-medium'>1.</p>
          <p className='text-base font-medium three'>
            Enter your {prod[0]?.categoryName} IMEI No./serial no.
            <span className='text-red-500'>*</span>
          </p>
        </div>

        <div className='flex items-center gap-4 mt-2 ml-[19px]'>
          <div className='flex items-center p-2 border-2 border-gray-300 rounded'>
            <input
              type='text'
              className='w-auto outline-none'
              value={imeinumber}
              placeholder='IMEI no./Serial no.'
              onChange={handleChange}
              maxLength={15}
            />
            <button onClick={handleScanClick} title='Scan IMEI'>
              <CiBarcode size={24} className='text-primary' />
            </button>
          </div>
          <button
            className={`px-4 py-2 font-bold text-white rounded ${
              !error ? pink : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={handleVerify}
            disabled={!!error}
          >
            Verify
          </button>
        </div>
        {error && <p className='text-primary mt-2 text-sm'>{error}</p>}
      </div>

      {isScanOpen && (
        <div className='fixed inset-0 z-50 bg-white' id='scanner-modal'>
          <Scanner
            scanBoxSwitch={() => setIsScanOpen(false)}
            setImei={setImeiNumber}
          />
        </div>
      )}
    </>
  )
}

export default ImeiField
