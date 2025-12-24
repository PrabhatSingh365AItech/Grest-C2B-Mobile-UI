import axios from 'axios'
import React, { useState } from 'react'
import { CgSpinner } from 'react-icons/cg'
import { ImArrowLeft } from 'react-icons/im'
import { useNavigate } from 'react-router-dom'
import store from '../../store/store'
import { setResponseData } from '../../store/slices/responseSlice'
import {
  calculateFinalPrice,
  getDeviceType,
  isBillAvailable,
} from '../../utils/pricingUtils'

// ----------------- HELPER EXTRACTORS -----------------
const extractWarrantyRange = (qna) => {
  let warrantyRange = 'out_of_warranty'
  const billAvailable = isBillAvailable(qna.Accessories)
  const warrantyItem = qna.Warranty?.find((item) => item.key === 'yes')

  if (warrantyItem && billAvailable) {
    const caption = warrantyItem.quetion || ''
    if (caption === 'Below 3 Months ') {
      warrantyRange = '0_3_months'
    } else if (caption === 'Between 3 months - 6 months') {
      warrantyRange = '3_6_months'
    } else if (caption === 'Between 6months - 11 months') {
      warrantyRange = '6_11_months'
    } else if (caption === 'Above 11 months') {
      warrantyRange = 'above_11_months'
    }
  }
  return warrantyRange
}

const extractAccessories = (qna) => {
  const accessories = {
    boxMissing: false,
    cableMissing: false,
    strapMissing: false,
  }
  qna.Accessories?.forEach((item) => {
    if (item.key === 'yes') {
      const caption = item.quetion?.toLowerCase() || ''
      if (caption.includes('box')) {
        accessories.boxMissing = true
      } else if (caption.includes('cable') || caption.includes('charger')) {
        accessories.cableMissing = true
      } else if (caption.includes('strap')) {
        accessories.strapMissing = true
      }
    }
  })
  return accessories
}

const buildFinalPayload = (id, qna, profile, warrantyRange, accessories) => ({
  QNA: qna,
  phoneNumber: id?.phoneNumber || '123456789',
  aadharNumber: id?.aadharNumber || '123456789012',
  modelId: id?.models?._id,
  storage: id?.models?.config?.storage,
  ram: id?.models?.config?.RAM,
  name: id?.customerName || profile?.name,
  pricingAdjustment: { warrantyRange, accessories },
})

const saveBillData = (finalPayload) => {
  const billData = finalPayload.QNA.Accessories.find(
    (item) => item.quetion && item.quetion.toLowerCase().includes('bill')
  )
  if (billData) {
    sessionStorage.setItem('billData', JSON.stringify(billData))
  } else {
    sessionStorage.setItem(
      'billData',
      JSON.stringify(finalPayload.QNA.Cosmetics[6])
    )
  }
}

const getDevicePrice = () => {
  try {
    const dataModel = JSON.parse(sessionStorage.getItem('dataModel'))
    return dataModel?.models?.config.price || 0
  } catch {
    return 0
  }
}

const calculateAdjustedPrice = (response, warrantyRange, accessories) => {
  const devicePrice = response.data.data.price || 0
  const aPlusPrice = getDevicePrice()
  const deviceType = getDeviceType()

  const priceBreakdown = calculateFinalPrice(
    aPlusPrice,
    devicePrice,
    deviceType,
    warrantyRange,
    accessories
  )

  sessionStorage.setItem('priceBreakdown', JSON.stringify(priceBreakdown))

  const backendResponse = response.data.data
  const adjustedPrice = priceBreakdown.finalPrice
  const finalPrice =
    adjustedPrice && adjustedPrice > 0 ? adjustedPrice : backendResponse.price

  return {
    ...backendResponse,
    price: finalPrice,
    originalPrice: backendResponse.price,
    warrantyUplift: priceBreakdown.warrantyUplift || 0,
    accessoriesDeduction: priceBreakdown.accessoriesDeduction || 0,
    priceBreakdown,
    bonus: 0,
  }
}

