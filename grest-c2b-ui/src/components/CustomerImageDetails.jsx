import React from 'react'
import { IoCloseOutline } from 'react-icons/io5'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

const ImageContainer = ({ title, imgSrc, altText, addToZip }) => {
  return (
    <div className='flex flex-col items-center'>
      <p className='text-center font-semibold'>{title}</p>
      <img
        className='w-[200px] h-[150px] shadow-lg'
        src={imgSrc}
        alt={altText}
      />
    </div>
  )
}

const CustomerImageDetails = ({ imageData, closeModal }) => {
  console.log('imageData:', imageData)
  const { front, back, down, left, right, up } = {
    ...imageData.documentId?.phonePhotos,
  }
  const addToZip = (blob, filename) => {
    zip.file(filename, blob)
  }
  const downloadAllImages = async () => {
    const zip = new JSZip()
    const imagesToDownload = [
      { src: imageData?.documentId?.adhar?.front, alt: 'Adhaar Front' },
      { src: imageData?.documentId?.adhar?.back, alt: 'Adhaar Back' },
      { src: imageData?.documentId?.phoneBill, alt: 'Phone Bill' },
      { src: imageData?.documentId?.phonePhotos?.front, alt: 'Phone Front' },
      { src: imageData?.documentId?.phonePhotos?.back, alt: 'Phone Back' },
      { src: imageData?.documentId?.phonePhotos?.down, alt: 'Phone Down' },
      { src: imageData?.documentId?.phonePhotos?.left, alt: 'Phone Left' },
      { src: imageData?.documentId?.phonePhotos?.right, alt: 'Phone Right' },
      { src: imageData?.documentId?.phonePhotos?.up, alt: 'Phone Up' },
    ]
    for (let index = 0; index < imagesToDownload.length; index++) {
      const image = imagesToDownload[index]
      try {
        const res = await fetch(image.src)
        const blob = await res.blob()
        zip.file(`${image.alt}_${index}.png`, blob)
      } catch (error) {
        console.error(`Error downloading image ${index}:`, error)
      }
    }
    try {
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'all_images.zip')
    } catch (error) {
      console.error('Error creating zip file:', error)
    }
  }
  return (
    <div className='fixed top-0 left-0 px-2 w-full h-full flex items-center justify-center z-50 bg-black   bg-opacity-50'>
      <div className='p-4 rounded-lg bg-[#F5F4F9] shadow-md w-full md:max-w-lg  overflow-y-auto max-h-96 md:max-h-[90%]  relative'>
        <IoCloseOutline
          onClick={closeModal}
          className='cursor-pointer sticky top-0 left-[700px] text-gray-500 hover:text-gray-700'
          size={24}
        />
        <h2 className='text-2xl font-semibold mb-4'>Details</h2>
        <div className='flex flex-wrap gap-2 justify-center'>
          <div className='flex flex-wrap items-center justify-center gap-4'>
            <ImageContainer
              title='Adhaar Front Side'
              imgSrc={imageData?.documentId?.adhar?.front}
              altText='Adhaar Front'
              addToZip={addToZip}
            />
            <ImageContainer
              title='Adhaar Back Side'
              imgSrc={imageData?.documentId?.adhar?.back}
              altText='Adhaar Back'
              addToZip={addToZip}
            />
            <ImageContainer
              title='Phone Bill'
              imgSrc={imageData?.documentId?.phoneBill}
              altText='Phone Bill}'
              addToZip={addToZip}
            />
            <ImageContainer
              title='CEIR Photo'
              imgSrc={
                imageData?.documentId?.ceir
                  ? `${imageData.documentId.ceir}?t=${Date.now()}`
                  : imageData?.documentId?.ceir
              }
              altText='Customer Photo'
              addToZip={addToZip}
            />
            <ImageContainer
              title='Phone Front Side'
              imgSrc={front}
              altText='Phone Front'
              addToZip={addToZip}
            />
            <ImageContainer
              title='Phone Back Side'
              imgSrc={back}
              altText='Phone Back'
              addToZip={addToZip}
            />
            <ImageContainer
              title='Phone Left Side'
              imgSrc={left}
              altText='Phone Left'
              addToZip={addToZip}
            />
            <ImageContainer
              title='Phone Right Side'
              imgSrc={right}
              altText='Phone Right'
              addToZip={addToZip}
            />
            <ImageContainer
              title='Phone Top Side'
              imgSrc={up}
              altText='Phone Top'
              addToZip={addToZip}
            />
            <ImageContainer
              title='Phone Bottom Side'
              imgSrc={down}
              altText='Phone Bottom'
              addToZip={addToZip}
            />
            <ImageContainer
              title='Customer Photo'
              imgSrc={
                imageData?.documentId?.customerPhoto
                  ? `${imageData.documentId.customerPhoto}?t=${Date.now()}`
                  : imageData?.documentId?.customerPhoto
              }
              altText='Customer Photo'
              addToZip={addToZip}
            />
          </div>
        </div>
        <button
          onClick={closeModal}
          className='mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-tertiary focus:outline-none'
        >
          Close
        </button>
        <button
          onClick={downloadAllImages}
          className='ml-4 mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-tertiary focus:outline-none'
        >
          Download Images
        </button>
      </div>
    </div>
  )
}

export default CustomerImageDetails
