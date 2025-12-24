import React from 'react'
import { GoDotFill } from 'react-icons/go'
import { updateFunctionalMajorObject } from '../../store/slices/QNAslice'
import imageMap from '../../utils/imageMap'
import store from '../../store/store'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

const FourthPart = ({ NDstate, slice }) => {
  return (
    <div className='containClass'>
      <div className='subheading'>
        <GoDotFill size={20} />
        <h2>Functional Condition of the Device</h2>
      </div>
      <div className='w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row'>
        {NDstate?.Functional_major &&
          NDstate?.Functional_major.map((data, index) => (
            <React.Fragment key={data._id}>
              {data?.options.map((option, optionIndex) => (
                <React.Fragment key={optionIndex}>
                  <div
                    onClick={(e) => {
                      console.log(slice)
                      console.log('assssaaaaa', option)
                      console.log('assssaaaaa', data)
                      console.log(optionIndex + 'ok')
                      store.dispatch(
                        updateFunctionalMajorObject({
                          index: index,
                          yesKey: data.yes,
                          noKey: data.no,
                          selectedIndex: optionIndex,
                          newKey: 'yes',
                        })
                      )
                    }}
                    className={`flex  px-3  flex-col min-h-[150px] items-center w-[48%]  shadow-lg rounded-lg ${
                      !slice[index].selected[optionIndex] ? whiteBg : pinkBg
                    }`}
                  >
                    <div className='mt-3 mb-1 rounded-md bg-white overflow-hidden'>
                      <img
                        className='scale-[1.2]'
                        src={imageMap[option?.img] || option?.img}
                      />
                    </div>
                    <div className='border-t-[1.5px] w-full py-2'>
                      <p
                        className={`text-xs font-medium ${
                          !slice[index].selected[optionIndex]
                            ? blackText
                            : whiteText
                        } text-center `}
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
      <div className='flex mt-4 bg-primary  px-3 text-white font-medium py-2 text-sm text-pretty rounded-md'>
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  )
}

export default FourthPart
