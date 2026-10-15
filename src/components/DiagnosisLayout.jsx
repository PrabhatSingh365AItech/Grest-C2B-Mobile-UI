import React from 'react'
import ProfileBox from './ProfileBox/ProfileBox'

const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg'
const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO

const DiagnosisLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex items-center w-full h-16 py-4 bg-white border-b-2 HEADER px-4 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <img className="w-40" src={GREST_LOGO} alt="app logo" />
          <ProfileBox />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}

export default DiagnosisLayout
