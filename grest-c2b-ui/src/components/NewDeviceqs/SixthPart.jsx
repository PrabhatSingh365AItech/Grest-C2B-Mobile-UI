import React from 'react'
import { updateFunctionalObject } from '../../store/slices/QNAslice'
import imageMap from '../../utils/imageMap'
import store from '../../store/store'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

const SixthPart = ({ NDstate, slice }) => {
  return (
    <div className='containClass'>
      <div className='text-sm text-[#676767] py-1 font-medium text-center text-pretty'>
        <p>Please choose appropriate condition to get accurate quote</p>
      </div>
      <div className='grid grid-cols-2 gap-y-3 gap-x-[4%]'>
        {NDstate?.Functional &&
          NDstate?.Functional.map((data, index) => (
            <div
              key={data._id}
              className={`${
                slice[index]?.answer === data.yes ? pinkBg : whiteBg
              } flex flex-col justify-start items-center shadow-lg rounded-lg px-3`}
              onClick={() => {
                if (slice[index]?.answer === data.yes) {
                  store.dispatch(
                    updateFunctionalObject({
                      index: index,
                      newAnswer: data.no,
                      newKey: 'no',
                    })
                  )
                } else {
                  store.dispatch(
                    updateFunctionalObject({
                      index: index,
                      newAnswer: data.yes,
                      newKey: 'yes',
                    })
                  )
                }
              }}
            >
              <div className='mt-3 mb-1 rounded-md overflow-hidden bg-white'>
                <img
                  className='scale-[1.2]'
                  src={imageMap[data?.options[0]?.img] || data?.options[0]?.img}
                />
              </div>
              <div className='w-full border-t-[1.5px] py-2'>
                <p
                  className={`${
                    slice[index]?.answer === data.yes ? whiteText : blackText
                  } text-xs font-medium text-center`}
                >
                  {data.quetion}
                </p>
              </div>
            </div>
          ))}
      </div>
      <div className='flex mt-4 bg-primary text-white font-medium py-2 px-3 text-sm text-pretty rounded-md'>
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  )
}

export default SixthPart
