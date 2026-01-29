import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { IoArrowBack } from 'react-icons/io5'
import styles from './DeviceQuote.module.css'
import QuoteModal from '../../components/QuoteModal/QuoteModal'
import ContOTP from '../../components/ContOTP/ContOTP'
import DeviceReport from '../../components/DeviceReport/DeviceReport'
import ProfileBox from '../../components/ProfileBox/ProfileBox'
import apple_watch from '../../assets/apple_watch.png'
import { setResponseData } from '../../store/slices/responseSlice'
import axios from 'axios'

const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg'
const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO

const buyback = import.meta.env.VITE_BUYBACK_URL
const switchKart = import.meta.env.VITE_SWITCHKART_URL
const deviceTypePage = '/selectdevicetype'

const calculateDisplayPrice = ({
  quoteSaved,
  savedBonus,
  Price,
  bonus,
  appliedCoupon,
}) => {
  const basePrice = Number(Price)
  const bonusValue = Number(bonus) || 0
  const savedBonusValue = Number(savedBonus) || 0
  const couponDiscount = appliedCoupon
    ? Number(appliedCoupon.calculatedDiscount) || 0
    : 0

  if (quoteSaved) {
    if (savedBonus) {
      return basePrice + bonusValue - savedBonusValue + couponDiscount
    }
    return basePrice + bonusValue + couponDiscount
  }

  return basePrice + couponDiscount
}

const getDeviceDisplayName = (deviceModalInfo) => {
  const models = deviceModalInfo.models
  const isCTG1 = models?.type === 'CTG1'
  if (!isCTG1) {
    return models?.name
  }
  const ram = models?.config?.RAM
  const storage = models?.config?.storage
  return `${models?.name}(${ram}/${storage})`
}

// Custom hooks
const useDeviceQuoteData = () => {
  const dispatch = useDispatch()
  const Device = sessionStorage.getItem('DeviceType')
  let DummyImg = apple_watch

  if (Device === 'CTG1') {
    DummyImg = 'https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg'
  }

  const phoneImg = JSON.parse(sessionStorage.getItem('dataModel'))
  const phoneFrontPhoto = phoneImg?.models?.phonePhotos?.front || phoneImg?.models?.phonePhotos?.upFront
  const exactQuoteValue = sessionStorage.getItem('ExactQuote')
  const dataModel = JSON.parse(sessionStorage.getItem('dataModel'))
  const deviceModalInfo = dataModel
  const leadId = sessionStorage.getItem('LeadId')
  const token = sessionStorage.getItem('authToken')

  const ResponseData = useSelector((state) => state.responseData)
  const Price = useSelector((state) => state.responseData.price)
  const uniqueCode = useSelector((state) => state.responseData.uniqueCode)
  const savedBonus = useSelector((state) => state.responseData?.bonus) || null

  return {
    dispatch,
    DummyImg,
    phoneFrontPhoto,
    exactQuoteValue,
    deviceModalInfo,
    leadId,
    token,
    ResponseData,
    Price,
    uniqueCode,
    savedBonus
  }
}

const useCouponHandlers = (setMode, setIsCouponApplied, setBonus, setSelectedCoupon, setIsCouponApplied2) => {
  const handleModeSwitch = (newMode) => {
    setMode(newMode)
    if (newMode === 'bonus') {
      setIsCouponApplied(false)
    } else if (newMode === 'coupon') {
      setBonus(null)
    }
  }

  const handleApplyCoupon = (selectedCoupon) => {
    if (!selectedCoupon) {
      toast.error('Please select a coupon first.')
      return
    }
    setIsCouponApplied(true)
    toast.success(`Coupon "${selectedCoupon.couponCode}" applied!`)
  }

  const handleCouponSelect = (coupon) => {
    setSelectedCoupon(coupon)
    setIsCouponApplied2(true)
    toast.success(`Coupon "${coupon.couponCode}" applied!`)
  }

  const handleRemoveCoupon = () => {
    setIsCouponApplied(false)
    toast.success('Coupon removed.')
  }

  return { handleModeSwitch, handleApplyCoupon, handleCouponSelect, handleRemoveCoupon }
}

