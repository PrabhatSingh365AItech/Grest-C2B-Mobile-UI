import React from 'react'
const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg' // Use your actual buyback logo
const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO

// Helper functions
const maskPhoneNumber = (phNumber, shouldMask) => {
  if (!shouldMask) {
    return phNumber
  }

  const visibleLength = Math.ceil(phNumber?.length * 0.25)
  const maskedSection = phNumber?.slice(0, phNumber.length - visibleLength)
  const visibleSection = phNumber?.slice(phNumber?.length - visibleLength)
  return `${maskedSection.replace(/./g, 'x')}${visibleSection}`
}

const maskEmail = (email, shouldMask) => {
  if (!shouldMask) {
    return email
  }
  if (!email) {
    return ''
  }

  const [namee, domain] = email.split('@')
  const visibleLength = Math.ceil(namee?.length * 0.25)
  const maskedName = namee?.slice(0, namee?.length - visibleLength)
  const visibleName = namee?.slice(namee?.length - visibleLength)
  return `${maskedName.replace(/./g, 'x')}${visibleName}@${domain}`
}

const formatItemSpecifications = (RAM, storage) => {
  if (RAM && storage) {
    return ` (${RAM}/${storage})`
  }
  if (RAM) {
    return ` (${RAM}/)`
  }
  if (storage) {
    return ` (/${storage})`
  }
  return ''
}

// Sub-components
const CompanyHeader = ({ COMPANY_EMAIL }) => (
  <>
    <div className='flex items-center justify-center bg-white p-[1vh] mx-[2vh] my-[1vh]'>
      <img src={GREST_LOGO} alt='App logo' className='w-80 h-24' />
    </div>
    <div className='flex flex-col items-center justify-between mb-2'>
      <p className='text-sm text-[#1b0d6c]'>
        {import.meta.env.VITE_COMPANY_NAME} ,
        <span className='text-primary'> GSTIN/UIN:</span>
        {import.meta.env.VITE_COMPANY_GSTIN}
      </p>
      <p className='text-sm text-[#1b0d6c]'>
        <span className='text-primary'> Address:</span>{' '}
        {import.meta.env.VITE_COMPANY_ADDRESS}
      </p>
      <p className='text-sm text-[#1b0d6c]'>
        <span className='text-primary'> Contact:</span>{' '}
        {import.meta.env.VITE_COMPANY_CONTACT} ,
        <span className='text-primary'> E-mail:</span> {COMPANY_EMAIL}
      </p>
    </div>
    <div className='text-center'>
      <p className='font-bold text-xl'>PURCHASE RECEIPT</p>
    </div>
  </>
)

const TransactionInfo = ({
  uniqueCode,
  formattedDate,
  name,
  phoneNumber,
  emailId,
  aadharNumber,
  maskInfo,
}) => (
  <div className='flex items-center mt-4 justify-between mx-auto'>
    <div className='w-[30%]'>
      <p>
        <span className='font-bold'> Transaction ID:</span> {uniqueCode}
      </p>
      <p>
        <span className='font-bold'> Date:</span> {formattedDate}
      </p>
    </div>
    <div className=' p-4 border-2 border-black w-[70%]'>
      <p>
        <span className='font-bold'> Purchased From: {name}</span>
      </p>
      <p></p>
      <span> Contact: {maskPhoneNumber(phoneNumber, maskInfo)}</span>
      <p>
        <span> Mail: {maskEmail(emailId, maskInfo)}</span>
      </p>
      <div className='flex flex-wrap items-center gap-1'>
        <span> Aadhar No.: {aadharNumber}</span>
        <span className='flex items-center text-xs text-green-700 font-bold'>
          ( Verified by aadhar OTP )
        </span>
      </div>
    </div>
  </div>
)

const ItemDetails = ({ phoneName, RAM, storage, price, imeiNumber, type }) => (
  <>
    <div className='flex gap-8 flex-row justify-start'>
      <div className='flex flex-col items-start'>
        <p className='font-bold'>S.No.</p>
        <p>1</p>
      </div>
      <div>
        <p className='font-bold flex flex-col items-start'>ITEM</p>
        <p>
          {phoneName}
          {formatItemSpecifications(RAM, storage)}
        </p>
      </div>
      <div>
        <p className='font-bold flex flex-col items-start'>PRICE</p>
        <p>{`₹ ${Math.floor(price)}/-`}</p>
      </div>
    </div>
    <div className='flex gap-8 flex-row justify-start'>
      <div className='flex flex-col items-start'>
        <p className='mt-4'>IMEI No.:</p>
        <p className='mt-4'>Serial Number(if Laptop):</p>
      </div>
      <div className='flex flex-col items-start'>
        <p className='mt-4'>{type ? imeiNumber : ''}</p>
        <p className='mt-4'>{type === 'Laptop' ? imeiNumber : ''}</p>
      </div>
    </div>
  </>
)

const StorePartnerSection = ({ storeName, address }) => (
  <div className='flex flex-col items-center border-b-2 border-dashed border-black py-4 '>
    <p className='text-xl font-bold mt-4 mb-2'>Via Retail Store Partner:</p>
    <p>{storeName}</p>
    <p className='uppercase text-center'>{address}</p>
    <p className='text-sm'>
      This is a Computer Generated Purchase Receipt and does not require
      signature or stamp
    </p>
  </div>
)

