import React from 'react'
import ImeiField from './ImeiField'
import AdharField from './AdharField'
import PhoneBill from './PhoneBill'
import CeirField from './CeirField'
import PhonePhotos1 from './PhonePhotos1'
import DigitalSignatureField from './DigitalSignatureField'
import CustomerPhotoField from './CustomerPhotoField'
import DigilockerAadhaarField from './DigilockerAadhaarField'

const PriceFormFields = ({
  formState,
  uploadStatus,
  handleFileChange,
  handleCameraButtonClick,
  uploadIndividualFile,
  imei2,
  setImei2,
  onImeiVerificationComplete,
  aadharVerificationRequired,
  isDiagnosisFlow,
  isDevelopmentMode,
}) => {
  const {
    file,
    setFile,
    idProofBack,
    setIdProofBack,
    phoneBill,
    setPhoneBill,
    phoneFront,
    setPhoneFront,
    phoneBack,
    setPhoneBack,
    phoneBottom,
    setPhoneBottom,
    phoneTop,
    setPhoneTop,
    phoneLeft,
    setPhoneLeft,
    phoneRight,
    setPhoneRight,
    signatureFile,
    setSignatureFile,
    customerPhoto,
    setCustomerPhoto,
    ceirImage,
    setCeirImage,
    aadharNumber,
    setAadharNumber,
    imeinumber,
    setImeiNumber,
    isBillRequired,
    isAadharVerified,
    setIsAadharVerified,
    aadharVerificationReason,
    setAadharVerificationReason,
    prod,
    fileInputRef,
    idproofBackRef,
    phoneBillRef,
    phoneFrontRef,
    phoneBackRef,
    phoneBottomRef,
    phoneTopRef,
    phoneLeftRef,
    phoneRightRef,
    customerPhotoRef,
    ceirImageRef,
  } = formState

  // The IMEI section is step 1; when it's hidden (diagnosis flow already
  // captured the IMEI) every later step moves up one so numbering starts at 1.
  const stepOffset = isDiagnosisFlow ? 1 : 0

  return (
    <div className='flex flex-col'>
      {!isDiagnosisFlow && (
        <ImeiField
          setImeiNumber={setImeiNumber}
          imeinumber={imeinumber}
          prod={prod}
          imei2={imei2}
          setImei2={setImei2}
          onImeiVerificationComplete={onImeiVerificationComplete}
        />
      )}
      <DigilockerAadhaarField
        setAadharNumber={setAadharNumber}
        aadharNumber={aadharNumber}
        isVerified={isAadharVerified}
        setIsVerified={setIsAadharVerified}
        aadharVerificationReason={aadharVerificationReason}
        setAadharVerificationReason={setAadharVerificationReason}
        isVerificationRequired={
        !isDevelopmentMode && aadharVerificationRequired
        }
        isDevelopmentMode={isDevelopmentMode}
        leadId={formState?.leadsubmitDATA?.id}
        stepNumber={2 - stepOffset}
      />
      <AdharField
        handleChange={handleFileChange}
        setFile={setFile}
        fileInputRef={fileInputRef}
        handleCameraButtonClick={handleCameraButtonClick}
        file={file}
        setIdProofBack={setIdProofBack}
        idProofBack={idProofBack}
        idproofBackRef={idproofBackRef}
        prod={prod}
        uploadStatus={uploadStatus}
        stepNumber={3 - stepOffset}
      />
      <div className='grid grid-cols-2 gap-3'>
        <PhoneBill
          handleChange={handleFileChange}
          setPhoneBill={setPhoneBill}
          phoneBackRef={phoneBackRef}
          handleCameraButtonClick={handleCameraButtonClick}
          phoneBillRef={phoneBillRef}
          phoneBill={phoneBill}
          isBillRequired={isBillRequired}
          prod={prod}
          uploadStatus={uploadStatus}
          stepNumber={4 - stepOffset}
        />
        <CeirField
          handleChange={handleFileChange}
          setCeirImage={setCeirImage}
          handleCameraButtonClick={handleCameraButtonClick}
          ceirImageRef={ceirImageRef}
          ceirImage={ceirImage}
          uploadStatus={uploadStatus}
          stepNumber={5 - stepOffset}
        />
      </div>
      <PhonePhotos1
        handleCameraButtonClick={handleCameraButtonClick}
        handleChange={handleFileChange}
        phoneFront={phoneFront}
        setPhoneFront={setPhoneFront}
        phoneFrontRef={phoneFrontRef}
        setPhoneBottom={setPhoneBottom}
        phoneBackRef={phoneBackRef}
        phoneBack={phoneBack}
        phoneBottom={phoneBottom}
        phoneTop={phoneTop}
        phoneBottomRef={phoneBottomRef}
        setPhoneLeft={setPhoneLeft}
        setPhoneBack={setPhoneBack}
        setPhoneTop={setPhoneTop}
        phoneLeft={phoneLeft}
        phoneRight={phoneRight}
        phoneTopRef={phoneTopRef}
        phoneRightRef={phoneRightRef}
        setPhoneRight={setPhoneRight}
        phoneLeftRef={phoneLeftRef}
        prod={prod}
        uploadStatus={uploadStatus}
        stepNumber={6 - stepOffset}
      />
      <DigitalSignatureField
        signatureFile={signatureFile}
        setSignatureFile={setSignatureFile}
        uploadStatus={uploadStatus}
        uploadIndividualFile={uploadIndividualFile}
        imeinumber={imeinumber}
        prod={prod}
      />
      <CustomerPhotoField
        handleChange={handleFileChange}
        customerPhoto={customerPhoto}
        setCustomerPhoto={setCustomerPhoto}
        uploadStatus={uploadStatus}
        uploadIndividualFile={uploadIndividualFile}
        imeinumber={imeinumber}
        prod={prod}
        fileInputRef={customerPhotoRef}
        handleCameraButtonClick={handleCameraButtonClick}
      />
    </div>
  )
}

export default PriceFormFields
