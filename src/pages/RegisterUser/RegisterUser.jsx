import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNavbar from '../../components/Admin_Navbar'
import BulkUploadModal from '../../components/BulkUploadModal'
import SideMenu from '../../components/SideMenu'
import { BeatLoader } from 'react-spinners'
import axios from 'axios'
import StatusModal from './StatusModal'
import UserForm from './UserForm'
import { useStoreData } from './useStoreData'
import { usePasswordValidation } from './usePasswordValidation'

const initForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phoneNumber: '',
  role: '',
  storeId: '',
  city: '',
  address: '',
}

const RegisterUser = () => {
  const token = sessionStorage.getItem('authToken')
  const LoggedInUser = JSON.parse(sessionStorage.getItem('profile'))
  const isSuperAdmin = LoggedInUser?.role === 'Super Admin'

  const [sideMenu, setsideMenu] = useState(false)
  const [isGrest, setIsGrest] = useState(null)
  const [formData, setFormData] = useState(initForm)
  const [modal, setModal] = useState({ open: false, success: false, msg: '' })
  const [passwordValid, setPasswordValid] = useState(false)

  const navigate = useNavigate()

  // store data hook
  const { storeData, loading } = useStoreData(isSuperAdmin, setFormData)

  // password validation hook
  const [errMsg, setErrMsg] = useState('')
  usePasswordValidation(formData.password, setPasswordValid, setErrMsg)

  useEffect(() => {
    setFormData((prev) => ({ ...prev, grestMember: isGrest === 'yes' }))
  }, [isGrest])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const submitHandler = (event) => {
    event.preventDefault()

    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/userregistry/register`,
        formData,
        { headers: { Authorization: token } }
      )
      .then(() => {
        setModal({
          open: true,
          success: true,
          msg: 'Successfully added new user',
        })
        navigate('/registeruserdetails')
      })
      .catch((error) => {
        setModal({
          open: true,
          success: false,
          msg: 'Failed to add new user, ' + error.response?.data?.msg,
        })
      })
  }

  return (
    <div className='min-h-screen pb-8 bg-[#F5F4F9]'>
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>

      <BulkUploadModal
        isOpen={modal.bulk}
        onClose={() => setModal((m) => ({ ...m, bulk: false }))}
      />

      {loading && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader color='var(--primary-color)' size={15} />
        </div>
      )}

      {modal.open && (
        <StatusModal
          success={modal.success}
          message={modal.msg}
          onClose={() => setModal({ open: false })}
        />
      )}

      <div
        style={{
          boxShadow:
            'rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px',
        }}
        className='items-center bg-white max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col'
      >
        <div className='flex flex-col w-[900px]'>
          <div className='mb-6 flex flex-col gap-2 border-b-2 pb-2 mr-10 ml-10'>
            <div className='flex items-center gap-6 justify-center flex-wrap'>
              <p className='text-4xl font-bold'>Register User</p>
              <button
                onClick={() => setModal((m) => ({ ...m, bulk: true }))}
                className='font-medium text-sm text-white px-4 py-2 rounded bg-primary'
              >
                Bulk Upload
              </button>
            </div>
            <p className='text-lg'>All fields marked with * are required</p>
          </div>

          <div className='flex flex-wrap gap-2 ml-10 mb-10'>
            <button
              onClick={() => navigate('/registeruserdetails')}
              className='font-medium text-sm text-white p-3 rounded bg-primary'
            >
              View Details
            </button>
          </div>

          <UserForm
            formData={formData}
            submitHandler={submitHandler}
            handleChange={handleChange}
            storeData={storeData}
            isSuperAdmin={isSuperAdmin}
            errMsg={errMsg}
            isValid={passwordValid}
            setIsGrest={setIsGrest}
          />
        </div>
      </div>
    </div>
  )
}

export default RegisterUser
