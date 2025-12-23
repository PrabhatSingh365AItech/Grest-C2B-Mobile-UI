import React, { useEffect, useState } from 'react'
const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg' // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO
import FAQ from '../../components/FAQ'
import styles from './SelectModel.module.css'
import { useNavigate } from 'react-router'
import ProfileBox from '../../components/ProfileBox/ProfileBox'
import store from '../../store/store'
import { useQuestionContext } from '../../components/QuestionContext'
import apple_watch from '../../assets/apple_watch.png'
import { IoArrowBack } from 'react-icons/io5'

const SelectModel = () => {
  const phoneImg = JSON.parse(sessionStorage.getItem('dataModel'))
  const phoneFrontPhoto =
    phoneImg?.models?.phonePhotos?.front ||
    phoneImg?.models?.phonePhotos?.upFront
  const Device = sessionStorage.getItem('DeviceType')
  const DummyImg =
    Device === 'CTG1'
      ? 'https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg'
      : apple_watch
  const [modelData, setModelData] = useState()
  const { resetState } = useQuestionContext()
  const [selectedConfig, setSelectedConfig] = useState(() => {
    const modelConfigData = JSON.parse(
      sessionStorage.getItem('dataModelConfig')
    )
    return modelConfigData ? modelConfigData.config[0] : null
  })
  const [configData, setConfigData] = useState()

  const navigate = useNavigate()
  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('dataModel'))
    setModelData(data)
    const modelConfigData = JSON.parse(
      sessionStorage.getItem('dataModelConfig')
    )

    // Sort config by RAM first, then by storage
    if (modelConfigData?.config) {
      const sortedConfig = [...modelConfigData.config].sort((a, b) => {
        const parseSize = (size) => {
          const num = parseFloat(size)
          const unit = size.toUpperCase()
          // Convert to MB for comparison
          if (unit.includes('TB')) {
            return num * 1024 * 1024
          }
          if (unit.includes('GB')) {
            return num * 1024
          }
          return num
        }

        const ramA = parseSize(a.RAM)
        const ramB = parseSize(b.RAM)

        if (ramA !== ramB) {
          return ramA - ramB
        }

        const storageA = parseSize(a.storage)
        const storageB = parseSize(b.storage)
        return storageA - storageB
      })

      modelConfigData.config = sortedConfig
    }

    setConfigData(modelConfigData)
    setSelectedConfig(modelConfigData?.config[0])
  }, [])

  const handleConfigClick = (configItem) => {
    setSelectedConfig(configItem)
  }

  const handleExactValue = () => {
    const data = JSON.parse(sessionStorage.getItem('dataModel'))
    const updatedData = {
      ...data,
      models: {
        ...data.models,
        config: selectedConfig,
      },
    }
    sessionStorage.setItem('dataModel', JSON.stringify(updatedData))

    store.dispatch({ type: 'RESET_STATE' })
    resetState()
    navigate('/device/Qestions')
  }

  const handleQuickQuote = () => {
    const data = JSON.parse(sessionStorage.getItem('dataModel'))
    const updatedData = {
      ...data,
      models: {
        ...data.models,
        config: selectedConfig,
      },
    }
    sessionStorage.setItem('dataModel', JSON.stringify(updatedData))
    store.dispatch({ type: 'RESET_STATE' })
    resetState()
    if (Device === 'CTG1') {
      navigate('/quickquote')
    } else {
      console.log('watch')
    }
  }
  const buyback = import.meta.env.VITE_BUYBACK_URL

  return (
    <div className={`bg-white min-h-screen`}>
      <div className='flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER '>
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
          <ProfileBox />
        </div>
      </div>

      <div className={styles.select_model_wrap}>
        <div className={`flex flex-col ${styles.product_details_wrap}`}>
          <div className={` ${styles.modelCard}`}>
            <div className={` ${styles.mobile_img_wrap}`}>
              <img
                className='max-w-[128px] max-h-[130px]'
                src={phoneFrontPhoto ? phoneFrontPhoto : DummyImg}
                alt=''
              />
            </div>

            <div className='flex flex-col gap-2'>
              <div>
                <p className='text-xl font-medium'>{modelData?.models?.name}</p>
              </div>

              <div>
                <p>Get Upto</p>
                <p className='font-bold text-2xl md:text-4xl text-primary'>
                  {selectedConfig?.price
                    ? `₹${Math.round(
                        selectedConfig.price * 1.08
                      ).toLocaleString('en-IN')}`
                    : 'N/A'}
                </p>
              </div>
              {Device !== 'CTG2' && (
                <div className='flex flex-wrap gap-2'>
                  {configData?.config?.map((configItem, index) => (
                    <button
                      key={index}
                      className={
                        selectedConfig === configItem
                          ? styles.button_checked
                          : styles.button_unchecked
                      }
                      onClick={() => handleConfigClick(configItem)}
                    >
                      {configItem.RAM}/{configItem.storage}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            className={`px-2 gap-3 ${styles.button_wrap} ${
              Device === 'Watch' && 'justify-start'
            }`}
          >
            {Device === 'CTG1' && currentDomain !== buyback && (
              <button
                onClick={handleQuickQuote}
                className='border-2 border-primary w-[48%] bg-white text-primary  text-[12px]  px-4 py-2 rounded'
              >
                Quick Quote
              </button>
            )}
            <button
              onClick={handleExactValue}
              className={`border-2 border-primary bg-primary text-white text-[12px] px-4 py-2 rounded w-full`}
            >
              Get Exact Value
            </button>
          </div>
          <div className='bg-[#FBF3CD] mx-2 py-2 px-1 mt-1 rounded-lg text-[10px]'>
            <p>
              This price stated above depends on the condition of your product
              and is not final. The final price offer will be quoted at the
              diagnosis by our experts.
            </p>
          </div>

          <div className='mx-2 mt-2'>
            <div className='text-primary font-semibold text-2xl mb-2'>
              FAQ's
            </div>
            <FAQ />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectModel
