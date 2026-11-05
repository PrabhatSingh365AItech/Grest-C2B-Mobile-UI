import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyIMEI } from '../../services/ivsService'
import DiagnosisLayout from '../../components/DiagnosisLayout'
import apple_watch from '../../assets/apple_watch.png'
import { IoArrowBack } from 'react-icons/io5'
import { CiBarcode } from 'react-icons/ci'
import Scanner from '../../components/Scanner'

// Convert a size string like "4 GB" / "1 TB" to MB for comparison
const parseSize = (size) => {
  const num = parseFloat(size) || 0
  const unit = String(size || '').toUpperCase()
  if (unit.includes('TB')) {
    return num * 1024 * 1024
  }
  if (unit.includes('GB')) {
    return num * 1024
  }
  return num
}

const isSameConfig = (a, b) =>
  !!a && !!b && a.RAM === b.RAM && a.storage === b.storage

const SPINNER_PATH = 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962'
  + ' 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'

const SpinnerIcon = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d={SPINNER_PATH}
    ></path>
  </svg>
)

const ImeiInput = ({ label, sublabel, value, onChange, scanTarget, onScan }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {sublabel && <span className="text-gray-400">{sublabel}</span>}
    </label>
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label}`}
        className="w-full border border-gray-300 px-3 py-2 pr-10 rounded-lg outline-none bg-white focus:border-[var(--primary-color)] transition text-sm"
      />
      <button
        type="button"
        onClick={() => onScan(scanTarget)}
        title="Scan IMEI"
        aria-label="Scan IMEI"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
      >
        <CiBarcode size={22} />
      </button>
    </div>
  </div>
)

const InitialStep = ({ modelData, phoneFrontPhoto, DummyImg, configs, selectedConfig, onSelectConfig, price, onStartDiagnosis, onBack, onSkip }) => (
  <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-100 px-4 py-4 animate-fade-in">
    <button
      onClick={onBack}
      title="Go back"
      aria-label="Go back"
      className="text-gray-700 hover:text-gray-900 p-1"
    >
      <IoArrowBack size={18} />
    </button>
    <div className="flex flex-row items-center gap-3 mt-3">
      <div className="flex items-center justify-center w-1/2">
        <img
          className="max-w-[128px] max-h-[130px] object-contain"
          src={phoneFrontPhoto || DummyImg}
          alt={modelData?.models?.name || 'Device'}
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-xl font-medium">{modelData?.models?.name}</p>
        <div>
          <p>Get Upto</p>
          <p className="font-bold text-2xl md:text-4xl text-primary">
            {price ? `\u20B9${price.toLocaleString('en-IN')}` : 'N/A'}
          </p>
        </div>
        {selectedConfig && (
          <span className="inline-flex items-center justify-center self-start bg-primary text-white text-[0.7rem] px-2.5 py-1 rounded-lg">
            {selectedConfig.RAM}/{selectedConfig.storage}
          </span>
        )}
      </div>
    </div>

    {configs && configs.length > 1 && (
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">
          Select RAM / ROM:
        </p>
        <div className="flex flex-wrap gap-2">
          {configs.map((configItem, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectConfig(configItem)}
              aria-pressed={isSameConfig(selectedConfig, configItem)}
              className={`border-2 px-3 py-1.5 rounded text-[12px] transition ${
                isSameConfig(selectedConfig, configItem)
                  ? 'border-primary bg-primary text-white font-semibold shadow-md'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              {configItem.RAM}/{configItem.storage}
            </button>
          ))}
        </div>
      </div>
    )}

    <p className="text-center text-gray-600 text-sm mt-3 mb-2">
      Would you like to run a diagnostic test on the customer&apos;s device?
    </p>

    <div className="flex flex-col gap-2">
      <button
        onClick={onStartDiagnosis}
        className="w-full border-2 border-primary bg-primary text-white text-[12px] px-4 py-2 rounded"
      >
        Start Diagnosis
      </button>
      <button
        onClick={onSkip}
        className="w-full border-2 border-primary bg-white text-primary text-[12px] px-4 py-2 rounded"
      >
        Skip
      </button>
    </div>

    <div className="bg-[#FBF3CD] mx-2 py-2 px-2.5 mt-4 rounded-lg text-[11px] leading-relaxed">
      <p>
        This price stated above depends on the condition of your
        product and is not final. The final price offer will be quoted
        at the diagnosis by our experts.
      </p>
    </div>
  </div>
)

