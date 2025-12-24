import React, { useState } from 'react'
import { IoEye, IoEyeOffSharp } from 'react-icons/io5'

const role = import.meta.env.VITE_REACT_APP_ROLES
  ? import.meta.env.VITE_REACT_APP_ROLES.split(',').map((item) => item.trim())
  : defaultRoles

const UserForm = ({
  formData,
  submitHandler,
  handleChange,
  storeData,
  isSuperAdmin,
  errMsg,
  isValid,
  setPasswordFocus,
}) => {
  const [showUserPassword, setShowUserPassword] = useState(false)

  return (
    <form
      className='ml-10 flex flex-col gap-4'
      onSubmit={submitHandler}
      autoComplete='off'
    >
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>First name*</span>
        <input
          name='firstName'
          id='firstName'
          placeholder='Enter first name'
          value={formData.firstName}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg outline-none'
          type='text'
          required
        />
      </label>
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Last name</span>
        <input
          name='lastName'
          id='lastName'
          placeholder='Enter last name'
          value={formData.lastName}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg outline-none'
          type='text'
        />
      </label>
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Email*</span>
        <input
          name='email'
          id='email'
          minLength={6}
          placeholder='Enter your email address'
          value={formData.email || ''}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg  outline-none '
          type='email'
          autoComplete='off'
          required
        />
      </label>
      <div>
        <label className='font-medium text-xl' htmlFor='password'>
          Password*
        </label>
        <div className='flex flex-col relative input w-[70%] gap-2'>
          <input
            name='password'
            id='password'
            minLength={8}
            maxLength={20}
            placeholder='Enter new password (min. 8 characters)'
            value={formData.password || ''}
            onChange={handleChange}
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
            className='border-2 px-2 py-2 rounded-lg  outline-none '
            type={showUserPassword ? 'text' : 'password'}
            autoComplete='off'
            required
          />
          <span
            onClick={() => setShowUserPassword(!showUserPassword)}
            className='absolute transform -translate-y-1/2 cursor-pointer right-2 top-6'
          >
            {!showUserPassword ? <IoEyeOffSharp /> : <IoEye />}
          </span>
        </div>
        {formData.password && (
          <p
            className={`${
              isValid ? 'text-primary' : 'text-red-600'
            } text-sm mt-1`}
          >
            {errMsg}
          </p>
        )}
      </div>
      <label className='flex flex-col w-[70%] gap-2 '>
        <span className='font-medium text-xl'>Mobile Number*</span>
        <input
          name='phoneNumber'
          id='phoneNumber'
          minLength={10}
          placeholder='Enter 10-digit mobile number'
          value={formData.phoneNumber}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg  outline-none'
          maxLength={10}
          type='tel'
          required
        />
      </label>
      {isSuperAdmin && (
        <label className='flex flex-col w-[70%] gap-2'>
          <span className='font-medium text-xl'>Store Name*</span>
          <select
            name='storeId'
            id='storeId'
            value={formData.storeId}
            className='outline-none text-base border-2 p-2 rounded-lg'
            onChange={handleChange}
            required
          >
            <option value=''> None </option>
            {storeData.map((item) => (
              <option key={item._id} value={item._id}>
                {`${item.storeName}, ${item.region}`}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Role*</span>
        <select
          id='role'
          name='role'
          value={formData.role}
          className='outline-none text-base border-2 px-2 py-2 rounded-lg'
          onChange={handleChange}
          required
        >
          <option value=''>None</option>
          {role.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>City</span>
        <input
          name='city'
          id='city'
          placeholder='Enter your city name'
          value={formData.city}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg  outline-none'
          type='text'
        />
      </label>
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Adddress</span>
        <input
          name='address'
          id='address'
          placeholder='Enter your full address'
          value={formData.address}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg  outline-none'
          type='text'
        />
      </label>
      <div className='mt-8'>
        <button
          type='submit'
          className='font-medium text-sm text-white p-3 rounded bg-primary'
        >
          Submit Form
        </button>
      </div>
    </form>
  )
}

export default UserForm
