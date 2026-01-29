import React from 'react'
import ImeiField from './ImeiField'
import AadharNumberField from './AadharNumberField'
import AdharField from './AdharField'
import PhoneBill from './PhoneBill'
import CeirField from './CeirField'
import PhonePhotos1 from './PhonePhotos1'
import DigitalSignatureField from './DigitalSignatureField'
import CustomerPhotoField from './CustomerPhotoField'

const PriceFormFields = ({
  formState,
  uploadStatus,
  handleFileChange,
  handleCameraButtonClick,
  uploadIndividualFile,
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
    signatureFile, // new signature state
    setSignatureFile, // <-- new signature state set function
    customerPhoto,
    setCustomerPhoto,
    ceirImage, // new CEIR image state
    setCeirImage, // <-- new CEIR image state set function
    aadharNumber,
    setAadharNumber,
    imeinumber,
    setImeiNumber,
    isBillRequired,
    isAadharVerified,
    setIsAadharVerified,
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

  return (
    <div className='flex flex-col'>
      <ImeiField
        setImeiNumber={setImeiNumber}
        imeinumber={imeinumber}
        prod={prod}
      />
      <AadharNumberField
        setAadharNumber={setAadharNumber}
        aadharNumber={aadharNumber}
        isVerified={isAadharVerified}
        setIsVerified={setIsAadharVerified}
        prod={prod}
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
        />
        <CeirField
          handleChange={handleFileChange}
          setCeirImage={setCeirImage}
          handleCameraButtonClick={handleCameraButtonClick}
          ceirImageRef={ceirImageRef}
          ceirImage={ceirImage}
          uploadStatus={uploadStatus}
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
      />
      {/* Added New Signature Filed */}
      <DigitalSignatureField
        signatureFile={signatureFile}
        setSignatureFile={setSignatureFile}
        uploadStatus={uploadStatus}
        uploadIndividualFile={uploadIndividualFile}
        imeinumber={imeinumber}
        prod={prod}
      />
      {/* 7. Customer Photo Field */}
      <CustomerPhotoField
        handleChange={handleFileChange}
        setCustomerPhoto={setCustomerPhoto}
        handleCameraButtonClick={handleCameraButtonClick}
        customerPhotoRef={customerPhotoRef}
        customerPhoto={customerPhoto}
        uploadStatus={uploadStatus}
        prod={prod}
      />
    </div>
  )
}

export default PriceFormFields
