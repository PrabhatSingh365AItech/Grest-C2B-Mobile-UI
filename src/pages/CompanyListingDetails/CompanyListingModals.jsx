import React, { useState } from 'react'
import axios from 'axios'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import PriceSheetUploadModal from '../../components/PriceSheetUploadModal'
import EditCompany from '../../components/EditCompany/EditCompany'
import { BeatLoader } from 'react-spinners'
import toast from 'react-hot-toast'
import { AiOutlineFile } from 'react-icons/ai'
import styles from './CompanyListingDetails.module.css'
import StatusModal from './StatusModal'

const getTextColorClass = (isSuccess) =>
  isSuccess ? 'text-green-500' : 'text-primary'

const CompanyListingModals = ({
  editBoxOpen,
  setEditBoxOpen,
  companyEditData,
  setEditSuccess,
  isTableLoading,
  setIsTableLoading,
  sucBox,
  errMsg,
  failBox,
  setSucBox,
  setFailBox,
  confBox,
  selectedCompany,
  setConfBox,
  viewDocsModalOpen,
  companyDocsData,
  setViewDocsModalOpen,
  searchValue,
  fetchTableData,
  getDataBySearch,
  setErrMsg,
  uploadPriceModalOpen,
  setUploadPriceModalOpen,
  selectedCompanyForPricing,
  categories,
}) => {
  console.log(selectedCompany, 'arijit')
  const token = sessionStorage.getItem('authToken')
  const [sideMenu, setsideMenu] = useState(false)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handlePriceSheetUpload = (file, category) => {
    setIsFileUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('companyId', selectedCompanyForPricing._id)
    formData.append('category', category)

    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/grades/company/upload`,
        formData,
        {
          headers: { Authorization: token },
          onUploadProgress: (e) =>
            setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        },
      )
      .then(() => {
        toast.success(`Price sheet uploaded successfully`)
        setUploadPriceModalOpen(false)
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || 'Upload failed'),
      )
      .finally(() => {
        setIsFileUploading(false)
        setUploadProgress(0)
        fetchTableData()
      })
  }

  const deleteHandler = (companyId) => {
    setIsTableLoading(true)
    setConfBox(false)
    axios
      .delete(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/deleteById?id=${companyId}`,
        { headers: { Authorization: token } },
      )
      .then((res) => {
        searchValue ? getDataBySearch() : fetchTableData()
        setErrMsg(`Successfully deleted company`)
        setSucBox(true)
      })
      .catch(() => {
        setErrMsg('Failed to delete company')
        setFailBox(true)
      })
      .finally(() => setIsTableLoading(false))
  }

  const handleCloseUploadModal = () => {
    setUploadPriceModalOpen(false)
  }

  return (
    <React.Fragment>
      {editBoxOpen && (
        <div className={`${styles.edit_page}`}>
          <EditCompany
            companyData={companyEditData}
            setEditBoxOpen={setEditBoxOpen}
            setEditSuccess={setEditSuccess}
          />
        </div>
      )}
      {isTableLoading && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isTableLoading}
            size={15}
          />
        </div>
      )}
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <StatusModal
        open={sucBox}
        type='success'
        title='Success!'
        message={errMsg}
        onClose={() => setSucBox(false)}
      />

      <StatusModal
        open={failBox}
        type='error'
        title='Error!'
        message={errMsg}
        onClose={() => setFailBox(false)}
      />

      {confBox && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${getTextColorClass(sucBox)}`}>
            <h6 className={`${getTextColorClass(sucBox)}`}>Confirmation!</h6>
            <p className='text-slate-500'>
              {`Do you want to delete company ${selectedCompany.name} ?`}
            </p>
            <div className='flex flex-row gap-2'>
              <button
                onClick={() => deleteHandler(selectedCompany?._id)}
                className={'bg-primary text-white'}
              >
                Okay
              </button>
              <button
                onClick={() => {
                  setConfBox(false)
                  setIsTableLoading(false)
                }}
                className='bg-white text-primary'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {viewDocsModalOpen && (
        <div className='fixed mx-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-50'>
          <div className='absolute top-0 left-0 w-full h-full bg-gray-800 opacity-50'></div>
          <div className='bg-white border border-gray-300 p-6 w-96 max-w-[90%] mx-auto rounded-md z-10'>
            <p className='mb-4 text-lg font-semibold'>Documents</p>
            <div className=' flex gap-4 m-2'>
              {companyDocsData?.attachedDocuments?.map((document, index) => (
                <div key={index} className=''>
                  <a
                    href={document.fileUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <p className='text-xs font-medium'> Document {index + 1}</p>
                    <div className='flex flex-col items-center'>
                      <AiOutlineFile size={60} />
                    </div>
                  </a>
                </div>
              ))}
            </div>
            <button
              onClick={() => setViewDocsModalOpen(false)}
              className='border border-primary text-primary px-4 py-2 rounded'
            >
              Close
            </button>
          </div>
        </div>
      )}
      <PriceSheetUploadModal
        isOpen={uploadPriceModalOpen}
        onClose={handleCloseUploadModal}
        onSubmit={handlePriceSheetUpload}
        categories={categories}
        title='Company Price Sheet Upload'
        description={`Upload price sheet for ${selectedCompanyForPricing?.name}. Download the sample template to ensure your data is in the correct format.`}
        isUploading={isFileUploading}
        uploadProgress={uploadProgress}
      />
    </React.Fragment>
  )
}

export default CompanyListingModals
