import React, { useEffect, useReducer, useState } from 'react'
import './newDeviceqs.scss'
import { useQuestionContext } from '../../components/QuestionContext'
import axios from 'axios'
import store from '../../store/store'
import { useSelector } from 'react-redux'
import banner from '../../assets/banner.jpg'
import MainQContainer from '../../components/NewDeviceqs/MainQContainer'
import FirstPart from '../../components/NewDeviceqs/FirstPart'
import SecondPart from '../../components/NewDeviceqs/SecondPart'
import ThirdPart from '../../components/NewDeviceqs/ThirdPart'
import FourthPart from '../../components/NewDeviceqs/FourthPart'
import FifthPart from '../../components/NewDeviceqs/FifthPart'
import SixthPart from '../../components/NewDeviceqs/SixthPart'
import SeventhPart from '../../components/NewDeviceqs/SeventhPart'
import EighthPart from '../../components/NewDeviceqs/EighthPart'
import { setGroupAnswers, setRawQuestions } from '../../store/slices/QNAslice'
import useUserProfile from '../../utils/useUserProfile'
import styless from '../QuickQuote/QuickQuote.module.css'
import { initialState, qnaReducer } from '../../utils/qnaReducer'

const GROUPS = [
  'Core',
  'Cosmetics',
  'Display',
  'Accessories',
  'Functional',
  'Functional_major',
  'Functional_minor',
  'Warranty',
]

const createDefaultSelected = (length, fillTrue = false) =>
  Array(length).fill(fillTrue)

const createAnswer = (questionData, answer) => {
  const { group, options, yes, no, quetion } = questionData

  // Case 1: both yes/no equal to default answer
  if (yes === answer && no === answer) {
    return {
      quetion,
      answer,
      key: 'no',
      group,
      selected: createDefaultSelected(options.length, false),
    }
  }

  // Case 2: default answer equals yes
  if (yes === answer) {
    if (group === 'Accessories') {
      // Accessories → start unselected
      return {
        quetion,
        answer: no,
        key: 'no',
        group,
        selected: createDefaultSelected(options.length, false),
      }
    }

    if (group === 'Warranty') {
      // Warranty → select "out of warranty"
      const outOfWarrantyIndex = options.findIndex((option) =>
        option.caption.toLowerCase().includes('out of warranty'),
      )
      const selected = createDefaultSelected(options.length, false)
      if (outOfWarrantyIndex !== -1) {
        selected[outOfWarrantyIndex] = true
      }
      return { quetion, answer, key: 'yes', group, selected }
    }

    // Default for other groups
    return {
      quetion,
      answer,
      key: 'yes',
      group,
      selected: createDefaultSelected(options.length, true),
    }
  }

  // Case 3: default answer equals no
  return {
    quetion,
    answer,
    group,
    key: 'no',
    selected: createDefaultSelected(options.length, false),
  }
}

const NewDeviceqs = () => {
  const userToken = sessionStorage.getItem('authToken')
  const DeviceType = sessionStorage.getItem('DeviceType')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { answers, setAnswers } = useQuestionContext()
  const [visible, setVisible] = useState(1)
  const [newGroupanswers, setNewGroupAnswers] = useState()
  const profile = useUserProfile()
  const core = useSelector((state) => state.qna.Core)
  const Cosmetics = useSelector((state) => state.qna.Cosmetics)
  const Display = useSelector((state) => state.qna.Display)
  const Accessories = useSelector((state) => state.qna.Accessories)
  const Functional = useSelector((state) => state.qna.Functional)
  const FunctionalMajor = useSelector((state) => state.qna.Functional_major)
  const FunctionalMinor = useSelector((state) => state.qna.Functional_minor)
  const Warranty = useSelector((state) => state.qna.Warranty)
  const [showPopup, setShowPopup] = useState(true)
  const [NDstate, dispatch] = useReducer(qnaReducer, initialState)
  const qna = useSelector((state) => state.qna)

  console.log(profile, 'arijit')

  const fetchData = async () => {
    try {
      const apiUrl = `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/questionnaires/findAll?page=0&limit=99&type=${DeviceType}`

      const response = await axios.get(apiUrl, {
        headers: { authorization: `${userToken}` },
      })

      // Sort by viewOn
      const sortedData = response.data.data.sort((a, b) => a.viewOn - b.viewOn)

      GROUPS.forEach((group) => {
        const answersTemp = sortedData.filter((q) => q.group === group)
        dispatch({ type: 'SET_GROUP_ANSWERS', group, answers: answersTemp })
        store.dispatch(setRawQuestions({ group, questions: answersTemp }))
      })

      if (answers.length === 0) {
        const newAnswers = sortedData.map((q) => createAnswer(q, q.default))

        setAnswers(newAnswers)
        setNewGroupAnswers(newAnswers)

        GROUPS.forEach((group) => {
          const answersTemp = newAnswers.filter((q) => q.group === group)
          store.dispatch(setGroupAnswers({ group, answers: answersTemp }))
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [visible])

  const updateAns = (group) => {
    const filteredAnswers = newGroupanswers.filter(
      (question) => question.group === group,
    )
    store.dispatch(setGroupAnswers({ group, filteredAnswers }))
    if (showPopup === false) {
      setVisible(visible + 1)
    }
  }

  const parts = [
    { component: FirstPart, data: NDstate.Core, slice: core },
    { component: SixthPart, data: NDstate.Functional, slice: Functional },
    { component: SecondPart, data: NDstate.Cosmetics, slice: Cosmetics },
    { component: ThirdPart, data: NDstate.Display, slice: Display },
    {
      component: FourthPart,
      data: NDstate.Functional_major,
      slice: FunctionalMajor,
    },
    {
      component: FifthPart,
      data: NDstate.Functional_minor,
      slice: FunctionalMinor,
    },
    { component: SeventhPart, data: NDstate.Accessories, slice: Accessories },
    { component: EighthPart, data: NDstate.Warranty, slice: Warranty },
  ]

  const availableParts = parts.filter(
    (part) => part.data && part.data.length > 0,
  )

  return (
    <>
      <div className={`popup ${showPopup ? 'show' : ''}`}>
        <img className='object-contain' src={banner} alt='banner' />
        <div className='text'>
          Help us calculate your device value correctly by answering to the
          following questions
        </div>
        <button onClick={() => setShowPopup(false)}> Got it</button>
      </div>
      <MainQContainer
        NDstate={NDstate}
        setIsSearchOpen={setIsSearchOpen}
        isSearchOpen={isSearchOpen}
        dispatch={dispatch}
        visible={visible}
        availableParts={availableParts}
        setVisible={setVisible}
        updateAns={updateAns}
        showPopup={showPopup}
        qna={qna}
        profile={profile}
        styless={styless}
      />
    </>
  )
}
export default NewDeviceqs
