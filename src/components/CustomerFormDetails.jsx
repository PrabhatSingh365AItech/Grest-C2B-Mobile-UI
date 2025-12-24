import React, { useState, useEffect } from 'react'
import { IoCloseOutline } from 'react-icons/io5'

const CustomerFormDetails = ({ QNAData, closeModal }) => {
  const [costomerData, setCustomerData] = useState([])
  console.log({ QNAData })
  useEffect(() => {
    const flatQNA = []
    QNAData.forEach((category) => {
      for (const group in category) {
        if (Array.isArray(category[group]) && category[group].length > 0) {
          flatQNA.push(...category[group])
        }
      }
    })

    setCustomerData(flatQNA)
  }, [QNAData])

  return (
    <div className='fixed top-0 left-0 px-2 w-full h-full flex items-center justify-center z-50 bg-black   bg-opacity-50'>
      <div className='p-4 rounded-lg bg-[#F5F4F9] shadow-md w-full md:max-w-lg  overflow-y-auto max-h-96 md:max-h-[90%]  relative'>
        <IoCloseOutline
          onClick={closeModal}
          className='cursor-pointer sticky top-0 left-[700px] text-gray-500 hover:text-gray-700'
          size={24}
        />
        <h2 className='text-2xl font-semibold mb-4'>Details</h2>
        <div className='my-4'>
          <form>
            {costomerData &&
              costomerData.map((question, index) => (
                <div key={index} className='mb-4 flex flex-col gap-4'>
                  <div className='flex gap-1'>
                    <p className='text-xl'>{index + 1}.</p>
                    <p className='text-xl'>{question.quetion}</p>
                  </div>
                  <div className='ml-3 max-w-[200px] flex gap-20'>
                    <label className='font-medium text-primary'>
                      <input
                        type='radio'
                        value='yes'
                        checked={question.key === 'yes'}
                        readOnly
                      />{' '}
                      Yes
                    </label>
                    <label className='text-primary font-medium'>
                      <input
                        type='radio'
                        value='no'
                        checked={question.key === 'no'}
                        readOnly
                      />{' '}
                      No
                    </label>
                  </div>
                  <div className='max-w-[499px] opacity-10 border-b-2 border-[#9C9C9C]'></div>
                </div>
              ))}
          </form>
        </div>

        <button
          onClick={closeModal}
          className='mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-tertiary focus:outline-none'
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default CustomerFormDetails
