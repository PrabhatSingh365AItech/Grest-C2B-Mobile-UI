import React from 'react'
import { GoDotFill } from 'react-icons/go'
import { updateDisplayObject } from '../../store/slices/QNAslice'
import imageMap from '../../utils/imageMap'
import store from '../../store/store'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

const ThirdPart = ({ NDstate, slice }) => {
  return (
    <div className='containClass'>
      <div className='subheading'>
        <GoDotFill size={20} />
        <h2>Display Condition of the Device</h2>
      </div>
      <div className='w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row'>
        {NDstate.Display &&
          NDstate.Display.map((data, index) => (
            <React.Fragment key={data._id}>
              {data?.options.map((option, optionIndex) => (
                <React.Fragment key={optionIndex}>
                  <div
                    onClick={(e) => {
                      console.log(slice)
                      console.log('assssaaaaa', data)
                      console.log('assssaaaaa', option)
                      console.log(optionIndex + 'ok')
                      store.dispatch(
                        updateDisplayObject({
                          index: index,
                          noKey: data.no,
                          yesKey: data.yes,
                          newKey: 'yes',
                          selectedIndex: optionIndex,
                        })
                      )
                    }}
                    className={`min-h-[150px] flex flex-col items-center px-3 w-[48%]  shadow-lg rounded-lg ${
                      !slice[index].selected[optionIndex] ? whiteBg : pinkBg
                    }`}
                  >
                    <div className='  overflow-hidden mt-3 mb-1 rounded-md bg-white'>
                      <img
                        className='scale-[1.2]'
                        src={imageMap[option?.img] || option?.img}
                      />
                    </div>
                    <div className='w-full py-2 border-t-[1.5px] '>
                      <p
                        className={`text-center text-xs font-medium  ${
                          !slice[index].selected[optionIndex]
                            ? blackText
                            : whiteText
                        }`}
                      >
                        {option.caption}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
      </div>
      <div className='flex bg-primary mt-4  text-white font-medium py-2 px-3 text-sm text-pretty rounded-md'>
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  )
}

export default ThirdPart
