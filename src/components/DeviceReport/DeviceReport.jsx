import React from 'react'
import styles from './DeviceReport.module.css'
import { useSelector } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import { LuDot } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

const PRIMARY_COLOR = 'var(--primary-color)'
const PRIMARY_BG_LIGHT = 'rgba(236, 39, 82, 0.1)' // 🔹 extracted constant
const PRIMARY_BG_LIGHTER = 'rgba(236, 39, 82, 0.05)'
const PRIMARY_BORDER = 'rgba(236, 39, 82, 0.2)'

// Shared helper function to render a single question without options
const renderQuestionWithoutOptions = (questionData, answer, index) => (
  <div
    key={index}
    className='flex flex-row items-center w-full p-3 rounded-lg border'
    style={{
      backgroundColor: PRIMARY_BG_LIGHTER,
      borderColor: PRIMARY_BORDER,
    }}
  >
    <LuDot size={20} className='shrink-0' style={{ color: PRIMARY_COLOR }} />
    <div className='flex justify-between w-[85%] questionkey'>
      <p className='text-sm font-medium text-gray-800'>
        {questionData.quetion}
      </p>
      <span
        className='ml-2 text-xs font-semibold px-2 py-1 rounded-full uppercase'
        style={{
          backgroundColor: PRIMARY_BG_LIGHT,
          color: PRIMARY_COLOR,
        }}
      >
        {answer?.key}
      </span>
    </div>
  </div>
)

// Shared helper function to render a single option with selection
const renderOption = (option, isSelected, questionIndex, optionIndex) => (
  <div
    key={`${questionIndex}-${optionIndex}`}
    className='flex flex-row items-center w-full p-3 rounded-lg border'
    style={{
      backgroundColor: isSelected
        ? PRIMARY_BG_LIGHTER
        : 'rgba(107, 114, 128, 0.05)',
      borderColor: isSelected ? PRIMARY_BORDER : 'rgba(107, 114, 128, 0.2)',
    }}
  >
    <LuDot
      size={20}
      className='shrink-0'
      style={{ color: isSelected ? PRIMARY_COLOR : '#9CA3AF' }}
    />
    <div className='flex justify-between w-[85%] questionkey'>
      <p
        className={`text-sm font-medium ${
          isSelected ? 'text-gray-800' : 'text-gray-600'
        }`}
      >
        {option.caption}
      </p>
      <span
        className='ml-2 text-xs font-semibold px-2 py-1 rounded-full'
        style={{
          backgroundColor: isSelected
            ? PRIMARY_BG_LIGHT
            : 'rgba(107, 114, 128, 0.1)',
          color: isSelected ? PRIMARY_COLOR : '#6B7280',
        }}
      >
        {isSelected ? 'YES' : 'NO'}
      </span>
    </div>
  </div>
)

// Main function simplified
const renderQuestionOptions = (selectedAnswers, rawQuestionsGroup) => {
  const hasRawQuestions = !!rawQuestionsGroup?.length
  const hasSelectedAnswers = !!selectedAnswers?.length

  if (!hasRawQuestions) {
    return renderDirectAnswers(selectedAnswers, hasSelectedAnswers)
  }

  return renderGroupedQuestions(rawQuestionsGroup, selectedAnswers)
}

// --- Helper: Render direct answers (quick quote scenario) ---
const renderDirectAnswers = (selectedAnswers, hasSelectedAnswers) => {
  if (!hasSelectedAnswers) {
    return null
  }

  return selectedAnswers.map((answer, index) => renderAnswerItem(answer, index))
}

// --- Helper: Render single answer item ---
const renderAnswerItem = (answer, index) => {
  const isYes = answer.key === 'yes'

  return (
    <div
      key={index}
      className='flex flex-row items-center w-full p-3 rounded-lg border'
      style={{
        backgroundColor: isYes
          ? PRIMARY_BG_LIGHTER
          : 'rgba(107, 114, 128, 0.05)',
        borderColor: isYes ? PRIMARY_BORDER : 'rgba(107, 114, 128, 0.2)',
      }}
    >
      <LuDot
        size={20}
        className='shrink-0'
        style={{ color: isYes ? PRIMARY_COLOR : '#6B7280' }}
      />
      <div className='flex justify-between w-[85%] questionkey'>
        <p className='text-sm font-medium text-gray-800'>{answer.quetion}</p>
        <span
          className='ml-2 text-xs font-semibold px-2 py-1 rounded-full uppercase'
          style={{
            backgroundColor: isYes
              ? PRIMARY_BG_LIGHT
              : 'rgba(107, 114, 128, 0.1)',
            color: isYes ? PRIMARY_COLOR : '#6B7280',
          }}
        >
          {answer?.key}
        </span>
      </div>
    </div>
  )
}

