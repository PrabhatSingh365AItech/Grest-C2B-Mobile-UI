import React from 'react'
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io'
import styles from '../PickedUpDevices.module.css'
import { succTextColor, failTextColor } from '../constants'

export const StatusModals = ({
  successMod,
  failMod,
  confMod,
  errorMsg,
  errorMsg1,
  errorMsg2,
  setSuccessMod,
  setFailMode,
  setConfMod,
  tempUCode,
  onConfirm,
}) => {
  return (
    <>
      {successMod && (
        <div className='fixed left-0 top-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${succTextColor}`}>
            <IoIosCheckmarkCircle size={90} className={succTextColor} />
            <h6 className={succTextColor}>Success!</h6>
            <p className='text-green-500 block'>{errorMsg}</p>
            {errorMsg1 && <p className='text-slate-700 block'>{errorMsg1}</p>}
            {errorMsg2 && <p className='text-slate-700 block'>{errorMsg2}</p>}
            <button
              className={'text-white bg-green-500 '}
              onClick={() => {
                setSuccessMod(false)
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {failMod && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${failTextColor}`}>
            <IoIosCloseCircle className={failTextColor} size={90} />
            <h6 className={failTextColor}>Error!</h6>
            <p className='text-slate-700'>{errorMsg}</p>
            <button
              onClick={() => setFailMode(false)}
              className={'bg-primary text-white'}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confMod && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center h-full w-full bg-black bg-opacity-50'>
          <div className={`${failTextColor} ${styles.err_mod_box}`}>
            <h6 className={failTextColor}>Confirmation!</h6>
            <p className='text-slate-700'>{`Confirm Payment for lot - ${tempUCode} ?`}</p>
            <div className='flex flex-row gap-2'>
              <button onClick={onConfirm} className={'bg-primary text-white'}>
                Okay
              </button>
              <button
                onClick={() => setConfMod(false)}
                className='bg-white text-primary'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
