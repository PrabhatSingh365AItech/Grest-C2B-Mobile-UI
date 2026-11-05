import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DiagnosisLayout from '../../components/DiagnosisLayout'
import { toast } from 'react-hot-toast'

const DiagnosisReport = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const imei = location.state?.imei || 'Unknown IMEI'
  const detectedModel = location.state?.detectedModel || 'Unknown Device'
  const diagnosisResults = location.state?.diagnosisResults || null

  const tests = diagnosisResults?.tests || []
  const properties = diagnosisResults?.properties || {}

  const passed = tests.filter((t) => t.result === 'PASSED').length
  const failed = tests.filter((t) => t.result === 'FAILED').length
  const indeterminate = tests.filter((t) => t.result === 'INDETERMINATE').length
  const total = tests.length

  const getResultStyle = (result) => {
    if (result === 'PASSED') {
      return 'text-green-600 font-bold'
    }
    if (result === 'FAILED') {
      return 'text-red-500 font-bold'
    }
    return 'text-orange-400 font-bold'
  }

  const getResultBadge = (result) => {
    if (result === 'PASSED') {
      return '✓ PASSED'
    }
    if (result === 'FAILED') {
      return '✗ FAILED'
    }
    return '~ INDETERMINATE'
  }

  const handleProceed = () => {
    // The seller already selected the model earlier in the flow; the full phone
    // object (including the selected config) is stored in sessionStorage 'dataModel'.
    const sellerModelStr = sessionStorage.getItem('dataModel')
    const sellerModel = sellerModelStr ? JSON.parse(sellerModelStr) : null

    if (!sellerModel?.models?.name) {
      toast.error('No model selected. Redirecting to manual selection...')
      navigate('/SelectDeviceType')
      return
    }

    // In the diagnosis flow the config is stored as an array (from SelectDevice),
    // but buildFinalPayload expects a single object with .storage / .RAM.
    // Normalize it to the first config item so the same payload is produced as
    // when skipping diagnosis and selecting the config on the SelectModel page.
    const selectedConfig = Array.isArray(sellerModel?.models?.config)
      ? sellerModel.models.config[0]
      : sellerModel?.models?.config

    const updatedModel = {
      ...sellerModel,
      models: {
        ...sellerModel.models,
        config: selectedConfig,
        imei: imei,
      },
    }

    sessionStorage.setItem('dataModel', JSON.stringify(updatedModel))
    sessionStorage.setItem('DeviceType', sellerModel.models.type || 'CTG1')
    sessionStorage.setItem('diagnosisResults', JSON.stringify(diagnosisResults))
    sessionStorage.setItem('diagnosisImei', imei)
    navigate('/device/Qestions')
  }

  return (
    <DiagnosisLayout>
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-md border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">TEST REPORT</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {properties.model_name || detectedModel}
                </p>
                <p className="text-xs text-gray-400">IMEI: {imei}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {passed}/{total} PASSED
                </span>
                {failed > 0 && (
                  <p className="text-xs text-red-500 mt-1">{failed} Failed</p>
                )}
                {indeterminate > 0 && (
                  <p className="text-xs text-orange-400 mt-1">{indeterminate} Indeterminate</p>
                )}
              </div>
            </div>
          </div>

          {/* Test Results List */}
          <div className="flex-1 overflow-y-auto max-h-[50vh] divide-y divide-gray-50 px-5 sm:px-6">
            {tests.length > 0 ? (
              tests.map((test, idx) => (
                <div key={idx} className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-700 font-medium">{test.name}</span>
                  <span className={`text-xs ${getResultStyle(test.result)}`}>
                    {getResultBadge(test.result)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                No test results available
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-5 sm:p-6 border-t border-gray-100 flex flex-col gap-3">
            <button
              onClick={handleProceed}
              className="w-full border-2 border-primary bg-primary text-white text-sm font-medium px-4 py-3 rounded-lg hover:opacity-90 transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </DiagnosisLayout>
  )
}

export default DiagnosisReport