const ImeiErrorBox = ({ message }) => (
  <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
    <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-1">
      &#10007; IMEI Verification Failed
    </p>
    <p className="text-sm text-red-700">{message}</p>
  </div>
)

const ImeiStep = ({
  imei, imei2, isLoading, isVerified, imeiStatus, errorMessage, verifyMessage,
  onChangeImei1, onChangeImei2, onEditStart, onEditEnd,
  onBack, onVerify, onDiagnoseNow, onScan
}) => (
  <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in">
    <button
      onClick={onBack}
      title="Go back"
      aria-label="Go back"
      className="text-gray-700 hover:text-gray-900 p-1"
    >
      <IoArrowBack size={18} />
    </button>
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 mt-3">
      Enter Device IMEI
    </h2>

    {/* Focus anywhere in the IMEI fields puts the form back in edit mode;
        leaving them only ends it when focus moves outside this group */}
    <div
      onFocus={onEditStart}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          onEditEnd()
        }
      }}
    >
      <ImeiInput
        label="IMEI 1"
        value={imei}
        onChange={onChangeImei1}
        scanTarget="imei1"
        onScan={onScan}
      />
      <ImeiInput
        label="IMEI 2"
        sublabel="(for dual-SIM devices, optional)"
        value={imei2}
        onChange={onChangeImei2}
        scanTarget="imei2"
        onScan={onScan}
      />
    </div>

    {!isVerified ? (
      <div className="flex flex-col gap-3">
        {errorMessage && <ImeiErrorBox message={errorMessage} />}
        <button
          onClick={onVerify}
          disabled={isLoading || imei.length !== 15}
          className="w-full border-2 border-primary bg-primary text-white text-[12px] px-4 py-2 rounded flex justify-center items-center disabled:opacity-50"
        >
          {isLoading ? <SpinnerIcon /> : 'Verify IMEI'}
        </button>
      </div>
    ) : (
      <div className="animate-fade-in">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
            &#10003; IMEI Verified
          </p>
          <p className="text-sm text-green-700">
            IMEI: <span className="font-bold">{imei}</span>
          </p>
          {imei2 && (
            <p className="text-sm text-green-700">
              IMEI 2: <span className="font-bold">{imei2}</span>
            </p>
          )}
          <p className="text-xs text-green-600 mt-1">
            Status: {imeiStatus || 'Clean'} &mdash; Ready for diagnosis
          </p>
          {verifyMessage && (
            <p className="text-sm text-green-700 mt-2">{verifyMessage}</p>
          )}
        </div>
        <button
          onClick={onDiagnoseNow}
          className="w-full border-2 border-primary bg-primary text-white text-[12px] px-4 py-2 rounded"
        >
          Generate QR
        </button>
      </div>
    )}
  </div>
)

const ScannerOverlay = ({ onClose, onImeiScan, scanTarget }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded-lg w-full max-w-md">
      <Scanner
        scanBoxSwitch={onClose}
        setImei={(code) => {
          const cleaned = (code || '').replace(/\D/g, '').slice(0, 15)
          onImeiScan(scanTarget, cleaned)
        }}
      />
    </div>
  </div>
)

