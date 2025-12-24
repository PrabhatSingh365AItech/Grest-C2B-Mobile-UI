import React from 'react'
import {
  updateCoreObjects,
  updateCosmeticsObjects,
  updateDisplayObjects,
  updateFunctionalMajorObjects,
  updateFunctionalMinorObjects,
  updateWarrantyObjects,
} from '../store/slices/quickQNAslice'

const PinkBgWhText = 'bg-primary text-white'

const RadioOption = ({ value, label, isSelected, onChange }) => (
  <label
    className={`text-primary font-medium w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
      isSelected ? PinkBgWhText : ''
    }`}
  >
    <input
      type='radio'
      value={value}
      onChange={onChange}
      checked={isSelected}
    />
    {label}
  </label>
)

const QuestionsElement = ({ State, Task, dispatch, currentIndex, taskFun }) => (
  <div className='containClass'>
    {State &&
      State.map((data, index) => (
        <div className='flex flex-col gap-4 mb-4 one' key={data._id}>
          <div className='flex items-baseline gap-1 two'>
            <p className='font-medium text-xl'>{index + currentIndex}.</p>
            <p className='text-xl three'>{data.quetion}</p>
          </div>
          <div className='max-w-[500px] flex gap-4 ml-3 lableconatiner'>
            {['yes', 'no'].map((key) => (
              <RadioOption
                key={key}
                value={data[key]}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                isSelected={Task[index].answer === data[key]}
                onChange={() =>
                  dispatch(
                    taskFun({ index, newAnswer: data[key], newKey: key })
                  )
                }
              />
            ))}
          </div>
          <div className='border-b-2 opacity-10 border-[#595555]'></div>
        </div>
      ))}
  </div>
)

const QuestionList = ({
  QQState,
  core,
  dispatch,
  Cosmetics,
  Display,
  FunctionalMajor,
  FunctionalMinor,
  Warranty,
}) => {
  const sections = [
    { key: 'Core', task: core, index: 1, updater: updateCoreObjects },
    {
      key: 'Cosmetics',
      task: Cosmetics,
      index: 3,
      updater: updateCosmeticsObjects,
    },
    { key: 'Display', task: Display, index: 5, updater: updateDisplayObjects },
    {
      key: 'Functional_major',
      task: FunctionalMajor,
      index: 7,
      updater: updateFunctionalMajorObjects,
    },
    {
      key: 'Functional_minor',
      task: FunctionalMinor,
      index: 9,
      updater: updateFunctionalMinorObjects,
    },
    {
      key: 'Warranty',
      task: Warranty,
      index: 11,
      updater: updateWarrantyObjects,
    },
  ]

  return (
    <div className='questionList'>
      {sections.map(({ key, task, index, updater }) => (
        <QuestionsElement
          key={key}
          State={QQState[key]}
          Task={task}
          dispatch={dispatch}
          currentIndex={index}
          taskFun={updater}
        />
      ))}
    </div>
  )
}

export default QuestionList
