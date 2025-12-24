import React from 'react'
import { updateWarrantyObject } from '../../store/slices/QNAslice'
import { GoDotFill } from 'react-icons/go'
import imageMap from '../../utils/imageMap'
import store from '../../store/store'
import { isBillAvailable } from '../../utils/pricingUtils'
import { useSelector } from 'react-redux'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

const EighthPart = ({ NDstate, slice }) => {
  const accessories = useSelector((state) => state.qna.Accessories)

  const billAvailable = isBillAvailable(accessories)

  const handleWarrantySelection = (option, data, index) => {
    store.dispatch(
      updateWarrantyObject({
        index: index,
        newKey: 'yes',
        newAnswer: data.yes,
      })
    )
  }

  const getOptionClass = (option, index, optionIndex) => {
    const isOutOfWarranty = option.caption
      .toLowerCase()
      .includes('out of warranty')
    const isSelected = slice[index].selected[optionIndex]

    if (!billAvailable && !isOutOfWarranty) {
      return 'bg-gray-100 cursor-not-allowed opacity-50'
    }
    if (!isSelected) {
      return `${whiteBg} hover:shadow-md`
    }
    return pinkBg
  }

  return (
    <div className='containClass'>
      <div className='subheading'>
        <GoDotFill size={20} />
        <h2>Please Choose the Appropriate Warranty Period for Your Device</h2>
      </div>
      <div className='w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row'>
        {NDstate?.Warranty &&
          NDstate?.Warranty.map((data, index) => (
            <React.Fragment key={data._id}>
              {data?.options.map((option, optionIndex) => (
                <React.Fragment key={optionIndex}>
                  <div
                    onClick={() => {
                      const isDisabled =
                        !billAvailable &&
                        !option.caption
                          .toLowerCase()
                          .includes('out of warranty')
                      if (!isDisabled) {
                        handleWarrantySelection(option, data, index)
                      }
                    }}
                    className={`w-[48%] flex flex-col items-center px-3 min-h-[150px] shadow-lg rounded-lg cursor-pointer transition-all duration-200 ${getOptionClass(
                      option,
                      index,
                      optionIndex
                    )}`}
                  >
                    <div className='mt-3 mb-1 overflow-hidden bg-white  rounded-md '>
                      <img
                        className='scale-[1.2]'
                        src={imageMap[option?.img] || option?.img}
                      />
                    </div>
                    <div className='border-t-[1.5px] w-full py-2'>
                      <p
                        className={`text-xs text-center font-medium ${
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

      {/* Bill availability warning */}
      {!billAvailable && (
        <div className='mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
          <p className='text-sm text-yellow-800'>
            <strong>Note:</strong> Since bill is not available, warranty ranges
            are disabled except "Out of Warranty".
          </p>
        </div>
      )}
    </div>
  )
}

export default EighthPart
