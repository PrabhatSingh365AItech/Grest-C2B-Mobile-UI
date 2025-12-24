import React from 'react'

const WatchMoldModel = ({ setShowHoldModal }) => {
  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div
        className='bg-white text-black text-sm rounded w-full py-6 px-4 shadow-lg'
        style={{ lineHeight: '1.5' }}
      >
        <p>
          Upload Your device images which should include close-up shot of any
          specific damage, dent, scratches or wear and tear. Photos should be
          taken from an approx distance of 30 cms.
        </p>
        <p className='mt-2'>
          <strong>Front Side:</strong> Ensure the entire front of the watch is
          visible in display On condition and black screen background. It should
          include the full screen and bezels.
        </p>
        <p className='mt-2'>
          <strong>Back Side:</strong> Capture the entire back Side of the watch,
          including optical heart sensors and any scratches or dents.
        </p>
        <p className='mt-2'>
          <strong>Left Side:</strong> : Show the complete left side, including
          buttons and any port.
        </p>
        <p className='mt-2'>
          <strong>Right Side:</strong> Show the complete Right side, including
          buttons and any port.
        </p>
        <div className='flex justify-end mt-4'>
          <button
            onClick={() => setShowHoldModal(false)}
            className='bg-white text-[#4900AB] px-4 py-2 rounded-md'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default WatchMoldModel
