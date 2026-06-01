import React, { useState } from 'react'
import { CiBarcode } from 'react-icons/ci'
import { IMEI_LENGTH } from '../../constants/priceConstants'
import Scanner from '../Scanner'
import ImeiVerificationResult from '../IvsVerification/ImeiVerificationResult'

const ImeiField = ({
  imeinumber,
  setImeiNumber,
  prod,
  imei2,
  setImei2,
  onImeiVerificationComplete,
}) => {
  const [error, setError] = useState('')
  const [imei2Error, setImei2Error] = useState('')
  const [isScanOpen, setIsScanOpen] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [deviceModelInput, setDeviceModelInput] = useState('')
  const pink = 'bg-primary'

  const storeId = JSON.parse(sessionStorage.getItem('profile'))?.storeId || ''
  const agentId = sessionStorage.getItem('userId') || ''
  const leadId = sessionStorage.getItem('LeadId') || ''

  const validateImeiNumber = (value) => {
    if (value && value.length !== IMEI_LENGTH) {
      return 'IMEI number must be exactly 15 digits.'
    } else if (value && !/^\d{15}$/.test(value)) {
      return 'IMEI number must only contain digits.'
    }
    return ''
  }

  const handleChange = (e, setter, setErrorFn) => {
    const value = e.target.value
    setter(value)
    const err = validateImeiNumber(value)
    setErrorFn(err)
    if (value.length === IMEI_LENGTH && /^\d{15}$/.test(value)) {
      e.target.blur()
    }
  }

  const handleScanResult = (scannedImei) => {
    setImeiNumber(scannedImei)
    const err = validateImeiNumber(scannedImei)
    setError(err)
    setIsScanOpen(false)
  }

  const canVerify =
    imeinumber &&
    imeinumber.length === IMEI_LENGTH &&
    /^\d{15}$/.test(imeinumber)

  const handleVerificationComplete = (result) => {
    setVerificationResult(result)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col eminumber mt-[4px]'>
        <div className='flex gap-1 two'>
          <p className='text-base font-medium'>1.</p>
          <p className='text-base font-medium three'>
            Enter your {prod?.[0]?.categoryName} IMEI No./serial no.
            <span className='text-red-500'>*</span>
          </p>
        </div>

        <div className='flex items-center gap-4 mt-2 ml-[19px]'>
          <div className='flex items-center p-2 border-2 border-gray-300 rounded'>
            <input
              type='text'
              className='w-auto outline-none'
              value={imeinumber}
              placeholder='IMEI 1 (15 digits)'
              onChange={(e) => handleChange(e, setImeiNumber, setError)}
              maxLength={15}
            />
            <button
              onClick={() => setIsScanOpen(!isScanOpen)}
              title='Scan IMEI'
            >
              <CiBarcode size={24} className='text-primary' />
            </button>
          </div>
        </div>
        {error && <p className='text-primary mt-2 text-sm'>{error}</p>}
      </div>

      {imei2 !== undefined && (
        <div className='flex flex-col eminumber mt-[4px]'>
          <div className='flex gap-1 two'>
            <p className='text-base font-medium'>1b.</p>
            <p className='text-base font-medium three'>
              IMEI 2 (for dual-SIM devices)
              <span className='text-gray-400 text-sm ml-1'>(optional)</span>
            </p>
          </div>

          <div className='flex items-center gap-4 mt-2 ml-[19px]'>
            <div className='flex items-center p-2 border-2 border-gray-300 rounded'>
              <input
                type='text'
                className='w-auto outline-none'
                value={imei2}
                placeholder='IMEI 2 (optional)'
                onChange={(e) => handleChange(e, setImei2, setImei2Error)}
                maxLength={15}
              />
              <button
                onClick={() => setIsScanOpen(!isScanOpen)}
                title='Scan IMEI'
              >
                <CiBarcode size={24} className='text-primary' />
              </button>
            </div>
          </div>
          {imei2Error && (
            <p className='text-primary mt-2 text-sm'>{imei2Error}</p>
          )}
        </div>
      )}

      <div className='flex flex-col eminumber mt-[4px]'>
        <div className='flex gap-1 two'>
          <p className='text-base font-medium'>1c.</p>
          <p className='text-base font-medium three'>
            Device Model Name
            <span className='text-gray-400 text-sm ml-1'>(optional)</span>
          </p>
        </div>

        <div className='flex items-center gap-4 mt-2 ml-[19px]'>
          <div className='flex items-center p-2 border-2 border-gray-300 rounded'>
            <input
              type='text'
              className='w-auto outline-none'
              value={deviceModelInput}
              placeholder='e.g. iPhone 14, '
              onChange={(e) => setDeviceModelInput(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>
      </div>

      {canVerify && (
        <div className='ml-[19px]'>
          <ImeiVerificationResult
            imei1={imeinumber}
            imei2={imei2 || ''}
            deviceModel={deviceModelInput || prod?.[0]?.categoryName || ''}
            storeId={storeId}
            agentId={agentId}
            leadId={leadId}
            onVerificationComplete={(result) => {
              handleVerificationComplete(result)
              if (onImeiVerificationComplete) onImeiVerificationComplete(result)
            }}
          />
        </div>
      )}

      {isScanOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white p-4 rounded-lg w-full max-w-md'>
            <Scanner
              scanBoxSwitch={() => setIsScanOpen(!isScanOpen)}
              setImei={handleScanResult}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ImeiField