const IndemnityBond = ({
  name,
  storeName,
  formattedDate,
  WEBSITE_SHORT_NAME,
  signatureUrl,
}) => (
  <>
    <div className='flex flex-col items-center'>
      <p className='text-xl font-bold my-4'>IDEMNITY BOND</p>
      <p className='text-center'>
        This bond of idemnity is made and executed by :{' '}
        <span className='font-bold underline'>{name}</span> Herein after
        referred to as "Seller" who has come in Retail store of{' '}
        <span className='font-bold underline'>{storeName}</span> to sell his/her
        old Gadget, to the {WEBSITE_SHORT_NAME} Network herein after referred to
        as "Purchaser" which expression shall mean and include its
        representative, executors, nominee, partners, affiliates and assigns on
        day of <span className='font-bold'>{formattedDate}</span>
      </p>
    </div>
    <div>
      <p className='mt-4'>
        <span> Scheme Title: Buyback</span>
      </p>
      <div className='w-full text-right mt-4'>
        <p className='font-bold'>SIGNATURES</p>
        {signatureUrl && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '10px',
            }}
          >
            <img
              src={signatureUrl}
              alt='Seller Signature'
              style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
              crossOrigin='anonymous'
            />
          </div>
        )}
        <p className='mt-2'>{name}</p>
        <p className='font-bold mt-2'>Seller Name and Sign</p>
      </div>
    </div>
  </>
)

const TermsAndConditions = ({ signatureUrl, name }) => (
  <div className='page-break'>
    <div className='terms-conditions mt-32'>
      <div className='text-center mt-2'>
        <p className='text-xl font-bold my-4 mx-auto'>TERMS & CONDITIONS</p>
      </div>
      <div className='w-full'>
        <div className='pl-5 text-left leading-normal'>
          <div className='mb-2'>
            1. The Customer/Seller confirms that they are the rightful owner of
            the Gadget/Device and assume full responsibility for any liabilities
            related to its ownership.
          </div>
          <div className='mb-2'>
            2. The Customer/Seller affirms that all personal data has been
            completely removed from the device, and the Company shall not be
            held responsible for any data-related issues.
          </div>
          <div className='mb-2'>
            3. The Customer/Seller agrees to indemnify and hold the Company
            harmless against any third-party claims arising from the ownership,
            data, condition of the device, or any criminal matters related to
            the device.
          </div>
          <div className='mb-2'>
            4. Payment will be processed as per the agreed terms. Any
            discrepancies must be reported within 2 hours of the transaction,
            Return and refund requests, if applicable, must comply with the
            Company's return policy.
          </div>
          <div className='mb-2'>
            5. Any disputes or disagreements between the Customer/Seller and
            Purchaser shall be exclusively resolved under the jurisdiction of
            the courts located in {import.meta.env.VITE_COURT_ADDRESS} only.
          </div>
        </div>
      </div>
      <div className='w-full text-right mt-8'>
        <p className='font-bold'>SIGNATURES</p>
        {signatureUrl && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '16px',
            }}
          >
            <img
              src={signatureUrl}
              alt='Seller Signature'
              style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
              crossOrigin='anonymous'
            />
          </div>
        )}
        <p className='mt-4'>{name}</p>
        <p className='font-bold mt-2'>(SELLER)</p>
      </div>
    </div>
  </div>
)

const PurchaseReceipt = ({
  imeiNumber,
  uniqueCode,
  phoneNumber,
  aadharNumber,
  phoneName,
  type,
  storage,
  storeName,
  RAM,
  formattedDate,
  emailId,
  name,
  region,
  address,
  price,
  signatureUrl,
  maskInfo,
}) => {
  const WEBSITE_SHORT_NAME =
    currentDomain === import.meta.env.VITE_BUYBACK_URL
      ? import.meta.env.VITE_BUYBACK_SHORT_NAME
      : import.meta.env.VITE_WEBSITE_SHORT_NAME
  const COMPANY_EMAIL = import.meta.env.VITE_COMPANY_BUYBACK_EMAIL

  return (
    <div className='p-4 px-12 bg-white border-2 text-sm'>
      <style>{`
       @media print {
  .page-break {
    break-before: page; /* More reliable for html2pdf */
    display: block;
    width: 100%;
  }
}`}</style>
      <CompanyHeader COMPANY_EMAIL={COMPANY_EMAIL} />
      <TransactionInfo
        uniqueCode={uniqueCode}
        formattedDate={formattedDate}
        name={name}
        phoneNumber={phoneNumber}
        emailId={emailId}
        aadharNumber={aadharNumber}
        storeName={storeName}
        maskInfo={maskInfo}
      />
      <ItemDetails
        phoneName={phoneName}
        RAM={RAM}
        storage={storage}
        price={price}
        imeiNumber={imeiNumber}
        type={type}
      />
      <hr className='border-black mt-10 border-1' />
      <StorePartnerSection storeName={storeName} address={address} />
      <IndemnityBond
        name={name}
        storeName={storeName}
        formattedDate={formattedDate}
        WEBSITE_SHORT_NAME={WEBSITE_SHORT_NAME}
        signatureUrl={signatureUrl}
      />
      <TermsAndConditions signatureUrl={signatureUrl} name={name} />
    </div>
  )
}

export default PurchaseReceipt
