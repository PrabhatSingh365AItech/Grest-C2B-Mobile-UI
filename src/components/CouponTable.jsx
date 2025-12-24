import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdAdd, IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import CouponStatusToggle from './CouponStatusToggle'

const TABLE_HEADER_CLASS =
  'px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap'
const TABLE_CELL_CLASS =
  'px-4 py-2 text-sm md:px-6 md:py-3 md:text-base whitespace-nowrap'

const SearchInput = ({ value, onChange, onSearch, placeholder }) => (
  <div className='relative w-full md:w-auto'>
    <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
      <IoMdSearch className='w-5 h-5 text-gray-900' />
    </div>
    <input
      onChange={(e) => onChange(e.target.value)}
      className='block w-full md:w-64 p-2 pl-10 text-sm text-gray-900
                  border border-gray-300 rounded-lg bg-gray-50
                  focus:ring-primary focus:border-primary'
      type='text'
      placeholder={placeholder}
      value={value}
      onKeyDown={(e) => e.key === 'Enter' && onSearch()}
    />
  </div>
)

const CouponTableFilters = ({
  navigate,
  searchValue,
  setSearchValue,
  storeValue,
  setStoreValue,
  onSearch,
  onClear,
}) => (
  <div className='flex flex-wrap gap-4 items-center mt-2 justify-center p-4 w-full'>
    <button
      className='flex items-center justify-center gap-2 px-4 py-2.5 text-sm
                  font-semibold text-white bg-primary rounded-lg shadow-md
                  transition-all duration-200 ease-in-out active:scale-95'
      onClick={() => navigate('/createcoupon')}
    >
      <IoMdAdd /> Add Coupon
    </button>

    <SearchInput
      value={searchValue}
      onChange={setSearchValue}
      onSearch={onSearch}
      placeholder='Search Coupon Code'
    />

    <SearchInput
      value={storeValue}
      onChange={setStoreValue}
      onSearch={onSearch}
      placeholder='Search Store Name'
    />

    <button
      onClick={onClear}
      title='Refresh Filters'
      className='p-2.5 text-sm font-medium text-white bg-primary rounded-lg
                  border border-gray-300 transition-transform duration-150
                  ease-in-out active:scale-95'
    >
      <IoRefresh size={20} />
    </button>
  </div>
)

const TableHeader = () => (
  <thead className='bg-primary text-white'>
    <tr className='align-top'>
      <th className={`${TABLE_HEADER_CLASS} text-center`}>Action</th>
      <th className={`${TABLE_HEADER_CLASS} text-left`}>Coupon Code</th>
      <th className={`${TABLE_HEADER_CLASS} text-left`}>Store Name</th>
      <th className={`${TABLE_HEADER_CLASS} text-center`}>
        Device Price Range
      </th>
      <th className={`${TABLE_HEADER_CLASS} text-center`}>Discount Type</th>
      <th className={`${TABLE_HEADER_CLASS} text-center`}>Discount Value</th>
      <th className={`${TABLE_HEADER_CLASS} text-center`}>Validity</th>
      <th className={`${TABLE_HEADER_CLASS} text-center`}>Status</th>
      <th className={`${TABLE_HEADER_CLASS} text-left`}>Created By</th>
      <th className={`${TABLE_HEADER_CLASS} text-center`}>Created Date</th>
      <th className={`${TABLE_HEADER_CLASS} text-center`}>Last Updated</th>
      <th className={`${TABLE_HEADER_CLASS} text-center`}>TotalRedemptions</th>
    </tr>
  </thead>
)

const formatPriceRange = (min, max) => {
  const maxDisplay = max === Infinity ? '∞' : `₹${max}`
  return `₹${min} - ${maxDisplay}`
}

const formatDiscountValue = (type, value) => {
  return type === 'Fixed' ? `₹${value}` : `${value}%`
}

const formatValidityDates = (validFrom, validTo) => {
  const fromDate = new Date(validFrom).toLocaleDateString('en-GB')
  const toDate = new Date(validTo).toLocaleDateString('en-GB')
  return `${fromDate} to ${toDate}`
}

