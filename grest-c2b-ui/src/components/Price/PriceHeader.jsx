import React from 'react'
import { IoArrowBack } from 'react-icons/io5'
import User_Logo from '../../assets/User_Logo.jpg'
import { GREST_LOGO } from '../../constants/priceConstants'

const PriceHeader = ({ navigate }) => {
  const userName = ''
  return (
    <div className='flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER header'>
      <div className='flex items-center justify-between w-full pr-4'>
        <div className='flex items-center gap-2 ml-4'>
          <button
            onClick={() => navigate('/selectdevicetype')}
            className='text-xs ml-2 flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full'
          >
            <IoArrowBack size={24} />
          </button>
          <img
            onClick={() => navigate('/selectdevicetype')}
            className='w-40'
            src={GREST_LOGO}
            alt='app logo'
          />
        </div>
        <p className=' text-base md:text-xl'>{userName}</p>
        <img className='w-[30px]' src={User_Logo} alt='' />
      </div>
    </div>
  )
}

export default PriceHeader
