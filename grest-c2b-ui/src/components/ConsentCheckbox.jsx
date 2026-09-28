import React, { useState } from 'react'
import PropTypes from 'prop-types'

const CONSENT_TEMPLATES = {
  aadhaar_collection: {
    title: 'Aadhaar Data Collection Consent',
    text:
      'I consent to the collection and processing of my Aadhaar number ' +
      'for identity verification purposes. I understand that my Aadhaar ' +
      'data will be encrypted and stored securely as per DPDP Act 2023 requirements.',
    learnMore:
      'Your Aadhaar number will be encrypted using AES-256-GCM encryption ' +
      'and stored with field-level security. Only authorized personnel can ' +
      'access your Aadhaar data. You can request deletion of your data at any time.',
  },

  personal_data_processing: {
    title: 'Personal Data Processing Consent',
    text:
      'I consent to the processing of my personal data (name, email, phone ' +
      'number) for the purpose of device buyback transaction processing and ' +
      'customer service. I understand my data will be handled as per DPDP Act 2023.',
    learnMore:
      'Your personal data will be used only for transaction processing and ' +
      'customer support. We will not share your data with third parties ' +
      'without your explicit consent. You have the right to access, rectify, ' +
      'and delete your data at any time.',
  },

  device_photos: {
    title: 'Device Photo Collection Consent',
    text:
      'I consent to the capture and storage of device photos for the purpose ' +
      'of device condition assessment and transaction record-keeping.',
    learnMore:
      'Device photos will be stored securely on encrypted cloud storage ' +
      '(AWS S3) with strict access controls. Photos will be retained for ' +
      'transaction record-keeping as per legal requirements.',
  },

  signature_collection: {
    title: 'Digital Signature Collection Consent',
    text:
      'I consent to the collection of my digital signature for transaction ' +
      'authorization and record-keeping purposes. I understand this ' +
      'signature will be securely stored and encrypted.',
    learnMore:
      'Your digital signature will be encrypted and stored with the same ' +
      'security level as your Aadhaar data. It will be used solely for ' +
      'transaction authorization and legal record-keeping.',
  },

  marketing_communications: {
    title: 'Marketing Communications Consent',
    text:
      'I consent to receive promotional offers, updates, and marketing ' +
      'communications via email and SMS. I understand I can withdraw this ' +
      'consent at any time.',
    learnMore:
      'We may send you updates about new offers, promotions, and services. ' +
      'You can unsubscribe at any time by clicking the unsubscribe link in ' +
      'emails or by contacting customer support.',
  },

  data_sharing: {
    title: 'Data Sharing with Partners Consent',
    text:
      'I consent to the sharing of my transaction data with authorized ' +
      'partners such as logistics providers and payment processors, ' +
      'strictly for the purpose of completing my buyback transaction.',
    learnMore:
      'Your data will only be shared with trusted partners who are ' +
      'contractually bound to maintain the same security standards. ' +
      'Data sharing is limited to what is necessary for transaction completion.',
  },
}

export function ConsentCheckbox({
  consentType,
  onConsentChange,
  required = true,
  initialValue = false,
  className = '',
}) {
  const [isChecked, setIsChecked] = useState(initialValue)
  const [showDetails, setShowDetails] = useState(false)

  const template = CONSENT_TEMPLATES[consentType]

  if (!template) {
    console.error(`Invalid consent type: ${consentType}`)
    return null
  }

  const handleChange = (e) => {
    const checked = e.target.checked
    setIsChecked(checked)

    // Call parent callback
    if (onConsentChange) {
      onConsentChange(checked)
    }

    // Log consent action (for audit trail)
    logConsentAction(checked)
  }

  const logConsentAction = (granted) => {
    const consentLog = {
      consentType,
      granted,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }
    console.log('Consent action:', consentLog)
  }

  return (
    <div className={`consent-checkbox ${className}`}>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        {/* Consent Title */}
        <div className='flex items-start mb-3'>
          <input
            type='checkbox'
            id={`consent-${consentType}`}
            checked={isChecked}
            onChange={handleChange}
            className='mt-1 mr-3 h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer'
            required={required}
          />
          <div className='flex-1'>
            <label
              htmlFor={`consent-${consentType}`}
              className='text-sm font-medium text-blue-900 cursor-pointer'
            >
              {template.title}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </label>
          </div>
        </div>

        {/* Consent Text */}
        <div className='ml-8'>
          <p className='text-sm text-blue-800 mb-2'>{template.text}</p>

          {/* Learn More Toggle */}
          <button
            type='button'
            onClick={() => setShowDetails(!showDetails)}
            className='text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none'
          >
            {showDetails ? 'Hide Details' : 'Learn More'}
          </button>

          {/* Details Panel */}
          {showDetails && (
            <div className='mt-3 p-3 bg-blue-100 rounded text-xs text-blue-900'>
              {template.learnMore}
            </div>
          )}
        </div>

        {/* DPDP Act Reference */}
        <div className='ml-8 mt-2'>
          <p className='text-xs text-blue-600'>
            As per Digital Personal Data Protection Act, 2023
          </p>
        </div>
      </div>
    </div>
  )
}

ConsentCheckbox.propTypes = {
  consentType: PropTypes.oneOf([
    'aadhaar_collection',
    'personal_data_processing',
    'device_photos',
    'signature_collection',
    'marketing_communications',
    'data_sharing',
  ]).isRequired,
  onConsentChange: PropTypes.func,
  required: PropTypes.bool,
  initialValue: PropTypes.bool,
  className: PropTypes.string,
}

export default ConsentCheckbox
