import { BeatLoader } from 'react-spinners'

const UploadSpinner = () => (
  <div className='flex flex-col items-center justify-center h-64'>
    <BeatLoader color='var(--primary-color)' loading={true} size={20} />
    <p className='mt-4 text-lg text-gray-600'>
      Processing your file, please wait...
    </p>
  </div>
)

export default UploadSpinner
