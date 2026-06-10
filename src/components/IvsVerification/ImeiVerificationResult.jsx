import React, { useState } from 'react'
import { verifyIMEI, IVS_STATUS, STATUS_CONFIG } from '../../services/ivsService'
import { CgSpinner } from 'react-icons/cg'

const ImeiVerificationResult = ({
  imei1,
  imei2,
  deviceModel,
  storeId,
  agentId,
  leadId,
  onVerificationComplete,
}) => {
  const [result, setResult] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [showOverride, setShowOverride] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideMode, setOverrideMode] = useState(false)

  const needsSupervisorOverride =
    result &&
    (result.imei1Status === IVS_STATUS.UNKNOWN ||
      result.imei1Status === IVS_STATUS.ERROR)

  const isBlocked =
    result &&
    (result.imei1Status === IVS_STATUS.BLOCKED ||
      result.imei1Status === IVS_STATUS.STOLEN)

  const handleVerify = async () => {
    if (!imei1) {
      setError('Please enter IMEI 1')
      return
    }

    setIsVerifying(true)
    setError('')
    setResult(null)
    setShowOverride(false)
    setOverrideMode(false)

    try {
      const verificationResult = await verifyIMEI({
        imei1,
        imei2: imei2 || null,
        deviceModel: deviceModel || null,
        storeId,
        agentId,
        leadId,
      })

      setResult(verificationResult)
      if (onVerificationComplete) {
        onVerificationComplete(verificationResult)
      }
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
      if (isTimeout) {
        const fallbackResult = {
          imei1Status: IVS_STATUS.ERROR,
          imei2Status: null,
          allowTransaction: false,
          message: 'IMEI verification timed out after 30 seconds. Use supervisor override to proceed.',
          referenceId: `TMOUT-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          verifiedAt: new Date().toISOString(),
        }
        setResult(fallbackResult)
        if (onVerificationComplete) onVerificationComplete(fallbackResult)
      } else {
        setError(err.response?.data?.message || err.message || 'Verification failed')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleOverrideSubmit = () => {
    if (!overrideReason.trim()) {
      setError('Please provide a reason for override')
      return
    }
    setOverrideMode(true)
  }

  const getStatusConfig = (status) =>
    STATUS_CONFIG[status] || STATUS_CONFIG[IVS_STATUS.UNKNOWN]

  const StatusBadge = ({ status, label }) => {
    const config = getStatusConfig(status)
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.text}`}
      >
        <span>{config.icon}</span>
        <span className='font-medium text-sm'>{config.label}</span>
      </div>
    )
  }

  const canProceed =
    result?.allowTransaction || overrideMode

  return (
    <div className='w-full'>
      <button
        onClick={handleVerify}
        disabled={isVerifying || !imei1}
        className={`w-full px-4 py-2 font-bold text-white rounded-lg flex items-center justify-center gap-2 ${
          isVerifying || !imei1
            ? 'bg-gray-400 cursor-not-allowed'
            : result
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-primary hover:bg-primary-dark'
        }`}
      >
        {isVerifying ? (
          <>
            <CgSpinner size={20} className='animate-spin' />
            Verifying...
          </>
        ) : result ? (
          'Re-verify IMEI'
        ) : (
          'Verify '
        )}
      </button>

      {error && (
        <p className='mt-2 text-sm text-red-600'>{error}</p>
      )}

      {result && (
        <div className='mt-4 p-4 border rounded-lg bg-gray-50'>
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-sm'>IMEI 1:</span>
              <StatusBadge status={result.imei1Status} />
            </div>

            {result.imei2Status && (
              <div className='flex items-center justify-between'>
                <span className='font-medium text-sm'>IMEI 2:</span>
                <StatusBadge status={result.imei2Status} />
              </div>
            )}

            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>{new Date(result.verifiedAt).toLocaleString()}</span>
            </div>
          </div>

          <div
            className={`mt-3 p-3 rounded-lg text-sm font-medium ${
              canProceed
                ? 'bg-green-50 text-green-800 border border-green-300'
                : 'bg-red-50 text-red-800 border border-red-300'
            }`}
          >
            {result.message}
          </div>

          <div className='mt-2 flex items-center gap-1 text-sm text-gray-700'>
            <span className='text-red-500 font-bold'>*</span>
            <span>Authentication fee for device verification is Rs10</span>
          </div>

          

          {needsSupervisorOverride && !overrideMode && (
            <div className='mt-4'>
              <button
                onClick={() => setShowOverride(!showOverride)}
                className='text-sm text-amber-600 underline hover:text-amber-800'
              >
                {showOverride
                  ? 'Cancel'
                  : 'Supervisor override available'}
              </button>

              {showOverride && (
                <div className='mt-3 p-3 border border-amber-300 rounded-lg bg-amber-50'>
                  <p className='text-sm font-medium text-amber-800 mb-2'>
                    Supervisor Override
                  </p>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder='Enter reason for override...'
                    className='w-full p-2 border border-gray-300 rounded text-sm'
                    rows={2}
                  />
                  <button
                    onClick={handleOverrideSubmit}
                    disabled={!overrideReason.trim()}
                    className='mt-2 px-4 py-1.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 disabled:bg-gray-400'
                  >
                    Confirm Override
                  </button>
                </div>
              )}
            </div>
          )}

          {overrideMode && (
            <div className='mt-3 p-3 rounded-lg bg-green-50 border border-green-300 text-green-800 text-sm'>
              Supervisor override approved. Transaction can proceed.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImeiVerificationResult
