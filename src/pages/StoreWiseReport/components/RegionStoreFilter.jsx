import React, { useState } from 'react'
import { FaAngleDown } from 'react-icons/fa6'
import styles from '../StoreWiseReport.module.css'

const rotateCss = 'rotate-180'
const ALLstore = 'All Stores'

const RegionStoreFilter = ({
  regionDrop,
  setRegionDrop,
  region,
  regionalData,
  handleRegionChange,
  storeDrop,
  setStoreDrop,
  storeData,
  handleStoreChange,
  handleSearchClear,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStores, setFilteredStores] = useState(storeData)

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value === '') {
      setFilteredStores(storeData)
    } else {
      const filtered = storeData.filter((store) =>
        store.storeName.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredStores(filtered)
    }
  }

  return (
    <>
      <div className='relative w-[20%]'>
        <div
          className={`${styles.filter_button}`}
          onClick={() => setRegionDrop(!regionDrop)}
        >
          <p className='truncate'>{region === '' ? 'Select Region' : region}</p>
          <FaAngleDown size={17} className={`${regionDrop && rotateCss}`} />
        </div>
        {regionDrop && (
          <div className={`${styles.filter_drop}`}>
            {regionalData.map((item) => (
              <div
                key={item}
                onClick={() => handleRegionChange(item)}
                className={`${styles.filter_option}`}
              >
                <p className='truncate'>{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='relative w-[35%]'>
        <div
          className={`${styles.filter_button}`}
          onClick={() => setStoreDrop(!storeDrop)}
        >
          <p className='truncate'>
            {searchTerm === '' ? 'Select Store' : searchTerm}
          </p>
          <FaAngleDown size={17} className={`${storeDrop && rotateCss}`} />
        </div>
        {storeDrop && (
          <div className='absolute w-full bg-white shadow-md'>
            <input
              type='text'
              value={searchTerm}
              onChange={handleSearch}
              className='w-full p-2 border-b border-gray-300'
              placeholder='Search store...'
            />
            <div
              className={`overflow-y-scroll max-h-[200px] ${styles.filter_drop}`}
            >
              {filteredStores.length > 0 ? (
                filteredStores.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handleStoreChange(item)
                      setSearchTerm(item.storeName)
                      setStoreDrop(false)
                    }}
                    className={`${styles.filter_option}`}
                  >
                    <p className='truncate'>{item.storeName}</p>
                  </div>
                ))
              ) : (
                <p className='p-2 text-gray-500'>No stores found</p>
              )}
              <div
                className={`${styles.filter_option}`}
                onClick={() => {
                  handleSearchClear()
                  setStoreDrop(false)
                }}
              >
                <p className='truncate'>{ALLstore}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default RegionStoreFilter