const logQuickQuoteAttempt = async (quoteResult, deviceModel) => {
  const token = sessionStorage.getItem('authToken')
  if (!token || !quoteResult?.id || !deviceModel?.models?._id) {
    return
  }

  const logPayload = {
    quoteType: 'Get Exact Value',
    quoteAmount: quoteResult.price,
    grade: quoteResult.grade,
    deviceDetails: {
      modelId: deviceModel?.models?._id,
      name: deviceModel?.models?.name,
      brandId: deviceModel?.models?.brandId,
      categoryName: deviceModel?.models?.categoryInfo?.categoryName,
      ram: deviceModel?.models?.config?.RAM,
      rom: deviceModel?.models?.config?.storage,
      series: deviceModel?.models?.series,
    },
  }
  try {
    await axios.post(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/quoteTracking/log-quote-attempt`,
      logPayload,
      { headers: { Authorization: token } }
    )
  } catch (error) {
    console.error('Error logging Quick Quote attempt:', error)
  }
}

// ----------------- FOOTER UI -----------------
const SubmitFooter = ({ handleSubmit, handleSubtract, isLoading }) => (
  <div className='fixed bottom-0 flex justify-center w-full gap-2 p-3 bg-white border-t-2'>
    <div
      onClick={handleSubtract}
      className='bg-primary w-[30%] px-6 py-2 rounded-lg flex items-center justify-center'
    >
      <ImArrowLeft color='white' size={20} />
    </div>
    <div
      onClick={handleSubmit}
      className='bg-primary w-[70%] relative text-center py-1 px-2 rounded-lg cursor-pointer flex justify-between text-white items-center'
    >
      {isLoading && (
        <CgSpinner
          size={20}
          className='absolute left-[18%] top-[8px] mt-1 animate-spin'
        />
      )}
      <p className='w-full p-1 text-xl font-medium'>
        {isLoading ? 'Submitting' : 'Submit'}
      </p>
    </div>
  </div>
)

const ContinueFooter = ({
  visible,
  availableParts,
  handleSubtract,
  handleADD,
}) => (
  <div className='fixed bottom-0 justify-center flex w-full gap-2 p-3 bg-white border-t-2'>
    {visible > 0 && visible <= availableParts.length && (
      <button
        onClick={handleSubtract}
        className={`${
          visible < 2
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-primary cursor-pointer'
        } w-[30%] px-6 py-2 rounded-lg flex items-center justify-center`}
      >
        <ImArrowLeft color='white' size={20} />
      </button>
    )}
    <div
      onClick={handleADD}
      className='bg-primary w-[70%] py-1 px-2 text-center rounded-lg cursor-pointer flex justify-between text-white items-center'
    >
      <p className='w-full p-1 text-xl font-medium'>Continue</p>
    </div>
  </div>
)

// ----------------- MAIN COMPONENT -----------------
const AboveSix = ({
  visible,
  setVisible,
  updateAns,
  showPopup,
  qna,
  profile,
  availableParts,
}) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleADD = () => {
    if (showPopup === false && visible < availableParts.length) {
      setVisible(visible + 1)
    }
  }

  const handleSubtract = () => {
    if (visible > 1) {
      setVisible(visible - 1)
    }
  }

  const handleSubmit = async () => {
    const id = JSON.parse(sessionStorage.getItem('dataModel'))
    const userToken2 = sessionStorage.getItem('authToken')
    setIsLoading(true)

    const warrantyRange = extractWarrantyRange(qna)
    const accessories = extractAccessories(qna)
    const finalPayload = buildFinalPayload(
      id,
      qna,
      profile,
      warrantyRange,
      accessories
    )

    saveBillData(finalPayload)

    const response = await axios.post(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/questionnaires/calculatePrice`,
      finalPayload,
      { headers: { Authorization: userToken2 } }
    )

    const adjustedResponse = calculateAdjustedPrice(
      response,
      warrantyRange,
      accessories
    )
    await logQuickQuoteAttempt(response.data.data, id)

    sessionStorage.setItem('responsedatadata', JSON.stringify(adjustedResponse))
    sessionStorage.setItem('ExactQuote', true)
    sessionStorage.setItem('LeadId', response.data.data.id)

    store.dispatch(setResponseData(adjustedResponse))
    setIsLoading(false)
    navigate('/devicequote')
  }

  return (
    <React.Fragment>
      {visible >= availableParts.length ? (
        <SubmitFooter
          handleSubmit={handleSubmit}
          handleSubtract={handleSubtract}
          isLoading={isLoading}
        />
      ) : (
        <ContinueFooter
          visible={visible}
          availableParts={availableParts}
          handleSubtract={handleSubtract}
          handleADD={handleADD}
        />
      )}
    </React.Fragment>
  )
}

export default AboveSix