// --- Helper: Render grouped question sets ---
const renderGroupedQuestions = (rawQuestionsGroup, selectedAnswers) => {
  return rawQuestionsGroup
    .map((questionData, questionIndex) => {
      const answer = selectedAnswers[questionIndex]
      return questionData.options?.length
        ? renderOptionsList(questionData.options, answer, questionIndex)
        : renderQuestionWithoutOptions(questionData, answer, questionIndex)
    })
    .flat()
    .filter(Boolean)
}

// --- Helper: Render all options for a given question ---
const renderOptionsList = (options, answer, questionIndex) => {
  return options.map((option, optionIndex) =>
    renderOption(
      option,
      answer?.selected?.[optionIndex],
      questionIndex,
      optionIndex
    )
  )
}

const DeviceReport = ({ setShowDeviceReport, quoteSaved }) => {
  const exactQuoteValue = sessionStorage.getItem('ExactQuote')
  const DeviceType = sessionStorage.getItem('DeviceType')
  const isWatch = DeviceType === 'Watch'
  const navigate = useNavigate()

  let data = useSelector((state) => state.qna)
  const watchdata = useSelector((state) => state.watchQNA)
  const quickData = useSelector((state) => state.qnaQuick)
  const rawQuestions = useSelector((state) => state.qna.rawQuestions)

  if (isWatch) {
    data = watchdata
  }

  const closeHandler = () => setShowDeviceReport(false)

  const clickHandler = () => {
    if (!isWatch) {
      if (exactQuoteValue === 'true') {
        navigate('/device/Qestions')
      } else {
        navigate('/QuickQuote')
      }
    } else {
      navigate('/watchQs')
    }
  }

  return (
    <div className={`${styles.devrep_page} z-50 select-none`}>
      <div className={`${styles.devrep_wrap}`}>
        <div className={`${styles.devrep_nav}`}>
          <div className='flex-1 flex items-center'>
            <p
              className='px-2 text-xl font-medium border-r-2 cursor-default'
              style={{
                color: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
              }}
            >
              Device Report
            </p>
            {!quoteSaved && (
              <p
                onClick={clickHandler}
                className='cursor-pointer pl-2 text-sm font-medium text-primary underline underline-offset-2 hover:underline-offset-4'
              >
                Modify Answers
              </p>
            )}
          </div>
          <button
            onClick={closeHandler}
            className='ml-4 p-2 rounded-full transition-colors duration-200 flex items-center justify-center'
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = PRIMARY_BG_LIGHT)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
            aria-label='Close device report'
          >
            <IoClose
              size={24}
              className='hover:opacity-80'
              style={{ color: PRIMARY_COLOR }}
            />
          </button>
        </div>
        <CoreCosDis
          data={data}
          quickData={quickData}
          rawQuestions={rawQuestions}
          exactQuoteValue={exactQuoteValue}
        />
        {data?.Accessories.length > 0 && (
          <QuestionSection
            title='Accessories'
            data={data?.Accessories}
            quickData={quickData?.Accessories}
            rawQuestions={rawQuestions?.Accessories}
            exactQuoteValue={exactQuoteValue}
          />
        )}
        {data?.Functional.length > 0 && (
          <QuestionSection
            title='Functional'
            data={data?.Functional}
            quickData={quickData?.Functional}
            rawQuestions={rawQuestions?.Functional}
            exactQuoteValue={exactQuoteValue}
          />
        )}
        {data?.Physical && (
          <QuestionSection
            title='Physical'
            data={data?.Physical}
            quickData={quickData?.Physical}
            rawQuestions={rawQuestions?.Physical}
            exactQuoteValue={exactQuoteValue}
          />
        )}
        <>
          <FunctionalList
            title='Functional Major'
            data={data?.Functional_major}
            quickData={quickData?.Functional_major}
            rawQuestions={rawQuestions?.Functional_major}
            exactQuoteValue={exactQuoteValue}
          />
          <FunctionalList
            title='Functional Minor'
            data={data?.Functional_minor}
            quickData={quickData?.Functional_minor}
            rawQuestions={rawQuestions?.Functional_minor}
            exactQuoteValue={exactQuoteValue}
          />
        </>
        <QuestionSection
          title='Warranty'
          data={data?.Warranty}
          quickData={quickData?.Warranty}
          rawQuestions={rawQuestions?.Warranty}
          exactQuoteValue={exactQuoteValue}
          showQuestionHeader="What is your phone's age?"
        />
      </div>
    </div>
  )
}

