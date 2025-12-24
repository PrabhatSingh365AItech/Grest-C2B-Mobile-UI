import React from 'react'

const ERROR_BORDER_CLASS = 'border-red-500'
const DEFAULT_BORDER_CLASS = 'border-gray-300'
const INPUT_BASE_CLASS = 'border-2 px-2 py-2 rounded-lg outline-none'

const ErrorMessage = ({ message }) => {
  if (!message) {
    return null
  }
  return <p className='text-red-500 text-sm mt-1'>{message}</p>
}

const CouponForm = ({
  formData,
  submitHandler,
  handleChange,
  storeData,
  errors = {},
  formType = 'create',
}) => {
  const isCreateMode = formType === 'create'

  return (
    <form
      className=' flex flex-col gap-5'
      onSubmit={submitHandler}
      autoComplete='off'
    >
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Store Name*</span>
        <select
          name='storeId'
          value={formData.storeId}
          className={`${INPUT_BASE_CLASS} text-base ${
            errors.storeId ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
          }`}
          onChange={handleChange}
          required
          disabled={!isCreateMode}
        >
          <option value=''>Select a Store</option>
          {storeData.map((item) => (
            <option key={item._id} value={item._id}>
              {`${item.storeName}, ${item.region}`}
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.storeId} />
      </label>

      <div className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Bonus Type*</span>
        <div className='flex items-center gap-4'>
          <select
            name='discountType'
            value={formData.discountType}
            className={`${INPUT_BASE_CLASS} text-base w-1/2`}
            onChange={handleChange}
            required
          >
            <option value='Fixed'>Fixed (₹)</option>
            <option value='Percentage'>Percentage (%)</option>
          </select>
          <input
            name='discountValue'
            placeholder={
              formData.discountType === 'Fixed' ? 'e.g., 500' : 'e.g., 10'
            }
            value={formData.discountValue}
            onChange={handleChange}
            className={`${INPUT_BASE_CLASS} w-1/2 ${
              errors.discountValue ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
            }`}
            type='number'
            required
          />
        </div>
        <ErrorMessage message={errors.discountValue} />
      </div>

      <label className='flex flex-col w-[70%] gap-2'>
        <div className='flex items-baseline gap-2'>
          <span className='font-medium text-xl'>Coupon Code*</span>
          {isCreateMode && (
            <span className='text-xs text-gray-500'>
              (Auto-generated, can be changed)
            </span>
          )}
        </div>
        <input
          name='couponCode'
          placeholder='Auto-generated from store & discount'
          value={formData.couponCode}
          onChange={handleChange}
          className={`${INPUT_BASE_CLASS} ${
            errors.couponCode ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
          }`}
          type='text'
          required
          readOnly={!isCreateMode}
        />
        {isCreateMode && (
          <p className='text-xs text-gray-500 mt-1'>
            Format: [STORE_PREFIX]-[BASE_CODE], e.g., MUM-SW500
          </p>
        )}
        <ErrorMessage message={errors.couponCode} />
      </label>

      <div className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Device Price Range (₹)*</span>
        <div className='flex items-center gap-4'>
          <input
            name='devicePriceRange.min'
            placeholder='Min Price (e.g., 0)'
            value={formData['devicePriceRange.min']}
            onChange={handleChange}
            className={`${INPUT_BASE_CLASS} w-1/2 ${
              errors.priceRange ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
            }`}
            type='number'
            required
          />
          <input
            name='devicePriceRange.max'
            placeholder='Max Price (or leave empty)'
            value={formData['devicePriceRange.max']}
            onChange={handleChange}
            className={`${INPUT_BASE_CLASS} w-1/2 ${
              errors.priceRange ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
            }`}
            type='number'
          />
        </div>
        <ErrorMessage message={errors.priceRange} />
      </div>

      <div className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Validity Dates*</span>
        <div className='flex items-center gap-4'>
          <div className='w-1/2'>
            <label
              htmlFor='validFrom'
              className='text-sm font-medium text-gray-600'
            >
              From*
            </label>
            <input
              id='validFrom'
              name='validFrom'
              value={formData.validFrom}
              onChange={handleChange}
              className={`w-full mt-1 ${INPUT_BASE_CLASS} ${
                errors.dates ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
              }`}
              type='date'
              required
            />
          </div>
          <div className='w-1/2'>
            <label
              htmlFor='validTo'
              className='text-sm font-medium text-gray-600'
            >
              To*
            </label>
            <input
              id='validTo'
              name='validTo'
              value={formData.validTo}
              onChange={handleChange}
              className={`w-full mt-1 ${INPUT_BASE_CLASS} ${
                errors.dates ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
              }`}
              type='date'
              required
            />
          </div>
        </div>
        <ErrorMessage message={errors.dates} />
      </div>

      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Status*</span>
        <select
          name='status'
          value={formData.status}
          className={`${INPUT_BASE_CLASS} text-base ${DEFAULT_BORDER_CLASS}`}
          onChange={handleChange}
          required
        >
          <option value='Active'>Active</option>
          <option value='Inactive'>Inactive</option>
        </select>
      </label>

      <div className='mt-8'>
        <button
          type='submit'
          className='font-medium text-sm text-white p-3 rounded bg-primary'
        >
          {isCreateMode ? 'Create Coupon' : 'Update Coupon'}
        </button>
      </div>
    </form>
  )
}
export default CouponForm
