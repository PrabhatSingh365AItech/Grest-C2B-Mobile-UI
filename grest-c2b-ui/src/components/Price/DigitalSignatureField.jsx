import React, { useState, useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { getStatusIcon } from '../../utils/priceUtils.jsx'
import { FILE_KEYS } from '../../constants/priceConstants'
import { dataURLtoFile } from '../../utils/fileUtils'
import toast from 'react-hot-toast'

const validateIMEI = (imeinumber) => {
  if (!imeinumber) {
    toast.error('Please enter the IMEI number before saving the signature.')
    return false
  }
  return true
}

const DigitalSignatureField = ({
  signatureFile,
  setSignatureFile,
  uploadStatus,
  uploadIndividualFile,
  imeinumber,
  prod,
}) => {
  const [isDrawing, setIsDrawing] = useState(!signatureFile)
  const [showPlaceholder, setShowPlaceholder] = useState(true)

  const sigPadRef = useRef(null)
  const containerRef = useRef(null)
  const sigStatus = uploadStatus[FILE_KEYS.SIGNATURE]?.status
  const sectionNumber = (prod?.[0]?.phoneBillSno || 6) + 1

  useEffect(() => {
    if (!isDrawing || !sigPadRef.current || !containerRef.current) {
      return () => {}
    }

    const initCanvas = () => {
      const container = containerRef.current
      const canvas = sigPadRef.current?.getCanvas()

      if (container && canvas) {
        canvas.width = container.offsetWidth
        canvas.height = container.offsetHeight
        sigPadRef.current.clear()
      }
    }

    initCanvas()
    const timeoutId = setTimeout(initCanvas, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isDrawing, imeinumber])

  const handleClear = () => {
    sigPadRef.current?.clear()
    setShowPlaceholder(true)
  }

  const handleBegin = () => setShowPlaceholder(false)

  const handleSaveSignature = () => {
    if (!validateIMEI(imeinumber)) {
      return
    }

    if (sigPadRef.current?.isEmpty()) {
      toast.error('Please provide a signature first.')
      return
    }

    const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png')

    sessionStorage.setItem('signatureBase64', dataUrl)

    const fileName = `signature`
    const newSigFile = dataURLtoFile(dataUrl, `${fileName}.png`)

    if (newSigFile) {
      setSignatureFile(newSigFile)
      setIsDrawing(false)
      uploadIndividualFile(
        newSigFile,
        fileName,
        newSigFile.type,
        FILE_KEYS.SIGNATURE
      )
    }
  }

  const handleResign = () => {
    setSignatureFile(null)
    setIsDrawing(true)
    setShowPlaceholder(true)
  }

  const renderDrawingCanvas = () => (
    <>
      <div className='p-1 border-2 rounded-lg h-[15vh] w-full relative border-primary shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'>
        <div
          ref={containerRef}
          className='bg-gray-100 w-full h-full relative flex items-center justify-center'
          style={{ touchAction: 'none' }}
        >
          {showPlaceholder && (
            <p className='absolute text-gray-400 text-lg pointer-events-none select-none'>
              Sign Here
            </p>
          )}
          <SignatureCanvas
            ref={sigPadRef}
            penColor='black'
            onBegin={handleBegin}
            canvasProps={{
              className: 'absolute top-0 left-0 w-full h-full',
              style: { touchAction: 'none' },
            }}
          />
        </div>
      </div>
      <div className='flex justify-between w-full gap-4 mt-3'>
        <button
          type='button'
          className='px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg flex-1'
          onClick={handleClear}
        >
          Clear Signature
        </button>
        <button
          type='button'
          className='px-4 py-2 font-bold text-white rounded-lg bg-primary flex-1'
          onClick={handleSaveSignature}
        >
          Save Signature
        </button>
      </div>
    </>
  )

  const renderSignaturePreview = () => {
    return (
      <div className='flex items-center gap-3'>
        {signatureFile && (
          <img
            src={URL.createObjectURL(signatureFile)}
            alt='Signature Thumbnail'
            className='h-[80px] object-contain'
          />
        )}
        <div className='flex flex-col items-start gap-2'>
          <div className='flex items-center gap-2'>
            {getStatusIcon(sigStatus)}
            <span className='text-sm font-medium text-green-600'>
              Signature Saved
            </span>
          </div>
          <button
            type='button'
            className='px-4 py-1 text-sm font-bold text-gray-700 bg-gray-200 rounded-lg'
            onClick={handleResign}
          >
            Re-sign
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col adharcard mt-[10px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>{sectionNumber}.</p>
        <div className='flex items-center'>
          <p className='text-base font-medium three'>
            Digital Signature Required <span className='text-red-500'>*</span>
          </p>
        </div>
      </div>

      <p className='mt-2 text-sm text-gray-600 ml-[19px]'>
        Please sign to confirm your Aadhaar verification and consent.
      </p>

      <div className='flex justify-start ml-3 inputAADHAR'>
        <div className='flex flex-col w-[100vw] md:w-[40vw] mt-4'>
          {isDrawing ? renderDrawingCanvas() : renderSignaturePreview()}
        </div>
      </div>
    </div>
  )
}

export default DigitalSignatureField
