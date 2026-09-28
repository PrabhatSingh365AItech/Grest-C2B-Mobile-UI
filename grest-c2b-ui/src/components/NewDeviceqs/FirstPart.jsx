import React from 'react'
import { GoDotFill } from 'react-icons/go'
import { updateCoreObject } from '../../store/slices/QNAslice'
import imageMap from '../../utils/imageMap'
import store from '../../store/store'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

const FirstPart = ({ NDstate, slice }) => {
  return (
    <div className='containClass'>
      <div className='subheading'>
        <GoDotFill size={15} />
        <h2>Basic Condition of the Device</h2>
      </div>
      <div className='w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row'>
        {NDstate?.Core?.map((data, index) =>
          data.options.map((option, optionIndex) => (
            <div
              key={`${data._id}_${optionIndex}`}
              onClick={() => {
                store.dispatch(
                  updateCoreObject({
                    index,
                    yesKey: data.yes,
                    noKey: data.no,
                    newKey: 'yes',
                    selectedIndex: optionIndex,
                  })
                )
              }}
              className={`px-3 flex flex-col items-center w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                !slice[index]?.selected[optionIndex] ? whiteBg : pinkBg
              }`}
            >
              <div className='mb-1 mt-3 rounded-md overflow-hidden bg-white'>
                <img
                  className='scale-[1.2]'
                  src={imageMap[option?.img] || option?.img}
                />
              </div>
              <div className='border-t-[1.5px] w-full py-2'>
                <p
                  className={`font-medium text-xs text-center ${
                    !slice[index]?.selected[optionIndex] ? blackText : whiteText
                  }`}
                >
                  {option.caption}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className='flex mt-4 bg-primary text-white font-medium py-2 px-3 text-sm rounded-md'>
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  )
}

export default FirstPart
