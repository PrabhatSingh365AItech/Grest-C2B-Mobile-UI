import React, { useState } from 'react'
import { GoDotFill } from 'react-icons/go'
import { updateAccessoriesObject } from '../../store/slices/QNAslice'
import imageMap from '../../utils/imageMap'
import store from '../../store/store'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

// Reusable OptionCard component
const OptionCard = ({
  index,
  option,
  optionIndex,
  data,
  isSelected,
  onAccessoryClick,
}) => {
  const handleClick = () => {
    onAccessoryClick(index, option, optionIndex, data)
  }

  return (
    <div
      className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
        !isSelected ? whiteBg : pinkBg
      }`}
      onClick={handleClick}
    >
      <div className='mt-3 mb-1 rounded-md overflow-hidden bg-white'>
        <img
          className='scale-[1.2]'
          src={imageMap[option?.img] || option?.img}
        />
      </div>
      <div className='border-t-[1.5px] w-full py-2'>
        <p
          className={`text-xs font-medium text-center ${
            !isSelected ? blackText : whiteText
          }`}
        >
          {option.caption}
        </p>
      </div>
    </div>
  )
}

const SeventhPart = ({ NDstate, slice }) => {
  const [missingAccessories, setMissingAccessories] = useState({
    box: false,
    cable: false,
    strap: false, // for watches
    invoice: false,
  })

  // Handle accessory selection
  const handleAccessoryClick = (index, option, optionIndex, data) => {
    // Update the original store
    store.dispatch(
      updateAccessoriesObject({
        index,
        yesKey: data.yes,
        noKey: data.no,
        newKey: 'yes',
        selectedIndex: optionIndex,
      })
    )

    // Track missing accessories based on option caption
    const caption = option.caption.toLowerCase()
    const newMissingAccessories = { ...missingAccessories }

    if (caption.includes('box')) {
      newMissingAccessories.box = !newMissingAccessories.box
    } else if (caption.includes('cable') || caption.includes('charger')) {
      newMissingAccessories.cable = !newMissingAccessories.cable
    } else if (caption.includes('strap')) {
      newMissingAccessories.strap = !newMissingAccessories.strap
    } else if (caption.includes('invoice') || caption.includes('bill')) {
      newMissingAccessories.invoice = !newMissingAccessories.invoice
    }

    setMissingAccessories(newMissingAccessories)
  }

  return (
    <div className='containClass'>
      <div className='subheading'>
        <GoDotFill size={20} />
        <h2>Select Accessories Not Available with Device</h2>
      </div>
      <div className='w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row'>
        {NDstate?.Accessories?.map((data, index) =>
          data.options.map((option, optionIndex) => (
            <OptionCard
              key={`${data._id}-${optionIndex}`}
              index={index}
              option={option}
              optionIndex={optionIndex}
              data={data}
              isSelected={slice[index].selected[optionIndex]}
              onAccessoryClick={handleAccessoryClick}
            />
          ))
        )}
      </div>
      <div className='flex mt-4 bg-primary text-white font-medium py-2 px-3 text-sm text-pretty rounded-md'>
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  )
}

export default SeventhPart