const CouponRow = ({ coupon, navigate, onDelete, onStatusToggle }) => (
  <tr
    key={coupon._id}
    className={coupon._id % 2 === 0 ? 'bg-gray-200' : 'bg-white'}
  >
    <td className={`${TABLE_CELL_CLASS} text-left`}>
      <div className='flex flex-row gap-2 items-center'>
        <button
          className='px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
          onClick={() => navigate(`/editcoupon/${coupon._id}`)}
        >
          Edit
        </button>
        <button
          className='px-3 py-1 text-xs font-medium text-white
                      bg-red-600 rounded-md hover:bg-red-700'
          onClick={() => onDelete(coupon)}
        >
          Delete
        </button>
      </div>
    </td>
    <td className={`${TABLE_CELL_CLASS} text-left font-bold`}>
      {coupon.couponCode}
    </td>
    <td className={`${TABLE_CELL_CLASS} text-left`}>{coupon.storeName}</td>
    <td className={`${TABLE_CELL_CLASS} text-center`}>
      {formatPriceRange(
        coupon.devicePriceRange.min,
        coupon.devicePriceRange.max
      )}
    </td>
    <td className={`${TABLE_CELL_CLASS} text-center`}>{coupon.discountType}</td>
    <td className={`${TABLE_CELL_CLASS} text-center`}>
      {formatDiscountValue(coupon.discountType, coupon.discountValue)}
    </td>
    <td className={`${TABLE_CELL_CLASS} text-center`}>
      {formatValidityDates(coupon.validFrom, coupon.validTo)}
    </td>
    <td className={`${TABLE_CELL_CLASS} text-center`}>
      <div className='flex justify-center'>
        <CouponStatusToggle
          isActive={coupon.status === 'Active'}
          onToggle={() => onStatusToggle(coupon._id, coupon.status)}
        />
      </div>
    </td>
    <td className={`${TABLE_CELL_CLASS} text-left`}>{coupon.createdBy}</td>
    <td className={`${TABLE_CELL_CLASS} text-left`}>
      {new Date(coupon.createdAt).toLocaleString('en-GB')}
    </td>
    <td className={`${TABLE_CELL_CLASS} text-left`}>
      {new Date(coupon.updatedAt).toLocaleString('en-GB')}
    </td>
    <td className={`${TABLE_CELL_CLASS} text-center`}>
      {coupon.totalRedemptions}
    </td>
  </tr>
)

const EmptyTableRow = () => (
  <tr>
    <td colSpan='12' className='text-center text-gray-500 py-10'>
      No coupons found for the selected filters.
    </td>
  </tr>
)

const TableBody = ({ data, navigate, onDelete, onStatusToggle }) => (
  <tbody>
    {data && data.length > 0 ? (
      data.map((coupon) => (
        <CouponRow
          key={coupon._id}
          coupon={coupon}
          navigate={navigate}
          onDelete={onDelete}
          onStatusToggle={onStatusToggle}
        />
      ))
    ) : (
      <EmptyTableRow />
    )}
  </tbody>
)

const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
}) => (
  <div className='flex justify-center items-center mt-4'>
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className='mx-2 px-4 py-2 rounded-lg bg-primary text-white
                  disabled:bg-gray-400 disabled:text-gray-600
                  disabled:cursor-not-allowed'
    >
      Previous
    </button>
    <span className='mx-4 text-sm'>
      Page {currentPage} of {totalPages} (Total: {totalRecords} coupons)
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className='mx-2 px-4 py-2 rounded-lg bg-primary text-white
                  disabled:bg-gray-400 disabled:text-gray-600
                  disabled:cursor-not-allowed'
    >
      Next
    </button>
  </div>
)

const CouponTable = ({
  data,
  searchValue,
  setSearchValue,
  storeValue,
  setStoreValue,
  onSearch,
  onClear,
  onDelete,
  pagination,
  onPageChange,
  onStatusToggle,
}) => {
  const navigate = useNavigate()
  const { currentPage, totalPages, totalRecords } = pagination || {}

  return (
    <>
      <CouponTableFilters
        navigate={navigate}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        storeValue={storeValue}
        setStoreValue={setStoreValue}
        onSearch={onSearch}
        onClear={onClear}
      />

      <div className='m-2 md:m-5'>
        <div className='overflow-x-auto border border-gray-300 rounded-md'>
          <table className='w-full'>
            <TableHeader />
            <TableBody
              data={data}
              navigate={navigate}
              onDelete={onDelete}
              onStatusToggle={onStatusToggle}
            />
          </table>
        </div>

        {pagination && totalRecords > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </>
  )
}

export default CouponTable
