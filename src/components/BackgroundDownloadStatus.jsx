import { useEffect, useRef, useSyncExternalStore } from 'react'
import toast from 'react-hot-toast'
import { BeatLoader } from 'react-spinners'
import { leadDownloadManager } from '../utils/leadDownloadManager'

const notify = (status) => {
  if (status.status === 'completed') {
    toast.success(
      `Download complete! ${status.records} records downloaded. Check your browser downloads.`,
      { duration: 6000 },
    )
  } else if (status.status === 'failed') {
    toast.error(`Download failed: ${status.error}`, { duration: 6000 })
  }
}

export default function BackgroundDownloadStatus() {
  const status = useSyncExternalStore(
    leadDownloadManager.subscribe,
    leadDownloadManager.getSnapshot,
  )
  const prevStatusRef = useRef(status)

  useEffect(() => {
    const prev = prevStatusRef.current
    prevStatusRef.current = status
    if (!status || prev?.status !== 'running') {
      return
    }
    if (status.status !== 'running') {
      notify(status)
    }
  }, [status])

  if (!status || status.status !== 'running') {
    return null
  }

  return (
    <div className='fixed bottom-4 right-4 z-[60] flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-sm text-white shadow-lg'>
      <BeatLoader color='white' size={8} />
      <div>
        <p className='font-semibold'>{status.progressText || 'Downloading...'}</p>
        <p className='text-xs opacity-90'>
          You can continue browsing. We will notify you when the download is done.
        </p>
      </div>
    </div>
  )
}
