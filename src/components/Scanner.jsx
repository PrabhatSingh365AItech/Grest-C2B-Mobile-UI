import React, { useState, useEffect } from 'react'
import { IoMdArrowRoundBack } from 'react-icons/io'
import { Capacitor } from '@capacitor/core'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'

const Scanner = (props) => {
  const [error, setError] = useState(null)
  const [isReady, setIsReady] = useState(false)

  const checkPermissions = async () => {
    try {
      const { camera } = await BarcodeScanner.checkPermissions()
      if (camera !== 'granted') {
        const { camera: requestedPermission } = await BarcodeScanner.requestPermissions()
        if (requestedPermission !== 'granted') {
          throw new Error('Camera permission denied')
        }
      }
      return true
    } catch (err) {
      console.error('Permission error:', err)
      setError(err.message || 'Camera permission required')
      return false
    }
  }

  const scan = async () => {
    try {
      const platform = Capacitor.getPlatform()

      if (platform === 'web') {
        setError('Barcode scanning is only available on the mobile app (iOS & Android). Please install the app or manually enter the IMEI number.')
        return
      }

      const hasPermission = await checkPermissions()
      if (!hasPermission) {
        return
      }

      setError(null)

      // Use the scan() method which opens native camera UI
      const result = await BarcodeScanner.scan()

      if (result.barcodes && result.barcodes.length > 0) {
        const barcode = result.barcodes[0].displayValue
        console.log('Barcode scanned:', barcode)
        props.setImei(barcode)
        props.scanBoxSwitch()
      }
    } catch (err) {
      console.error('Scanner error:', err)
      if (err.message !== 'User cancelled the scan') {
        setError(err.message || 'Failed to scan barcode')
      } else {
        // User cancelled, just close
        props.scanBoxSwitch()
      }
    }
  }

  useEffect(() => {
    const platform = Capacitor.getPlatform()
    if (platform !== 'web') {
      setIsReady(true)
      scan()
    } else {
      setError('Barcode scanning is only available on the mobile app (iOS & Android). Please install the app or manually enter the IMEI number.')
    }
  }, [])

  const handleBack = () => {
    props.scanBoxSwitch()
  }

  const handleRetry = () => {
    setError(null)
    scan()
  }

  return (
    <div className='bg-white w-full h-full flex flex-col'>
      <div className='p-4'>
        <button
          className='flex items-center text-lg'
          onClick={handleBack}
        >
          <IoMdArrowRoundBack size={24} className='mr-2' />
          Back
        </button>
      </div>

      <div className='flex-1 flex items-center justify-center'>
        {error ? (
          <div className='text-red-500 p-4 text-center max-w-md'>
            <p className='mb-4 text-sm'>{error}</p>
            <button
              className='px-4 py-2 bg-blue-500 text-white rounded'
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className='p-4 text-center'>
            <div className='mb-4'>
              <div className='inline-block animate-pulse bg-blue-500 rounded-full p-4 mb-2'>
                <svg className='w-12 h-12 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                </svg>
              </div>
            </div>
            <p className='text-lg font-semibold mb-2'>Opening Camera...</p>
            <p className='text-sm text-gray-600'>
              Point your camera at a barcode to scan
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Scanner