export default DeviceReport

// Helper component for rendering question sections
const QuestionSection = ({
  title,
  data,
  quickData,
  rawQuestions,
  exactQuoteValue,
  showQuestionHeader,
}) => {
  const selectedAnswers = exactQuoteValue === 'false' ? quickData : data

  if (title === 'Warranty' && (!rawQuestions || rawQuestions.length === 0)) {
    return (
      <div className={`${styles.ques_box}`}>
        <p className={`${styles.ques_head} font-medium text-base`}>{title}</p>
        {showQuestionHeader && (
          <div className='flex div'>
            <LuDot
              size={25}
              className='shrink-0'
              style={{ color: PRIMARY_COLOR }}
            />
            <p className='text-sm font-medium opacity-[0.8]'>
              {showQuestionHeader}
            </p>
          </div>
        )}
        <div className={`${styles.ques_wrap}`}>
          {selectedAnswers?.map((item) => (
            <div key={item.index} className='flex flex-row items-center w-full'>
              {item.key === 'yes' && (
                <div className='flex justify-between w-[85%] questionkey'>
                  <p className='text-sm font-medium opacity-60 ml-[30px]'>
                    {item.quetion}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.ques_box}`}>
      <p className={`${styles.ques_head} font-medium text-base`}>{title}</p>
      <div className={`${styles.ques_wrap}`}>
        {renderQuestionOptions(selectedAnswers, rawQuestions)}
      </div>
    </div>
  )
}

const CoreCosDis = ({ data, quickData, rawQuestions, exactQuoteValue }) => (
  <React.Fragment>
    {(quickData?.Core.length > 0 || data?.Core.length > 0) && (
      <div className={`${styles.ques_box}`}>
        <p className={`${styles.ques_head} font-medium text-base`}>Core</p>
        <div className={`${styles.ques_wrap}`}>
          {renderQuestionOptions(
            exactQuoteValue === 'false'
              ? quickData?.Core.slice(0, 2)
              : data?.Core,
            rawQuestions?.Core
          )}
        </div>
      </div>
    )}
    {(quickData?.Cosmetics.length > 0 || data?.Cosmetics.length > 0) && (
      <div className={`${styles.ques_box}`}>
        <p className={`${styles.ques_head} font-medium text-base`}>Cosmetics</p>
        <div className={`${styles.ques_wrap}`}>
          {renderQuestionOptions(
            exactQuoteValue === 'false'
              ? quickData?.Cosmetics.slice(0, 2)
              : data?.Cosmetics,
            rawQuestions?.Cosmetics
          )}
        </div>
      </div>
    )}
    {(quickData?.Display.length > 0 || data?.Display.length > 0) && (
      <div className={`${styles.ques_box}`}>
        <p className={`${styles.ques_head} font-medium text-base`}>Display</p>
        <div className={`${styles.ques_wrap}`}>
          {renderQuestionOptions(
            exactQuoteValue === 'false'
              ? quickData?.Display.slice(0, 2)
              : data?.Display,
            rawQuestions?.Display
          )}
        </div>
      </div>
    )}
  </React.Fragment>
)

const FunctionalList = ({
  title,
  data,
  quickData,
  rawQuestions,
  exactQuoteValue,
}) => {
  const items = exactQuoteValue === 'false' ? quickData?.slice(0, 2) : data

  if (!items?.length) {
    return null
  }

  return (
    <div className={`${styles.ques_box}`}>
      <p className={`${styles.ques_head} font-medium text-base`}>{title}</p>
      <div className={`${styles.ques_wrap}`}>
        {renderQuestionOptions(items, rawQuestions)}
      </div>
    </div>
  )
}
