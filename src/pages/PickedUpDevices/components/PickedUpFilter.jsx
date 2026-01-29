import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import { FaAngleDown } from 'react-icons/fa6'
import { BsCalendarDate } from 'react-icons/bs'
import { setStoreFilter } from '../../../store/slices/userSlice'
import styles from '../PickedUpDevices.module.css'

const getAllStoreNames = (allStore = []) =>
  allStore.map((store) => store.storeName)

const getStoresByRegion = (allStore = [], region = '') =>
  allStore
    .filter((store) => store.region === region)
    .map((store) => store.storeName)

const filterStoresBySearch = (stores = [], searchTerm = '') => {
  if (!searchTerm) {
    return stores
  }
  return stores.filter((store) =>
    store.toLowerCase().includes(searchTerm.toLowerCase())
  )
}

/* Custom hook for effects */
const useStoreFilterEffects = ({
  storeDrop,
  searchTerm,
  storeData,
  setFilteredStores,
  dateValue,
  searchValue,
  getData,
}) => {
  useEffect(() => {
    if (storeDrop && searchTerm.trim() === '') {
      setFilteredStores(storeData)
    }
  }, [storeDrop, searchTerm, storeData, setFilteredStores])

  useEffect(() => {
    if (dateValue === '' && searchValue === '') {
      getData()
    }
  }, [dateValue, searchValue])
}

const SearchBar = ({ searchValue, setSearchValue, getDataBySearch, handleSearchClear, dateValue, setDateValue, dateChangeHandler }) => (
  <div className='mt-[3px] flex gap-2 items-center outline-none'>
    <div className={styles.search_bar_wrap}>
      <input
        className='text-sm'
        onChange={(e) => setSearchValue(e.target.value)}
        type='text'
        value={searchValue}
        placeholder='Search'
      />
      <IoMdSearch size={34} onClick={getDataBySearch} />
    </div>
    <div className={styles.icons_box}>
      <IoRefresh onClick={handleSearchClear} size={25} />
    </div>
    <div className={`flex items-center ${styles.date_picker_wrap}`}>
      <input
        id='datepicker'
        type='date'
        value={dateValue}
        onChange={dateChangeHandler}
      />
      <div
        onClick={() => document.getElementById('datepicker').showPicker()}
        className={styles.date_box}
      >
        <p>{dateValue || 'DD/MM/YYYY'}</p>
        <BsCalendarDate size={25} />
      </div>
    </div>
  </div>
)

const RegionDropdown = ({ region, regionDrop, setRegionDrop, regionData, handleRegionChange }) => (
  <div className='relative w-[45%]'>
    <div
      className={styles.filter_button}
      onClick={() => setRegionDrop(!regionDrop)}
    >
      <p className='truncate'>{region === '' ? 'All Region' : region}</p>
      <FaAngleDown size={17} className={regionDrop ? 'rotate-180' : ''} />
    </div>
    {regionDrop && (
      <div className={styles.filter_drop}>
        <div
          className={styles.filter_option}
          onClick={() => handleRegionChange('')}
        >
          All
        </div>
        {regionData.map((item) => (
          <div
            key={item}
            className={styles.filter_option}
            onClick={() => handleRegionChange(item)}
          >
            {item}
          </div>
        ))}
      </div>
    )}
  </div>
)

const StoreDropdown = ({ searchTerm, storeDrop, setStoreDrop, handleSearch, filteredStores, handleStoreChange }) => (
  <div className='relative w-[70%]'>
    <div
      className={`${styles.filter_button} w-full`}
      onClick={() => setStoreDrop(!storeDrop)}
    >
      <p className='truncate'>{searchTerm === '' ? 'All Store' : searchTerm}</p>
      <FaAngleDown size={17} className={storeDrop ? 'rotate-180' : ''} />
    </div>
    {storeDrop && (
      <div className='absolute w-full bg-white shadow-md'>
        <input
          type='text'
          onChange={handleSearch}
          value={searchTerm}
          className='w-full p-2 border-b'
          placeholder='Search store...'
        />
        <div className={`${styles.filter_drop} max-h-[200px]`}>
          <div
            className={styles.filter_option}
            onClick={() => handleStoreChange('')}
          >
            All
          </div>
          {filteredStores.length ? (
            filteredStores.map((store, index) => (
              <div
                key={index}
                className={styles.filter_option}
                onClick={() => handleStoreChange(store)}
              >
                {store}
              </div>
            ))
          ) : (
            <p className='p-2 text-gray-500'>No stores found</p>
          )}
        </div>
      </div>
    )}
  </div>
)

//  Main Component

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

  useStoreFilterEffects({
    storeDrop,
    searchTerm,
    storeData,
    setFilteredStores,
    dateValue,
    searchValue,
    getData,
  })

  const handleSearchClear = () => {
    setSearchValue('')
    setSearchTerm('')
    setDateValue('')
    setRegion('')
    setStoreName(import.meta.env.VITE_USER_STORE_NAME)
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setFilteredStores(filterStoresBySearch(storeData, value))
  }

  const handleRegionChange = (value) => {
    setRegionDrop(false)
    setStoreName('')

    if (value === '') {
      setRegion('')
      setStoreData(getAllStoreNames(allStore))
      dispatch(setStoreFilter({ selStore: '', selRegion: '' }))
      return
    }

    setRegion(value)
    setStoreData(getStoresByRegion(allStore, value))
    dispatch(setStoreFilter({ selStore: '', selRegion: value }))
  }

  const handleStoreChange = (value) => {
    setStoreDrop(false)

    if (value === '') {
      setRegion('')
      setStoreName('')
      setStoreData(getAllStoreNames(allStore))
      dispatch(setStoreFilter({ selStore: '', selRegion: '' }))
      return
    }

    const selectedStore = allStore.find((store) => store.storeName === value)

    if (selectedStore) {
      setRegion(selectedStore.region)
      setStoreName(value)
      dispatch(
        setStoreFilter({
          selStore: value,
          selRegion: selectedStore.region,
        })
      )
    }
  }

  const dateChangeHandler = (event) => {
    const formattedDate = new Date(event.target.value).toLocaleDateString(
      'en-GB'
    )
    setDateValue(formattedDate)
  }

  return (
    <div className='m-2 flex flex-col gap-2'>
      <SearchBar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        getDataBySearch={getDataBySearch}
        handleSearchClear={handleSearchClear}
        dateValue={dateValue}
        setDateValue={setDateValue}
        dateChangeHandler={dateChangeHandler}
      />

      {isSuperAdmin && (
        <div className='flex gap-2'>
          <RegionDropdown
            region={region}
            regionDrop={regionDrop}
            setRegionDrop={setRegionDrop}
            regionData={regionData}
            handleRegionChange={handleRegionChange}
          />
          <StoreDropdown
            searchTerm={searchTerm}
            storeDrop={storeDrop}
            setStoreDrop={setStoreDrop}
            handleSearch={handleSearch}
            filteredStores={filteredStores}
            handleStoreChange={handleStoreChange}
          />
        </div>
      )}
    </div>
  )
}

export default PickedUpFilter