const DeviceQuote = () => {
  const quoteData = useDeviceQuoteData()
  const { dispatch, DummyImg, phoneFrontPhoto, exactQuoteValue, deviceModalInfo, leadId, token, ResponseData, Price, uniqueCode, savedBonus } = quoteData

  const [showModal, setShowModal] = useState(false)
  const [continueOTPOpen, setContinueOTPOpen] = useState(false)
  const [showDeviceReport, setShowDeviceReport] = useState(false)
  const [quoteSaved, setQuoteSaved] = useState(false)
  const [quoteId, setQuoteId] = useState('')
  const [bonus, setBonus] = useState(null)
  const [termsChecked, setTermsChecked] = useState(false)
  const hasShownError = useRef(false)

  const [mode, setMode] = useState('bonus')
  const [eligibleCoupons, setEligibleCoupons] = useState([])
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [isCouponApplied, setIsCouponApplied] = useState(false)
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(true)

  useEffect(() => {
    setQuoteId(uniqueCode)
    setBonus(savedBonus || null)
  }, [uniqueCode, savedBonus])

  const calculateFinalBonus = () => {
    if (mode === 'bonus') {
      return Number(bonus) || 0
    }

    if (mode === 'coupon' && isCouponApplied && selectedCoupon) {
      if (selectedCoupon.discountType === 'Fixed') {
        return selectedCoupon.discountValue
      }
      return Math.round((Number(Price) * selectedCoupon.discountValue) / 100)
    }

    return 0
  }

  const displayPrice = calculateDisplayPrice({
    quoteSaved,
    savedBonus,
    Price,
    bonus: calculateFinalBonus(),
    appliedCoupon: null,
  })

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!leadId || !token) {
        setIsLoadingCoupon(false)
        return
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/coupons/find-eligible/${leadId}`,
          {
            headers: { Authorization: token },
          }
        )
        const coupons = response?.data?.data
        let couponsArray = []

        if (Array.isArray(coupons)) {
          couponsArray = coupons
        } else if (coupons) {
          couponsArray = [coupons]
        }

        setEligibleCoupons(couponsArray)

        if (couponsArray.length === 1) {
          setSelectedCoupon(couponsArray[0])
        }
        if (couponsArray.length > 0 && couponsArray[0].couponCode) {
          sessionStorage.setItem('eligibleCouponCode', couponsArray[0].couponCode)
        }
      } catch (error) {
        console.error('❌ Error fetching coupons:', error?.response?.data || error.message)
        setEligibleCoupons([])
      } finally {
        setIsLoadingCoupon(false)
      }
    }
    fetchCoupons()
  }, [leadId, token])

  const couponHandlers = useCouponHandlers(setMode, setIsCouponApplied, setBonus, setSelectedCoupon, setIsCouponApplied)

  useEffect(() => {
    const shouldShowError = !hasShownError.current && quoteSaved === false && exactQuoteValue === 'true' && currentDomain !== buyback

    if (shouldShowError) {
      toast.error('Bonus Must Be Less Than ₹2000.')
      hasShownError.current = true
    }
  }, [quoteSaved, exactQuoteValue])

  const continueOTPHandler = () => {
    const resData = {
      grade: ResponseData.grade,
      price: Number(ResponseData.price),
      bonus: calculateFinalBonus(),
      uniqueCode: ResponseData.uniqueCode,
      id: ResponseData.id,
    }
    sessionStorage.setItem('responsedatadata', JSON.stringify(resData))
    dispatch(setResponseData(resData))
    setContinueOTPOpen(!continueOTPOpen)
  }

  const toggleModal = () => setShowModal(!showModal)
  const showDeviceReportHandler = () => setShowDeviceReport(!showDeviceReport)

  console.log(quoteSaved, exactQuoteValue, currentDomain)

  return (
    <div
      className={`bg-white min-h-screen ${styles.page_wrap}`}
      style={{
        paddingTop: continueOTPOpen ? 0 : 'calc(4rem + env(safe-area-inset-top))',
        minHeight: '100vh',
      }}
    >
      {continueOTPOpen ? (
        <ContOTP setContinueOTPOpen={setContinueOTPOpen} />
      ) : (
        <>
          <DeviceQuoteHeader isContOTPOpen={continueOTPOpen} />
          <div className='max-w-[900px] mx-auto px-4 flex flex-col items-center'>
            <p className='my-4 text-xl font-medium'>Device Quote Details</p>
            <QuoteCard
              deviceModalInfo={deviceModalInfo}
              phoneFrontPhoto={phoneFrontPhoto}
              DummyImg={DummyImg}
              displayPrice={displayPrice}
              showModal={showModal}
              toggleModal={toggleModal}
              quoteSaved={quoteSaved}
              setQuoteSaved={setQuoteSaved}
              quoteId={quoteId}
              bonus={bonus}
              setBonus={setBonus}
              exactQuoteValue={exactQuoteValue}
              showDeviceReportHandler={showDeviceReportHandler}
              mode={mode}
              handleModeSwitch={couponHandlers.handleModeSwitch}
              eligibleCoupons={eligibleCoupons}
              selectedCoupon={selectedCoupon}
              isCouponApplied={isCouponApplied}
              isLoadingCoupon={isLoadingCoupon}
              handleApplyCoupon={() => couponHandlers.handleApplyCoupon(selectedCoupon)}
              handleRemoveCoupon={couponHandlers.handleRemoveCoupon}
              handleCouponSelect={couponHandlers.handleCouponSelect}
            />
          </div>
          <div className='fixed bottom-0 flex flex-col w-full gap-2 p-4 border-t-2 bg-white'>
            {quoteSaved === false && exactQuoteValue === 'true' && (
              <TermsCheckbox
                termsChecked={termsChecked}
                setTermsChecked={setTermsChecked}
              />
            )}
            <SubDeviceQuote
              savedBonus={savedBonus}
              Price={Price}
              bonus={bonus}
              quoteSaved={quoteSaved}
              exactQuoteValue={exactQuoteValue}
              termsChecked={termsChecked}
              continueOTPHandler={continueOTPHandler}
              finalBonus={calculateFinalBonus()}
            />
          </div>
        </>
      )}
      {showDeviceReport && (
        <DeviceReport
          setShowDeviceReport={setShowDeviceReport}
          quoteSaved={quoteSaved}
        />
      )}
    </div>
  )
}

export default DeviceQuote

// -------------------- Helper Components --------------------

const DeviceQuoteHeader = ({ isContOTPOpen }) => {
  const navigate = useNavigate()
  return (
    <div
      className={`flex items-center justify-center border-b-2 w-screen bg-white fixed top-0 left-0 z-50`}
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)',
        height: 'calc(4rem + env(safe-area-inset-top))',
      }}
    >
      <div className='flex items-center justify-between w-full max-w-screen px-4'>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => navigate(-1)}
            className='text-xs flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full'
          >
            <IoArrowBack size={20} />
          </button>
          {!isContOTPOpen && (
            <img
              onClick={() => navigate(deviceTypePage)}
              className='w-[120px] sm:w-[130px] md:w-[150px] object-contain cursor-pointer'
              src={GREST_LOGO}
              alt='app logo'
            />
          )}
        </div>
        {!isContOTPOpen && <ProfileBox />}
      </div>
    </div>
  )
}

const TermsCheckbox = ({ termsChecked, setTermsChecked }) => (
  <div className='flex gap-1'>
    <input
      type='checkbox'
      checked={termsChecked}
      onChange={() => setTermsChecked(!termsChecked)}
    />
    <p className='font-medium'>
      I agree to the
      <span className='text-primary cursor-pointer'> Terms & Conditions </span>
    </p>
  </div>
)

const QuoteCard = ({
  deviceModalInfo,
  phoneFrontPhoto,
  DummyImg,
  displayPrice,
  showModal,
  toggleModal,
  quoteSaved,
  setQuoteSaved,
  quoteId,
  bonus,
  setBonus,
  exactQuoteValue,
  showDeviceReportHandler,
  mode,
  handleModeSwitch,
  eligibleCoupons,
  selectedCoupon,
  isCouponApplied,
  isLoadingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  handleCouponSelect,
}) => (
  <div
    className={`${styles.QuoteCardShadow} rounded-md p-4 w-full max-w-[600px]`}
  >
    <div className='flex items-center gap-4'>
      <div>
        <img
          className='w-[50px]'
          src={phoneFrontPhoto ? phoneFrontPhoto : DummyImg}
          alt=''
        />
      </div>
      <div className='flex flex-col gap-[2px]'>
        <p className='font-medium text-gray-700'>
          {getDeviceDisplayName(deviceModalInfo)}
        </p>
        <p className='text-primary font-semibold'>
          ₹{Math.round(displayPrice).toLocaleString('en-IN')}
        </p>
      </div>
    </div>

    <QuoteModal
      show={showModal}
      handleClose={toggleModal}
      setQuoteSaved={setQuoteSaved}
      quoteId={quoteId}
      bonusPrice={bonus}
    />

    {quoteSaved === false &&
      exactQuoteValue === 'true' &&
      currentDomain !== buyback && (
        <CouponBonusToggle
          mode={mode}
          bonus={bonus}
          setBonus={setBonus}
          eligibleCoupons={eligibleCoupons}
          selectedCoupon={selectedCoupon}
          isCouponApplied={isCouponApplied}
          isLoadingCoupon={isLoadingCoupon}
          handleApplyCoupon={handleApplyCoupon}
          handleRemoveCoupon={handleRemoveCoupon}
          handleCouponSelect={handleCouponSelect}
        />
      )}

    <div className='mx-1 my-4 border-b-2 border-gray-400 border-dashed'></div>

    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
      <div className='flex flex-col sm:flex-row sm:items-center gap-4 flex-1'>
        <p
          className='text-gray-700 text-[17px] underline font-medium cursor-pointer'
          onClick={showDeviceReportHandler}
        >
          Device Report
        </p>
        {quoteSaved === false &&
          exactQuoteValue === 'true' &&
          currentDomain !== buyback && (
            <div className='flex flex-nowrap items-center gap-2'>
              <button
                className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded whitespace-nowrap ${
                  mode === 'coupon'
                    ? 'bg-primary text-white'
                    : 'text-primary border border-primary'
                }`}
                onClick={() => handleModeSwitch('coupon')}
              >
                Coupon code
              </button>
              <button
                className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded whitespace-nowrap ${
                  mode === 'bonus'
                    ? 'bg-primary text-white'
                    : 'text-primary border border-primary'
                }`}
                onClick={() => handleModeSwitch('bonus')}
              >
                Bonus amount
              </button>
              <button
                className='text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded text-primary border border-primary whitespace-nowrap sm:hidden'
                onClick={toggleModal}
              >
                Save Quote
              </button>
            </div>
          )}
      </div>
      {quoteSaved === false && (
        <button
          className='hidden sm:block text-sm font-medium px-3 py-1 rounded text-primary border border-primary lg:ml-auto'
          onClick={toggleModal}
        >
          Save Quote
        </button>
      )}
    </div>
  </div>
)

const CouponBonusToggle = ({
  mode,
  bonus,
  setBonus,
  eligibleCoupons,
  selectedCoupon,
  isCouponApplied,
  isLoadingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  handleCouponSelect,
}) => (
  <div className='px-2 my-2'>
    {mode === 'bonus' && <BonusInput bonus={bonus} setBonus={setBonus} />}
    {mode === 'coupon' && (
      <CouponDisplay
        eligibleCoupons={eligibleCoupons}
        selectedCoupon={selectedCoupon}
        isCouponApplied={isCouponApplied}
        isLoadingCoupon={isLoadingCoupon}
        handleApplyCoupon={handleApplyCoupon}
        handleRemoveCoupon={handleRemoveCoupon}
        handleCouponSelect={handleCouponSelect}
      />
    )}
  </div>
)

const BonusInput = ({ bonus, setBonus }) => (
  <div className='flex flex-row items-center justify-between px-2 my-2'>
    <div className='w-[50%] font-medium text-gray-700 text-sm sm:text-base'>
      {currentDomain === switchKart && 'SwitchKart'} Bonus Amount :
    </div>
    <div className='rounded-md bg-[#f6f6f6] py-1 sm:py-2 w-[45%]  border-2 border-primary flex flex-col items-center justify-center'>
      <input
        className='bg-transparent outline-none my-auto text-center font-medium text-primary text-xs sm:text-base w-full px-1'
        name='bonus'
        id='bonus'
        type='number'
        placeholder='Enter Bonus Amount'
        value={bonus}
        maxLength={6}
        onKeyDown={(e) => {
          if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
            e.preventDefault()
          }
        }}
        onChange={(e) => {
          if (Number(e.target.value) >= 0 && Number(e.target.value) <= 10000) {
            setBonus(e.target.value)
          }
        }}
      />
    </div>
  </div>
)

const CouponDisplay = ({
  eligibleCoupons,
  selectedCoupon,
  isCouponApplied,
  isLoadingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  handleCouponSelect,
}) => {
  if (isLoadingCoupon) {
    return (
      <div className='px-2 my-3 h-12 flex items-center justify-center'>
        <div className='flex items-center justify-center'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
          <span className='ml-2 text-sm text-gray-600'>Loading coupons...</span>
        </div>
      </div>
    )
  }

  if (!eligibleCoupons || eligibleCoupons.length === 0) {
    return (
      <div className='px-2 my-3 h-12 flex items-center justify-center'>
        <div className='w-full p-2 text-center bg-gray-100 border border-gray-300 rounded-md'>
          <p className='text-sm font-medium text-gray-600'>
            No coupons available for this device.
          </p>
        </div>
      </div>
    )
  }

  // Single coupon - original UI
  if (eligibleCoupons.length === 1) {
    const coupon = eligibleCoupons[0]
    const discountText =
      coupon.discountType === 'Fixed'
        ? `₹${coupon.discountValue}`
        : `${coupon.discountValue}%`

    return (
      <div className='px-2 my-3 h-12 flex items-center justify-center'>
        <div className='flex items-center justify-between w-full p-2 bg-green-100 border border-green-400 rounded-md'>
          <p className='text-sm font-medium text-green-800'>
            {coupon.couponCode} ({discountText})
          </p>
          {!isCouponApplied ? (
            <button
              onClick={handleApplyCoupon}
              className='px-3 py-1 text-xs font-semibold text-white bg-primary rounded-md'
            >
              Apply
            </button>
          ) : (
            <button
              onClick={handleRemoveCoupon}
              className='px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-md'
            >
              Remove
            </button>
          )}
        </div>
      </div>
    )
  }

  // Multiple coupons - new UI with selection
  return (
    <div className='px-2 my-3'>
      <p className='text-sm font-medium text-gray-700 mb-2'>
        {eligibleCoupons.length} coupons available - Click to apply:
      </p>
      <div className='flex flex-col gap-2 max-h-[200px] overflow-y-auto'>
        {eligibleCoupons.map((coupon) => {
          const discountText =
            coupon.discountType === 'Fixed'
              ? `₹${coupon.discountValue}`
              : `${coupon.discountValue}%`
          const isSelected = selectedCoupon?._id === coupon._id
          const isCurrentlyApplied = isSelected && isCouponApplied

          return (
            <div
              key={coupon._id}
              className={`flex items-center justify-between w-full p-2 rounded-md border-2 transition-all ${
                isCurrentlyApplied
                  ? 'bg-green-50 border-green-500 shadow-sm'
                  : 'bg-gray-50 border-gray-300 hover:border-primary hover:shadow-sm cursor-pointer'
              }`}
              onClick={() => !isCurrentlyApplied && handleCouponSelect(coupon)}
            >
              <div className='flex items-center gap-2 flex-1'>
                <input
                  type='radio'
                  checked={isCurrentlyApplied}
                  onChange={() => handleCouponSelect(coupon)}
                  className='w-4 h-4 cursor-pointer accent-green-600'
                  disabled={isCurrentlyApplied}
                />
                <div className='flex flex-col'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-semibold text-gray-800'>
                      {coupon.couponCode}
                    </p>
                    {isCurrentlyApplied && (
                      <span className='text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded'>
                        Applied
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-gray-600'>
                    Discount: {discountText}
                    {coupon.description && ` - ${coupon.description}`}
                  </p>
                </div>
              </div>
              {isCurrentlyApplied && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveCoupon()
                  }}
                  className='px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors'
                >
                  Remove
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SubDeviceQuote = ({
  savedBonus,
  Price,
  bonus,
  quoteSaved,
  exactQuoteValue,
  termsChecked,
  continueOTPHandler,
  finalBonus,
}) => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10) // 10 seconds countdown

  useEffect(() => {
    let timer
    if (quoteSaved && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1)
      }, 1000)
    } else if (quoteSaved && countdown === 0) {
      navigate(deviceTypePage)
    }
    return () => clearInterval(timer)
  }, [quoteSaved, countdown, navigate])

  return (
    <div className='flex items-center justify-between gap-2'>
      <div className='flex flex-col w-1/2 text-xl font-medium'>
        <p>₹{Math.round(Number(Price) + finalBonus)}</p>
      </div>
      {quoteSaved === false && exactQuoteValue === 'true' && (
        <div
          onClick={termsChecked ? continueOTPHandler : undefined}
          className={`${
            termsChecked ? 'bg-primary' : 'bg-gray-400 cursor-not-allowed'
          } py-1 rounded-lg cursor-pointer w-1/2 sm:max-w-[200px]  flex justify-between px-2 text-white items-center`}
        >
          <p className='font-medium mx-auto text-xl p-[6px] '>Continue</p>
        </div>
      )}
      {quoteSaved === false && exactQuoteValue === 'false' && (
        <div
          onClick={() => navigate('/device/Qestions')}
          className='bg-primary rounded-lg cursor-pointer w-1/2 sm:max-w-[200px] flex justify-between px-2 text-white items-center'
        >
          <p className='p-2 mx-auto text-lg font-medium '>Get Exact Value</p>
        </div>
      )}
      {quoteSaved === true && (
        <div
          onClick={() => navigate(deviceTypePage)}
          className='bg-primary rounded-lg cursor-pointer w-1/2 sm:max-w-[200px] flex justify-between px-2 text-white items-center'
        >
          <p className='p-2 mx-auto text-lg font-medium '>
            Return To Home ({countdown}s)
          </p>
        </div>
      )}
    </div>
  )
}
