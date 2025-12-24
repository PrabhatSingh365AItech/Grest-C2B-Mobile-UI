import React from 'react'

const CouponStatusToggle = ({ isActive, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={`
                relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-200 ease-in-out
                ${isActive ? 'bg-green-500' : 'bg-gray-300'}
            `}
    >
      <span
        className={`
                    inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out
                    ${isActive ? 'translate-x-6' : 'translate-x-1'}
                `}
      />
    </div>
  )
}

export default CouponStatusToggle
