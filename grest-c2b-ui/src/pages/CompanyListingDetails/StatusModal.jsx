import React from 'react'
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io'

const StatusModal = ({
  open,
  type, // 'success' | 'error'
  title,
  message,
  onClose,
}) => {
  if (!open) {
    return null
  }

  const isSuccess = type === 'success'
  const Icon = isSuccess ? IoIosCheckmarkCircle : IoIosCloseCircle
  const colorClass = isSuccess ? 'text-green-500' : 'text-primary'

  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div className={`err_mod_box ${colorClass}`}>
        <Icon className={colorClass} size={90} />
        <h6 className={colorClass}>{title}</h6>
        <p className='text-slate-500'>{message}</p>
        <button
          onClick={onClose}
          className={`${isSuccess ? 'bg-green-500' : 'bg-primary'} text-white`}
        >
          Okay
        </button>
      </div>
    </div>
  )
}

export default StatusModal
