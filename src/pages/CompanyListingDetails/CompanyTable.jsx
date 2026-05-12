import React from 'react'
import { FaDownload, FaUpload } from 'react-icons/fa6'
import styles from './CompanyListingDetails.module.css'

const CompanyTable = ({
  tableData,
  editHandler,
  deleteConfHandler,
  openViewDocsModal,
  openUploadPriceModal,
  setCurrentPage,
  currentPage,
  maxPages,
}) => {
  return (
    <React.Fragment>
      <div className='m-2 overflow-x-auto md:m-5'>
        <table className='w-full border border-primary'>
          <thead className='bg-primary text-white'>
            <tr>
              <th className='p-2 text-sm md:p-3 md:text-base'>Action</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Company Name</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Company Code</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Address</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                Contact Number
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>GST Number</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>PAN Number</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Remarks</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Documents</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Price Sheets</th>
            </tr>
          </thead>
          <tbody>
            {tableData !== undefined &&
              [...tableData]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((data, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-200' : ''}
                  >
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      <div className='flex flex-col gap-1'>
                        <button
                          className={`${styles.view_btn}`}
                          onClick={() => {
                            editHandler(data)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={`${styles.acpt_btn}`}
                          onClick={() => {
                            deleteConfHandler(data)
                          }}
                        >
                          Delete
                        </button>
                        <button
                          className='bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600 flex items-center justify-center gap-1'
                          onClick={() => {
                            openUploadPriceModal(data)
                          }}
                        >
                          <FaUpload size={12} /> Price Sheet
                        </button>
                      </div>
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.name}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.companyCode}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.address}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.contactNumber}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.gstNumber}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.panNumber}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.remarks}
                    </td>
                    <td
                      className='p-2 text-sm text-center md:p-3 md:text-base'
                      onClick={() => openViewDocsModal(data)}
                      style={{ cursor: 'pointer' }}
                    >
                      View Docs
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {data.priceSheets && data.priceSheets.length > 0 ? (
                        <div className='flex flex-col gap-1'>
                          {data.priceSheets.map((sheet, idx) => (
                            <a
                              key={idx}
                              href={sheet.fileUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:text-blue-800 text-sm underline flex items-center justify-center gap-1'
                            >
                              <FaDownload size={10} />
                              {sheet.fileName} (
                              {new Date(sheet.uploadedAt).toLocaleDateString()})
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className='text-gray-400 text-sm'>No files</span>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className='flex justify-center mt-0 mb-4'>
        <button
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer'
          }`}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <button
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === maxPages - 1
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer'
          }`}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === maxPages - 1}
        >
          Next
        </button>
      </div>
    </React.Fragment>
  )
}

export default CompanyTable
