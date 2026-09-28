import React from 'react'
import { updateCosmeticsObject } from '../../store/slices/QNAslice'
import { GoDotFill } from 'react-icons/go'
import store from '../../store/store'
import imageMap from '../../utils/imageMap'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

const SecondPart = ({ NDstate, slice }) => {
  return (
    <div className='containClass'>
      <div className='subheading'>
        <GoDotFill size={20} />
        <h2>Physical Condition of the Device</h2>
      </div>
      <div className='w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row'>
        {NDstate.Cosmetics &&
          NDstate.Cosmetics.map((data, index) => {
            return (
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
                          updateCosmeticsObject({
                            index: index,
                            yesKey: data.yes,
                            noKey: data.no,
                            selectedIndex: optionIndex,
                            newKey: 'yes',
                          })
                        )
                      }}
                      className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                        !slice[index].selected[optionIndex] ? whiteBg : pinkBg
                      }`}
                    >
                      <div className='mt-3 mb-1 rounded-md overflow-hidden bg-white'>
                        <img
                          src={imageMap[option?.img] || option?.img}
                          className='scale-[1.2]'
                        />
                      </div>
                      <div className='w-full border-t-[1.5px] py-2'>
                        <p
                          className={`text-xs font-medium text-center ${
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
            )
          })}
      </div>
      <div className='flex mt-4 bg-primary text-white font-medium py-2 px-3 text-sm text-pretty rounded-md'>
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  )
}

export default SecondPart