const DiagnosisEntry = () => {
  const [imei, setImei] = useState('')
  const [imei2, setImei2] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [detectedModel, setDetectedModel] = useState(null)
  // Snapshot of the last successful verification: { imei, imei2, status, message }
  const [verified, setVerified] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [scanTarget, setScanTarget] = useState(null)
  const [step, setStep] = useState('initial')

  const navigate = useNavigate()

  const modelDataStr = sessionStorage.getItem('dataModel')
  const modelData = modelDataStr ? JSON.parse(modelDataStr) : null
  const phoneFrontPhoto =
    modelData?.models?.phonePhotos?.front ||
    modelData?.models?.phonePhotos?.upFront
  const Device = sessionStorage.getItem('DeviceType')
  const DummyImg =
    Device === 'CTG1'
      ? 'https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg'
      : apple_watch
  const modelConfigDataStr = sessionStorage.getItem('dataModelConfig')
  const modelConfigData = modelConfigDataStr
    ? JSON.parse(modelConfigDataStr)
    : null
  // Sort config by RAM first, then by storage (ascending)
  const configs = Array.isArray(modelConfigData?.config)
    ? [...modelConfigData.config].sort(
        (a, b) =>
          parseSize(a.RAM) - parseSize(b.RAM) ||
          parseSize(a.storage) - parseSize(b.storage),
      )
    : []
  // Default to the highest RAM/storage variant (last after sorting)
  const [selectedConfig, setSelectedConfig] = useState(configs.at(-1) || null)
  const price = selectedConfig?.price
    ? Math.round(selectedConfig.price * 1.08)
    : null

  const saveSelectedConfig = () => {
    const dataStr = sessionStorage.getItem('dataModel')
    if (!dataStr || !selectedConfig) {
      return
    }
    const data = JSON.parse(dataStr)
    const updatedData = {
      ...data,
      models: {
        ...data.models,
        config: selectedConfig,
      },
    }
    sessionStorage.setItem('dataModel', JSON.stringify(updatedData))
  }

  const handleStartDiagnosis = () => {
    saveSelectedConfig()
    setStep('imei')
  }

  const handleSkip = () => {
    saveSelectedConfig()
    sessionStorage.removeItem('diagnosisResults')
    sessionStorage.removeItem('diagnosisImei')
    navigate('/selectmodel')
  }

  // Verified only while the fields still hold the exact IMEIs that were
  // verified and the user isn't editing them; otherwise Verify shows again
  const isVerified =
    !!verified &&
    !isEditing &&
    verified.imei === imei &&
    verified.imei2 === imei2

  const handleVerifyImei = async () => {
    if (!imei || imei.length !== 15) {
      setErrorMessage('Please enter a valid 15-digit IMEI')
      return
    }
    if (imei2 && imei2.length !== 15) {
      setErrorMessage('IMEI 2 must be exactly 15 digits')
      return
    }

    setErrorMessage('')
    setIsLoading(true)
    try {
      const profileStr = sessionStorage.getItem('profile')
      const profile = profileStr ? JSON.parse(profileStr) : {}

      const result = await verifyIMEI({
        imei1: imei,
        ...(imei2 ? { imei2 } : {}),
        storeId: profile?.storeCode || '',
        agentId: profile?.id || ''
      })

      if (result && result.allowTransaction) {
        setDetectedModel(null)
        setIsEditing(false)
        setVerified({
          imei,
          imei2,
          status: result.imei1Status || 'CLEAN',
          message: result.message || '',
        })
      } else {
        setVerified(null)
        setErrorMessage(
          result?.message || `IMEI Status: ${result?.imei1Status || 'Unknown'}. Cannot proceed.`
        )
      }
    } catch (error) {
      console.error(error)
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
      setErrorMessage(
        isTimeout
          ? 'IMEI verification timed out after 30 seconds. Please try again.'
          : error.response?.data?.message || error.message || 'Verification failed'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiagnoseNow = () => {
    navigate('/diagnosis/qr', { state: { imei, detectedModel } })
  }

  const handleImeiScan = (target, cleaned) => {
    setErrorMessage('')
    if (target === 'imei1') {
      setImei(cleaned)
    } else {
      setImei2(cleaned)
    }
  }

  return (
    <DiagnosisLayout>
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        {step === 'initial' && (
          <InitialStep
            modelData={modelData}
            phoneFrontPhoto={phoneFrontPhoto}
            DummyImg={DummyImg}
            configs={configs}
            selectedConfig={selectedConfig}
            onSelectConfig={setSelectedConfig}
            price={price}
            onStartDiagnosis={handleStartDiagnosis}
            onBack={() => navigate(-1)}
            onSkip={handleSkip}
          />
        )}

        {step === 'imei' && (
          <ImeiStep
            imei={imei}
            imei2={imei2}
            isLoading={isLoading}
            isVerified={isVerified}
            imeiStatus={verified?.status}
            errorMessage={errorMessage}
            verifyMessage={verified?.message}
            onChangeImei1={(e) => {
              setErrorMessage('')
              setImei(e.target.value.replace(/\D/g, '').slice(0, 15))
            }}
            onChangeImei2={(e) => {
              setErrorMessage('')
              setImei2(e.target.value.replace(/\D/g, '').slice(0, 15))
            }}
            onEditStart={() => {
              setIsEditing(true)
              setErrorMessage('')
            }}
            onEditEnd={() => setIsEditing(false)}
            onBack={() => {
              setErrorMessage('')
              setStep('initial')
            }}
            onVerify={handleVerifyImei}
            onDiagnoseNow={handleDiagnoseNow}
            onScan={setScanTarget}
          />
        )}
      </div>

      {scanTarget && (
        <ScannerOverlay
          scanTarget={scanTarget}
          onClose={() => setScanTarget(null)}
          onImeiScan={handleImeiScan}
        />
      )}
    </DiagnosisLayout>
  )
}

export default DiagnosisEntry
