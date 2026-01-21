import { useNavigate } from 'react-router-dom'
import { useEffect, useReducer, useState } from 'react'
const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg'

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO
import { IoIosArrowBack } from 'react-icons/io'
import ProfileBox from '../../components/ProfileBox/ProfileBox'
import { useQuestionContext } from '../../components/QuestionContext'
import axios from 'axios'
import { setGroupAnswerss } from '../../store/slices/quickQNAslice'
import { useDispatch, useSelector } from 'react-redux'
import '../DeviceDetailnew/newDeviceqs.scss'
import styless from './QuickQuote.module.css'
import { CgSpinner } from 'react-icons/cg'
import useUserProfile from '../../utils/useUserProfile'
import { setResponseData } from '../../store/slices/responseSlice'
import { IoArrowBack } from 'react-icons/io5'
import QuestionList from '../../components/QuestionList'
import { logQuickQuoteAttempt, reducer } from '../../utils/quickQuoteUtils'

const initialState = {
  Core: [],
  Cosmetics: [],
  Display: [],
  Functional_major: [],
  Functional_minor: [],
  Warranty: [],
}

// Header Component
const QuickQuoteHeader = ({ navigate }) => {
  return (
    <div className='flex items-center w-screen py-4 h-16 border-b-2 bg-white HEADER header'>
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
  )
}

// Submit Button Component
const SubmitButton = ({ handlesubmit, isLoading }) => {
  return (
    <div className='fixed bottom-0 flex flex-col w-full gap-2 p-4 bg-white border-t-2'>
      <div
        onClick={handlesubmit}
        className='bg-primary text-center relative py-1 px-2 rounded-lg cursor-pointer flex justify-between text-white items-center'
      >
        {isLoading && (
          <CgSpinner
            size={20}
            className='mt-1 absolute left-[28%] top-[8px] animate-spin'
          />
        )}
        <p className='w-full p-1 text-xl font-medium'>
          {isLoading ? 'Submitting' : 'Submit'}
        </p>
      </div>
    </div>
  )
}

