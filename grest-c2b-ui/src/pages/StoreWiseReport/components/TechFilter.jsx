import React from 'react'
import { FaAngleDown } from 'react-icons/fa6'
import styles from '../StoreWiseReport.module.css'

const rotateCss = 'rotate-180'

const TechFilter = ({
  techDrop,
  setTechDrop,
  techName,
  setTechName,
  setTechId,
  allUser,
  handleTechChange,
}) => (
  <div className='relative w-[15%]'>
    <div
      className={`${styles.filter_button}`}
      onClick={() => setTechDrop(!techDrop)}
    >
      <p className='truncate'>
        {techName === '' ? 'Select Sale User' : techName}
      </p>
      <FaAngleDown size={17} className={`${techDrop && rotateCss}`} />
    </div>
    {techDrop && (
      <div className={`${styles.filter_drop}`}>
        <div
          onClick={() => {
            setTechName('')
            setTechId('')
            setTechDrop(false)
          }}
          className={`${styles.filter_option}`}
        >
          <p className='truncate'>Show All</p>
        </div>
        {allUser.map((item) => (
          <div
            key={item._id}
            onClick={() => handleTechChange(item)}
            className={`${styles.filter_option}`}
          >
            <p className='truncate'>{item.userName}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)

export default TechFilter
