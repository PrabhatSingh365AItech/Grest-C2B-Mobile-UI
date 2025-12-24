import React, { useState } from 'react'
import { FaFilePdf } from 'react-icons/fa'
import ReactDOMServer from 'react-dom/server'
import html2pdf from 'html2pdf.js'
import CustomerImageDetails from '../CustomerImageDetails'
import CustomerFormDetails from '../CustomerFormDetails'
import PurchaseReceipt from '../PurchaseReceipt'
import { fetchSignatureAsBase64 } from '../../utils/fetchSignatureAsBase64'

const getUserName = (val) => {
  if (val?.userId?.firstName) {
    return `${val?.userId?.firstName} ${
      val.userId.lastName ? val?.userId?.lastName : ''
    }`
  } else {
    return val?.userId?.name
  }
}

const getStorage = (val) => {
  if (val?.modelId?.type === 'CTG1') {
    return `${
      val?.storage && val?.ram ? `${val?.ram}/${val?.storage}` : val?.storage
    }`
  } else {
    return '-'
  }
}

const generatePDF = (printElement) => {
  html2pdf()
    .set({
      margin: 10,
      filename: 'purchase_receipt.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    })
    .from(printElement)
    .save()
}

const TableHeader = () => (
  <thead className='bg-primary text-white'>
    <tr className='align-top'>
      <th className='p-2 text-sm md:p-3 md:text-base'>Date</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Username</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Category</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Product Name</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Variant</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Price</th>
      <th className='p-2 text-sm md:p-3 md:text-base min-w-[160px]'>
        Final Price Offered to Customer
      </th>
      <th className='p-2 text-sm md:p-3 md:text-base'>IMEI No.</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Unique Id</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Customer Name</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Customer Mobile</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Customer Email</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>More Details</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Images</th>
      <th className='p-2 text-sm md:p-3 md:text-base'>Reciept</th>
    </tr>
  </thead>
)

const TableRow = ({ val, index, onDetailsClick, onImageClick, onPDFClick }) => (
  <tr className={index % 2 === 0 ? 'bg-gray-200' : ''}>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {new Date(val?.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {getUserName(val)}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {val?.categoryInfo?.categoryName}
    </td>
    <td className='p-2 min-w-[200px] text-sm text-center md:p-3 md:text-base'>
      {val?.modelId?.name}
    </td>
    <td className='p-2 min-w-[150px] text-sm text-center md:p-3 md:text-base'>
      {getStorage(val)}
    </td>
    <td className='p-2 min-w-[150px] text-sm text-center md:p-3 md:text-base'>
      {val?.actualPrice}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {val?.price}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {val?.documentId?.IMEI}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {val?.uniqueCode}
    </td>
    <td className='p-2 text-sm min-w-[150px] text-center md:p-3 md:text-base'>
      {val?.name}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base min-w-[160px]'>
      {val?.phoneNumber}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {val?.emailId}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      <p onClick={() => onDetailsClick(val)} className='cursor-pointer '>
        Details
      </p>
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      <p onClick={() => onImageClick(index)} className='cursor-pointer'>
        Click to open
      </p>
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      <FaFilePdf
        size={32}
        color='red'
        onClick={() => onPDFClick(index)}
        className='cursor-pointer'
      />
    </td>
  </tr>
)

const LeadsCompletedTable = ({ data }) => {
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [QNAData, setQNAData] = useState([])
  const [dataIndex, setDataIndex] = useState(null)

  const handleDetailsClick = (value) => {
    setQNAData(value.QNA)
    setShowModal(true)
  }

  const handleImageModal = (index) => {
    setDataIndex(index)
    setShowImageModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setShowImageModal(false)
  }

  const handleGeneratePdf = async (index) => {
    console.log('store is', data[index]?.store?.storeName)
    const dateString = data[index]?.updatedAt
    const formattedDate = new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    const signatureUrl = data[index]?.documentId?.signature
    const signatureBase64 = signatureUrl
      ? await fetchSignatureAsBase64(signatureUrl)
      : null

    const printElement = ReactDOMServer.renderToString(
      <PurchaseReceipt
        phoneNumber={data[index]?.phoneNumber}
        aadharNumber={data[index]?.aadharNumber}
        uniqueCode={data[index]?.uniqueCode}
        emailId={data[index]?.emailId}
        name={data[index]?.name}
        price={data[index]?.price}
        imeiNumber={data[index]?.documentId?.IMEI}
        phoneName={data[index]?.modelId?.name}
        type={data[index]?.modelId?.type}
        storeName={data[index]?.store?.storeName}
        region={data[index]?.store?.region}
        address={data[index]?.store?.address}
        storage={data[index]?.storage}
        RAM={data[index]?.ram}
        formattedDate={formattedDate}
        signatureUrl={signatureBase64 || signatureUrl}
      />
    )

    generatePDF(printElement)
  }

  return (
    <div className='m-2 overflow-x-auto md:m-5'>
      <table className='w-full border border-primary'>
        <TableHeader />
        <tbody>
          {data.map((val, index) => (
            <TableRow
              key={index}
              val={val}
              index={index}
              onDetailsClick={handleDetailsClick}
              onImageClick={handleImageModal}
              onPDFClick={handleGeneratePdf}
            />
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className='z-50 fixed flex items-center inset-0 justify-center '>
          <div className='rounded w-96 p-4 bg-white relative mx-auto shadow-lg modal-container '>
            <div className='modal-content '>
              <CustomerFormDetails
                QNAData={QNAData}
                closeModal={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
      {showImageModal && (
        <div className='inset-0 z-50 fixed flex justify-center items-center'>
          <div className='bg-white rounded p-4 w-96 mx-auto relative shadow-lg modal-container '>
            <div className='modal-content '>
              <CustomerImageDetails
                imageData={data[dataIndex]}
                closeModal={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadsCompletedTable
