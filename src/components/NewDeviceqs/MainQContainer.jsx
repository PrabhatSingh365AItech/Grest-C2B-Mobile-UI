import React from 'react'
import { IoIosArrowBack } from 'react-icons/io'
import { IoArrowBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import AboveSix from './AboveSix'
const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg' // Use your actual buyback logo
const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO

const MainQContainer = ({
  NDstate,
  visible,
  availableParts,
  setVisible,
  updateAns,
  showPopup,
  qna,
  profile,
  styless,
}) => {
  const navigate = useNavigate()
  const CurrentPart = availableParts[visible - 1]?.component
  return (
    <div className='mainQContainer'>
      <div className='flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER header'>
        <div className='flex items-center justify-between w-full max-w-screen overflow-hidden px-4 py-2'>
          <div className='flex items-center gap-2 flex-shrink-0'>
            <button
              onClick={() => navigate(-1)}
              className='text-xs flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full'
            >
              <IoArrowBack size={20} />
            </button>
            <img
              onClick={() => navigate('/selectdevicetype')}
              className='w-[120px] sm:w-[130px] md:w-[150px] object-contain cursor-pointer'
              src={GREST_LOGO}
              alt='app logo'
            />
          </div>
        </div>
      </div>
      <div className={`${styless.quick_page_nav}`}>
        <IoIosArrowBack
          onClick={() => navigate('/selectmodel')}
          size={25}
          className='ml-2 text-primary'
        />
        <p className='ml-2 text-xl font-medium'>Device Details</p>
      </div>
      <div className='innerContainer'>
        <div className={`maindata`}>
          <div className='text-lg font-medium tracking-tight text-{1.325rem}'>
            Tell us more about your device?
          </div>
          <div className='underline'></div>
          <div className='questionList'>
            {CurrentPart && (
              <CurrentPart
                NDstate={NDstate}
                slice={availableParts[visible - 1]?.slice}
              />
            )}
          </div>
        </div>
      </div>
      <AboveSix
        visible={visible}
        setVisible={setVisible}
        updateAns={updateAns}
        showPopup={showPopup}
        qna={qna}
        profile={profile}
        availableParts={availableParts}
      />
    </div>
  )
}

export default MainQContainer