// Fetch questionnaire data
const fetchQuestionnaireData = async (
  userToken,
  Dispatch,
  answersQuick,
  setAnswersQUICK,
  dispatch
) => {
  try {
    const apiUrl = `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/questionnaires/findAll?page=0&limit=31`

    const response = await axios.get(apiUrl, {
      headers: { authorization: `${userToken}` },
    })

    const groups = [
      'Core',
      'Cosmetics',
      'Display',
      'Functional_major',
      'Functional_minor',
      'Warranty',
    ]

    groups.forEach((group) => {
      const answers = response.data.data
        .filter((question) => question.group === group)
        .slice(0, group !== 'Warranty' ? 2 : undefined)
      Dispatch({ type: 'SET_GROUP_ANSWERS', group, answers })
    })

    const newPopulateAnswers = response.data.data.map((ele) => ele.default)

    if (answersQuick.length === 0) {
      const newAnswers = newPopulateAnswers.map((answer, index) => {
        return {
          quetion: response.data.data[index].quetion,
          answer,
          key: response.data.data[index].yes === answer ? 'yes' : 'no',
          group: response.data.data[index].group,
        }
      })
      setAnswersQUICK(newAnswers)

      groups.forEach((group) => {
        const answers = newAnswers.filter(
          (question) => question.group === group
        )
        dispatch(setGroupAnswerss({ group, answers }))
      })
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Fetch stores for user
const fetchUserStores = async (setSelectedStoreId) => {
  try {
    const token = sessionStorage.getItem('authToken')
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store/findAll`,
      { headers: { Authorization: token } }
    )

    const storeList = response.data.result || []

    if (storeList.length === 1) {
      setSelectedStoreId(storeList[0]._id)
    }

    const savedStoreId = sessionStorage.getItem('selectedQuickQuoteStoreId')
    if (savedStoreId && storeList.find((s) => s._id === savedStoreId)) {
      setSelectedStoreId(savedStoreId)
    }
  } catch (error) {
    console.error('Failed to fetch stores:', error)
    // REMOVED: setStoreError call as storeError is unused
  }
}

/* ==================== MAIN COMPONENT ==================== */

const QuickQuote = () => {
  const navigate = useNavigate()
  const { answersQuick, setAnswersQUICK } = useQuestionContext()
  const dispatch = useDispatch()
  const core = useSelector((state) => state.qnaQuick.Core)
  const Cosmetics = useSelector((state) => state.qnaQuick.Cosmetics)
  const Display = useSelector((state) => state.qnaQuick.Display)
  const FunctionalMajor = useSelector(
    (state) => state.qnaQuick.Functional_major
  )
  const FunctionalMinor = useSelector(
    (state) => state.qnaQuick.Functional_minor
  )
  const Warranty = useSelector((state) => state.qnaQuick.Warranty)
  const qnaQuick = useSelector((state) => state.qnaQuick)
  const [isLoading, setIsLoading] = useState(false)
  const profile = useUserProfile()
  const [selectedStoreId, setSelectedStoreId] = useState('')

  // Issue 2 & 3: Removed unused 'storeError' state variable
  // Previously: const [storeError, setStoreError] = useState('')
  // This was only used in commented-out store selection dropdown (lines 260-284)

  const backHandler = () => {
    navigate('/selectmodel')
  }

  const [QQState, Dispatch] = useReducer(reducer, initialState)

  // Fetch questionnaire data
  useEffect(() => {
    const userToken = sessionStorage.getItem('authToken')
    fetchQuestionnaireData(
      userToken,
      Dispatch,
      answersQuick,
      setAnswersQUICK,
      dispatch
    )

    const token = sessionStorage.getItem('authToken')
    if (!token) {
      navigate('/')
    }
  }, [])

  // Fetch stores
  useEffect(() => {
    fetchUserStores(setSelectedStoreId)
  }, [])

  const handlesubmit = async () => {
    // REMOVED: Store validation as dropdown is commented out
    // Previously checked: if (!selectedStoreId) { setStoreError(...) }

    setIsLoading(true)
    // REMOVED: setStoreError('') call

    try {
      const token = sessionStorage.getItem('authToken')
      let id = sessionStorage.getItem('dataModel')
      id = JSON.parse(id)

      const finalPayload = {
        QNA: qnaQuick,
        phoneNumber: '123456789',
        modelId: id?.models?._id,
        storage: id?.models?.config?.storage,
        ram: id?.models?.config?.RAM,
        aadharNumber: '1234567890',
        name: profile?.name,
        storeId: selectedStoreId,
      }

      const { data } = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/calculatePrice`,
        finalPayload,
        { headers: { Authorization: `${token}` } }
      )

      sessionStorage.setItem('selectedQuickQuoteStoreId', selectedStoreId)

      await logQuickQuoteAttempt(data.data, id, token)
      sessionStorage.setItem('LeadId', data.data.id)
      sessionStorage.setItem(
        'responsedatadata',
        JSON.stringify({ ...data.data, bonus: 0 })
      )
      sessionStorage.setItem('ExactQuote', false)
      dispatch(setResponseData({ ...data.data, bonus: 0 }))
      setIsLoading(false)
      navigate('/devicequote')
    } catch (error) {
      console.error('Error submitting quick quote:', error)
      // REMOVED: setStoreError call as storeError is unused
      setIsLoading(false)
    }
  }

  return (
    <div className='mainQContainer'>
      <QuickQuoteHeader navigate={navigate} />

      <div className={`${styless.quick_page_nav}`}>
        <IoIosArrowBack
          className='ml-2 text-primary'
          size={25}
          onClick={backHandler}
        />
        <p className='ml-2 font-medium text-xl'>Device Details</p>
      </div>

      <div className='innerContainer'>
        <div className='maindata'>
          <div className='text-lg font-medium tracking-tight text-{1.325rem}'>
            Tell us more about your device?
          </div>
          <div className='underline'></div>

          {/* Store Selection Dropdown - COMMENTED OUT */}
          {/* ✅ NOTE: storeError was only used here, which is why it was removed */}
          {/* <div className='mb-6 mt-4'>
            <label className='block text-sm font-medium mb-2 text-gray-700'>
              Select Store <span className='text-red-500'>*</span>
            </label>
            <select
              value={selectedStoreId}
              onChange={(e) => {
                setSelectedStoreId(e.target.value)
                setStoreError('')
              }}
              className={`w-full p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary ${
                storeError ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value=''>-- Select a store --</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.storeName} {store.region ? `- ${store.region}` : ''}
                </option>
              ))}
            </select>
            {storeError && (
              <p className='text-red-500 text-sm mt-1'>{storeError}</p>
            )}
            {stores.length === 0 && !storeError && (
              <p className='text-gray-500 text-sm mt-1'>No stores available</p>
            )}
          </div> */}

          <QuestionList
            QQState={QQState}
            core={core}
            dispatch={dispatch}
            Cosmetics={Cosmetics}
            Display={Display}
            FunctionalMajor={FunctionalMajor}
            FunctionalMinor={FunctionalMinor}
            Warranty={Warranty}
          />
        </div>
      </div>

      <SubmitButton handlesubmit={handlesubmit} isLoading={isLoading} />
    </div>
  )
}

export default QuickQuote
