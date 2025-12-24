import React, { useEffect } from 'react'
import { FaCamera, FaImages, FaFolder, FaTimes } from 'react-icons/fa'

const ImagePickerBottomSheet = ({ isOpen, onClose, onSelectOption }) => {
  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const options = [
    {
      id: 'camera',
      label: 'Camera',
      icon: <FaCamera className='text-2xl' />,
      accept: 'image/*',
      capture: 'environment'
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: <FaImages className='text-2xl' />,
      accept: 'image/*',
      capture: null
    },
    {
      id: 'files',
      label: 'File Manager',
      icon: <FaFolder className='text-2xl' />,
      accept: '*/*',
      capture: null
    }
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity'
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className='fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 animate-slide-up'>
        {/* Handle bar */}
        <div className='flex justify-center pt-3 pb-2'>
          <div className='w-12 h-1 bg-gray-300 rounded-full' />
        </div>

        {/* Header */}
        <div className='flex justify-between items-center px-6 pb-4 border-b'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Select Image Source
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <FaTimes className='text-gray-600' />
          </button>
        </div>

        {/* Options */}
        <div className='p-4 pb-8'>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectOption(option)}
              className='w-full flex items-center gap-4 p-4 mb-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-200'
            >
              <div className='flex items-center justify-center w-12 h-12 bg-primary bg-opacity-10 rounded-full text-primary'>
                {option.icon}
              </div>
              <span className='text-base font-medium text-gray-700'>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default ImagePickerBottomSheet

