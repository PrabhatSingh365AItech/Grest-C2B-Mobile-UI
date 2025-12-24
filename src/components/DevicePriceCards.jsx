import React from 'react'
import { useNavigate } from 'react-router-dom'

const DevicePriceCards = (props) => {
  const navigate = useNavigate()

  const handleModify = () => {
    navigate('/deviceinfo')
  }
  return (
    <div
      style={{
        boxShadow:
          '0 0 10px 0 rgba(0, 0, 0, 0.1), 0 0 10px 0 rgba(0, 0, 0, 0.1)',
      }}
      className='flex gap-2 bg-white   rounded-lg py-[20px] '
    >
      <div>
        <img
          className='w-[128px] sm:w-[120px] md:w-[150px]'
          src={props.phonePhoto}
          // src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmjX4AzMXjxyVKyfHZNlt877tnGHoEoDqOlA&usqp=CAU"
          alt='phone picture'
        />
      </div>
      <div className='flex flex-col gap-1'>
        <div>
          <p className='text-xl font-medium md:text-3xl'>{props.model}</p>
        </div>
        <div>
          <p className='text-primary text-lg md:text-2xl'>
            {props.type === 'CTG1' && `${props.ram}/${props.storage}`}
          </p>
          {/* <select className=" rounded bg-[#F5F4F9] text-primary w-[220px] p-[5px] focus:outline-none"></select> */}
        </div>
        <div>
          <p className='text-xs md:text-lg text-[#9C9C9C]'>Selling Price</p>
          <p className='font-bold text-2xl md:text-4xl text-primary'>
            ₹{Math.round(props.price)}
          </p>
        </div>
        {props.showReport === true && (
          <>
            {/* <button className="p-1 font-semibold text-sm text-left bg-primary hover:bg-[#fd4b71]   text-white rounded">
              Show Device Report
            </button> */}
            <div className='text-sm flex gap-1'>
              {/* <button className="p-1 font-semibold text-sm text-left bg-primary   hover:bg-[#fd4b71]  text-white rounded">
                Requote
              </button> */}
              <button
                onClick={() => props.setShowReportModel(true)}
                className='p-1 font-semibold text-sm text-left bg-primary hover:bg-[#fd4b71]   text-white rounded'
              >
                Show Device Report
              </button>
              <button
                onClick={handleModify}
                className='p-1 font-semibold text-sm text-left bg-primary hover:bg-[#fd4b71]   text-white rounded'
              >
                Modify
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DevicePriceCards
