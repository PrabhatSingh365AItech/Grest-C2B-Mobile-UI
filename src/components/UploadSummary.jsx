import { IoDownloadOutline } from 'react-icons/io5'

const UploadSummary = ({
  uploadResult,
  onReset,
  onClose,
  onDownloadFailed,
}) => {
  const stats = [
    { label: 'Total Records', value: uploadResult.total, color: 'gray' },
    { label: 'Succeeded', value: uploadResult.succeededCount, color: 'green' },
    { label: 'Failed', value: uploadResult.failedCount, color: 'red' },
  ]
  console.log(uploadResult)
  console.log(stats)
  return (
    <>
      <h3 className='text-xl font-semibold text-gray-700 mb-4'>
        Upload Summary
      </h3>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6'>
        {stats.map(({ label, value, color }) => (
          <div key={label} className={`p-4 bg-${color}-100 rounded-lg`}>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            <p className={`text-sm font-medium text-${color}-500`}>{label}</p>
          </div>
        ))}
      </div>

      {uploadResult.failedCount > 0 && (
        <div className='flex flex-col items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <p className='text-gray-700 mb-3 text-center'>
            Some records failed. Download the file with errors, fix them, and
            re-upload.
          </p>
          <button
            onClick={onDownloadFailed}
            className='flex items-center gap-2 text-sm text-white px-4 py-2 rounded bg-primary hover:bg-opacity-90'
          >
            <IoDownloadOutline size={18} />
            Download Failed Records
          </button>
        </div>
      )}

      <div className='mt-8 flex flex-col sm:flex-row justify-end gap-3'>
        <button
          onClick={onReset}
          className='text-sm text-gray-700 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300'
        >
          Upload Another File
        </button>
        <button
          onClick={onClose}
          className='text-sm text-white px-4 py-2 rounded bg-primary hover:bg-opacity-90'
        >
          Close
        </button>
      </div>
    </>
  )
}

export default UploadSummary
