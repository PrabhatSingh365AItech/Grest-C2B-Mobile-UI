import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import { FaAngleDown } from 'react-icons/fa6'
import { BsCalendarDate } from 'react-icons/bs'
import { setStoreFilter } from '../../../store/slices/userSlice'
import styles from '../PickedUpDevices.module.css'

const PickedUpFilter = ({
  setSearchValue,
  searchValue,
  getDataBySearch,
  setDateValue,
  dateValue,
  setRegion,
  region,
  regionData,
  storeName,
  setStoreName,
  allStore,
  setStoreData,
  storeData,
  getData,
  isSuperAdmin,
}) => {
  const [regionDrop, setRegionDrop] = useState(false)
  const [storeDrop, setStoreDrop] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStores, setFilteredStores] = useState(storeData)
  const dispatch = useDispatch()

  const handleSearchClear = () => {
    setSearchValue('')
    setSearchTerm('')
    setDateValue('')
    setRegion('')
    setStoreName(import.meta.env.VITE_USER_STORE_NAME)
  }

  useEffect(() => {
    if (dateValue === '' && searchValue === '') {
      getData()
    }
  }, [dateValue, searchValue])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value === '') {
      setFilteredStores(storeData)
    } else {
      const filtered = storeData.filter((store) =>
        store.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredStores(filtered)
    }
  }

  const handleRegionChange = (value) => {
    setRegionDrop(false)
    setStoreName('')
    const filteredStoresTemp = allStore?.filter(
      (store) => store.region === value
    )
    const storeNamesArray = filteredStoresTemp.map((store) => store.storeName)
    dispatch(setStoreFilter({ selStore: '', selRegion: value }))
    setStoreData(storeNamesArray)
    setRegion(value)
  }

  const handleStoreChange = (value) => {
    setStoreDrop(false)
    const filteredStoresTemp2 = allStore?.filter(
      (store) => store.storeName === value
    )
    const newRegion = filteredStoresTemp2[0].region
    setRegion(newRegion)
    dispatch(setStoreFilter({ selStore: value, selRegion: newRegion }))
    setStoreName(value)
  }

  const dateChangeHandler = (event) => {
    const formattedDate = new Date(event.target.value).toLocaleDateString(
      'en-GB'
    )
    setDateValue(formattedDate)
  }

  return (
    <div className='m-2 flex flex-col gap-2'>
      <div className='mt-[3px] flex gap-2 items-center outline-none'>
        <div className={`${styles.search_bar_wrap}`}>
          <input
            className='text-sm'
            onChange={(e) => setSearchValue(e.target.value)}
            type='text'
            value={searchValue}
            placeholder='Search'
          />
          <IoMdSearch size={34} onClick={() => getDataBySearch()} />
        </div>
        <div className={styles.icons_box}>
          <IoRefresh className='' onClick={handleSearchClear} size={25} />
        </div>
        <div
          className={`flex flex-row  items-center justify-center ${styles.date_picker_wrap}`}
        >
          <input
            id='datepicker'
            style={{ color: 'var(--primary-color)' }}
            type='date'
            value={dateValue}
            onChange={dateChangeHandler}
            className=''
          />
          <div
            onClick={() => document.getElementById('datepicker').showPicker()}
            className={styles.date_box}
          >
            <p>{dateValue ? dateValue : 'DD/MM/YYYY'}</p>
            <BsCalendarDate size={25} />
          </div>
        </div>
      </div>
      {isSuperAdmin && (
        <div className='flex gap-2 w-100 items-center outline-none'>
          <div className='relative w-[45%]'>
            <div
              className={`${styles.filter_button}`}
              onClick={() => {
                setRegionDrop(!regionDrop)
              }}
            >
              <p className='truncate'>
                {region === '' ? 'Select Region' : region}
              </p>
              <FaAngleDown
                size={17}
                className={`${regionDrop && 'rotate-180'}`}
              />
            </div>
            {regionDrop && (
              <div className={`${styles.filter_drop}`}>
                {regionData.map((element) => (
                  <div
                    key={element}
                    className={`${styles.filter_option}`}
                    onClick={() => handleRegionChange(element)}
                  >
                    <p className='truncate'>{element}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className='relative w-[70%]'>
            <div
              className={`${styles.filter_button} w-full`}
              onClick={() => setStoreDrop(!storeDrop)}
            >
              <p className='  truncate'>
                {searchTerm === '' ? 'Select Store' : searchTerm}
              </p>
              <FaAngleDown
                className={`${storeDrop && 'rotate-180'}`}
                size={17}
              />
            </div>
            {storeDrop && (
              <div className='absolute w-full bg-white   shadow-md'>
                <input
                  type='text'
                  onChange={handleSearch}
                  value={searchTerm}
                  className='w-full p-2 border-b   border-gray-300'
                  placeholder='Search store...'
                />
                <div
                  className={`overflow-y-scroll   max-h-[200px] ${styles.filter_drop} w-full`}
                >
                  {filteredStores.length > 0 ? (
                    filteredStores.map((item2, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          handleStoreChange(item2)
                          setSearchTerm(item2)
                          setStoreDrop(false)
                        }}
                        className={`${styles.filter_option}`}
                      >
                        <p className='truncate'>{item2}</p>
                      </div>
                    ))
                  ) : (
                    <p className='p-2   text-gray-500'>No stores found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PickedUpFilter
