import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io'
import styles from './RegisterUser.module.css'

const StatusModal = ({ success, message, onClose }) => {
  const sucTextColor = 'text-green-500'
  const failTextColor = 'text-primary'

  return (
    <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div
        className={`${styles.err_mod_box} ${
          success ? sucTextColor : failTextColor
        }`}
      >
        {success ? (
          <IoIosCheckmarkCircle size={90} className={sucTextColor} />
        ) : (
          <IoIosCloseCircle size={90} className={failTextColor} />
        )}
        <h6 className={success ? sucTextColor : failTextColor}>
          {success ? 'Success!' : 'Error!'}
        </h6>
        <p className='text-slate-500'>{message}</p>

        <button
          className={
            success ? 'bg-green-500 text-white' : 'bg-primary text-white'
          }
          onClick={onClose}
        >
          Okay
        </button>
      </div>
    </div>
  )
}

export default StatusModal
