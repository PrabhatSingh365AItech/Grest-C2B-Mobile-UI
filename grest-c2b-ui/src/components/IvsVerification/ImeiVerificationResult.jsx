import React, { useState } from 'react'
import { verifyIMEI, IVS_STATUS, STATUS_CONFIG } from '../../services/ivsService'
import { CgSpinner } from 'react-icons/cg'

const useImeiVerification = ({ imei1, imei2, deviceModel, storeId, agentId, leadId, onVerificationComplete }) => {
  const [result, setResult] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [showOverride, setShowOverride] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideMode, setOverrideMode] = useState(false)

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
        if (onVerificationComplete) {
          onVerificationComplete(fallbackResult)
        }
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

  const needsSupervisorOverride =
    result &&
    (result.imei1Status === IVS_STATUS.UNKNOWN ||
      result.imei1Status === IVS_STATUS.ERROR)

  const canProceed = result?.allowTransaction || overrideMode

  return {
    result,
    isVerifying,
    error,
    showOverride,
    overrideReason,
    overrideMode,
    needsSupervisorOverride,
    canProceed,
    setError,
    setShowOverride,
    setOverrideReason,
    handleVerify,
    handleOverrideSubmit,
  }
}

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[IVS_STATUS.UNKNOWN]
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.text}`}
    >
      <span>{config.icon}</span>
      <span className='font-medium text-sm'>{config.label}</span>
    </div>
  )
}

const VerificationResultCard = ({
  result,
  canProceed,
  needsSupervisorOverride,
  overrideMode,
  showOverride,
  overrideReason,
  onShowOverrideChange,
  onOverrideReasonChange,
  onOverrideSubmit,
}) => {
  if (!result) {
    return null
  }

  const getCanProceedClass = () =>
    canProceed
      ? 'bg-green-50 text-green-800 border border-green-300'
      : 'bg-red-50 text-red-800 border border-red-300'

  return (
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
        className={`mt-3 p-3 rounded-lg text-sm font-medium ${getCanProceedClass()}`}
      >
        {result.message}
      </div>

      {needsSupervisorOverride && !overrideMode && (
        <SupervisorOverridePanel
          showOverride={showOverride}
          overrideReason={overrideReason}
          onToggle={() => onShowOverrideChange(!showOverride)}
          onReasonChange={onOverrideReasonChange}
          onSubmit={onOverrideSubmit}
        />
      )}

      {overrideMode && (
        <div className='mt-3 p-3 rounded-lg bg-green-50 border border-green-300 text-green-800 text-sm'>
          Supervisor override approved. Transaction can proceed.
        </div>
      )}
    </div>
  )
}

const SupervisorOverridePanel = ({
  showOverride,
  overrideReason,
  onToggle,
  onReasonChange,
  onSubmit,
}) => (
  <div className='mt-4'>
    <button
      onClick={onToggle}
      className='text-sm text-amber-600 underline hover:text-amber-800'
    >
      {showOverride ? 'Cancel' : 'Supervisor override available'}
    </button>

    {showOverride && (
      <div className='mt-3 p-3 border border-amber-300 rounded-lg bg-amber-50'>
        <p className='text-sm font-medium text-amber-800 mb-2'>
          Supervisor Override
        </p>
        <textarea
          value={overrideReason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder='Enter reason for override...'
          className='w-full p-2 border border-gray-300 rounded text-sm'
          rows={2}
        />
        <button
          onClick={onSubmit}
          disabled={!overrideReason.trim()}
          className='mt-2 px-4 py-1.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 disabled:bg-gray-400'
        >
          Confirm Override
        </button>
      </div>
    )}
  </div>
)

const ImeiVerificationResult = (props) => {
  const {
    result,
    isVerifying,
    error,
    showOverride,
    overrideReason,
    overrideMode,
    needsSupervisorOverride,
    canProceed,
    setShowOverride,
    setOverrideReason,
    handleVerify,
    handleOverrideSubmit,
  } = useImeiVerification(props)

  const isDisabled = isVerifying || !props.imei1

  const getButtonClass = () => {
    if (isDisabled) {
      return 'bg-gray-400 cursor-not-allowed'
    }
    if (result) {
      return 'bg-green-600 hover:bg-green-700'
    }
    return 'bg-primary hover:bg-primary-dark'
  }

  const getButtonContent = () => {
    if (isVerifying) {
      return (
        <>
          <CgSpinner size={20} className='animate-spin' />
          Verifying...
        </>
      )
    }
    if (result) {
      return 'Re-verify IMEI'
    }
    return 'Verify'
  }

  return (
    <div className='w-full'>
      <button
        onClick={handleVerify}
        disabled={isDisabled}
        className={`w-full px-4 py-2 font-bold text-white rounded-lg flex items-center justify-center gap-2 ${getButtonClass()}`}
      >
        {getButtonContent()}
      </button>

      {error && (
        <p className='mt-2 text-sm text-red-600'>{error}</p>
      )}

      <VerificationResultCard
        result={result}
        canProceed={canProceed}
        needsSupervisorOverride={needsSupervisorOverride}
        overrideMode={overrideMode}
        showOverride={showOverride}
        overrideReason={overrideReason}
        onShowOverrideChange={setShowOverride}
        onOverrideReasonChange={setOverrideReason}
        onOverrideSubmit={handleOverrideSubmit}
      />
    </div>
  )
}

export default ImeiVerificationResult
