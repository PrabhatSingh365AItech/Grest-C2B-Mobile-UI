import React from 'react'

const MobileMoldModel = ({ setShowHoldModal }) => {
  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div
        className='bg-white text-black text-sm rounded w-full py-6 px-4 shadow-lg'
        style={{ lineHeight: '1.5' }}
      >
        <p>
          Upload your device images, including close-up shots of any specific
          damage, dents, scratches, or wear and tear. Photos should be taken
          from approximately 30 cm away.
        </p>
        <p className='mt-2'>
          <strong>Front Side:</strong> Ensure the entire front of the device is
          visible with the display on and a black screen background. Include the
          full screen and bezels.
        </p>
        <p className='mt-2'>
          <strong>Back Side:</strong> Capture the entire back side, including
          the camera, logo, and any scratches or dents.
        </p>
        <p className='mt-2'>
          <strong>Left Side:</strong> Show the complete left side, including
          buttons and any ports.
        </p>
        <p className='mt-2'>
          <strong>Right Side:</strong> Show the complete right side, including
          buttons and any ports.
        </p>
        <p className='mt-2'>
          <strong>Top Side:</strong> Show the full top edge of the device,
          including any ports or sensors.
        </p>
        <p className='mt-2'>
          <strong>Bottom Side:</strong> Capture the full bottom edge, including
          any ports or speakers.
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

export default MobileMoldModel
