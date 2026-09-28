import React from 'react'
import { FaAngleDown } from 'react-icons/fa6'
import styles from '../StoreWiseReport.module.css'

const rotateCss = 'rotate-180'
const currentDomain = window.location.origin
const WEBSITE_SHORT_NAME =
  currentDomain === import.meta.env.VITE_BUYBACK_URL
    ? import.meta.env.VITE_BUYBACK_SHORT_NAME
    : import.meta.env.VITE_WEBSITE_SHORT_NAME

const GrestFilter = ({
  grestDrop,
  setGrestDrop,
  grestRec,
  handleGrestRecChange,
}) => (
  <div className='relative w-[15%]'>
    <div
      className={`${styles.filter_button}`}
      onClick={() => setGrestDrop(!grestDrop)}
    >
      <p className='truncate'>
        {grestRec === ''
          ? `${WEBSITE_SHORT_NAME} Received ?`
          : `${WEBSITE_SHORT_NAME} Rec. ` + grestRec}
      </p>
      <FaAngleDown size={17} className={`${grestDrop && rotateCss}`} />
    </div>
    {grestDrop && (
      <div className={`${styles.filter_drop}`}>
        <div
          onClick={() => handleGrestRecChange('')}
          className={`${styles.filter_option}`}
        >
          <p className='truncate'>Show All</p>
        </div>
        <div
          onClick={() => handleGrestRecChange('yes')}
          className={`${styles.filter_option}`}
        >
          <p className='truncate'>Yes</p>
        </div>
        <div
          onClick={() => handleGrestRecChange('no')}
          className={`${styles.filter_option}`}
        >
          <p className='truncate'>No</p>
        </div>
      </div>
    )}
  </div>
)

export default GrestFilter
