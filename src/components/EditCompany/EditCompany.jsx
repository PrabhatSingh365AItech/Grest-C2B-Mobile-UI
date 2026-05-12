import React, { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import axios from 'axios'
import { IoClose } from 'react-icons/io5'

const LoadingSpinner = ({ isLoading }) => {
  if (!isLoading) {
    return null
  }

  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <BeatLoader color='var(--primary-color)' loading={isLoading} size={15} />
    </div>
  )
}

const FormHeader = ({ onClose }) => (
  <div className='relative mb-6 flex flex-col gap-2 border-b-2 mr-10 pb-2 ml-10'>
    <IoClose
      size={35}
      className='absolute right-0 text-primary transition ease hover:rotate-[360deg] duration-500'
      onClick={onClose}
    />
    <p className='text-4xl font-bold'>Update Company Listing</p>
    <p className='text-lg'>All fields marked with * are required</p>
  </div>
)

const FormField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  readOnly = false,
  type = 'text',
}) => (
  <div className='flex flex-col w-[70%] gap-2'>
    <span className='font-medium text-xl'>
      {label}
      {required && '*'}
    </span>
    <input
      className='border-2 px-2 py-2 rounded-lg outline-none'
      type={type}
      name={name}
      value={value}
      required={required}
      readOnly={readOnly}
      onChange={onChange}
    />
  </div>
)

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className='flex flex-col w-[70%] gap-2'>
    <span className='font-medium text-xl'>{label}</span>
    <select
      className='border-2 px-2 py-2 rounded-lg outline-none bg-white'
      name={name}
      value={value}
      onChange={onChange}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
)

const EditCompany = ({ companyData, setEditBoxOpen, setEditSuccess }) => {
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [formValues, setFormValues] = useState(companyData)

  const closeHandler = () => {
    setEditBoxOpen(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let newValue = type === 'checkbox' ? checked : value
    console.log('name', e.target.name)
    if (type === 'file') {
      setFormValues({
        ...formValues,
        [name]: files,
      })
    } else {
      // Convert string 'true'/'false' to boolean for showPrice and maskInfo
      if (name === 'showPrice' || name === 'maskInfo') {
        newValue = value === 'true'
      }
      setFormValues({
        ...formValues,
        [name]: newValue,
      })
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsTableLoading(true)
    const token = sessionStorage.getItem('authToken')
    const formData = new FormData()
    formData.append('name', formValues.name)
    formData.append('contactNumber', formValues.contactNumber)
    formData.append('address', formValues.address)
    formData.append('gstNumber', formValues.gstNumber)
    formData.append('panNumber', formValues.panNumber)
    formData.append('remarks', formValues.remarks)
    formData.append('showPrice', formValues.showPrice)
    formData.append('maskInfo', formValues.maskInfo)
    formData.append('id', formValues._id)
    if (formValues.documents && formValues.documents.length > 0) {
      for (let i = 0; i < formValues.documents.length; i++) {
        formData.append('documents', formValues.documents[i])
      }
    }
    axios
      .put(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/edit`,
        formData,
        { headers: { Authorization: token } },
      )
      .then((res) => {
        setIsTableLoading(false)
        setEditSuccess(true)
      })
      .catch((err) => {
        setIsTableLoading(false)
      })
  }

  const booleanOptions = [
    { value: 'true', label: 'True' },
    { value: 'false', label: 'False' },
  ]

  return (
    <div>
      <LoadingSpinner isLoading={isTableLoading} />
      <div
        style={{
          boxShadow:
            'rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px',
        }}
        className='items-center bg-white max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col'
      >
        <div className='flex flex-col  w-[900px]'>
          <FormHeader onClose={closeHandler} />
          <form onSubmit={handleSubmit} className='ml-10 flex flex-col gap-4'>
            <FormField
              label='Name'
              name='name'
              value={formValues.name}
              onChange={handleChange}
              required={true}
            />
            <FormField
              label='Company Code'
              name='companyCode'
              value={formValues.companyCode}
              onChange={handleChange}
              required={true}
              readOnly={true}
            />
            <FormField
              label='Address'
              name='address'
              value={formValues.address}
              onChange={handleChange}
            />
            <FormField
              label='Contact Number'
              name='contactNumber'
              value={formValues.contactNumber}
              onChange={handleChange}
            />
            <FormField
              label='GST Number'
              name='gstNumber'
              value={formValues.gstNumber}
              onChange={handleChange}
            />
            <FormField
              label='PAN Number'
              name='panNumber'
              value={formValues.panNumber}
              onChange={handleChange}
            />
            <FormField
              label='Remarks'
              name='remarks'
              value={formValues.remarks}
              onChange={handleChange}
            />
            <SelectField
              label='Show Price'
              name='showPrice'
              value={formValues.showPrice?.toString() || 'false'}
              onChange={handleChange}
              options={booleanOptions}
            />
            <SelectField
              label='Mask Info'
              name='maskInfo'
              value={formValues.maskInfo?.toString() || 'false'}
              onChange={handleChange}
              options={booleanOptions}
            />
            <div className='flex flex-col w-[70%] gap-2'>
              <span className='font-medium text-xl'>Attach New Documents</span>
              <input
                className=' py-2 rounded-lg w-[250px] outline-none'
                type='file'
                multiple
              />
            </div>
            <div className='mt-8'>
              <button
                type='submit'
                className='font-medium text-sm text-white p-3 rounded bg-primary'
              >
                Update Details
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default EditCompany
