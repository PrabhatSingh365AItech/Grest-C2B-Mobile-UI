import axios from 'axios'
import { downloadExcelLeadsompleted } from './leadExportUtils'

const BATCH_SIZE = 25
const MAX_RETRIES = 2
const BATCH_DELAY_MS = 500
const COMPLETION_DISMISS_MS = 6000

let job = null
let snapshot = null
const listeners = new Set()

const emit = () => {
  snapshot = job
    ? { ...job, skippedPages: [...job.skippedPages] }
    : null
  for (const listener of listeners) {
    listener(snapshot)
  }
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => snapshot

const fetchPageWithRetry = async (url, headers, retries = MAX_RETRIES) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, { headers, timeout: 25000 })
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      } else {
        throw err
      }
    }
  }
  throw new Error('Failed to fetch page')
}

const runDownload = async (jobStatus, params) => {
  const allRecords = []

  try {
    for (let page = 0; page < jobStatus.totalPages; page++) {
      jobStatus.progressText = `Downloading page ${page + 1} of ${jobStatus.totalPages}...`
      emit()

      try {
        const baseUrl = `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/prospects/findAllSelled`
        const res = await fetchPageWithRetry(
          `${baseUrl}?page=${page}&limit=${BATCH_SIZE}&deviceType=${params.deviceType}&startDate=${params.fromDate}&endDate=${params.toDate}&store=${params.store}`,
          { authorization: params.userToken1 },
        )

        if (res.data?.data?.length > 0) {
          allRecords.push(...res.data.data)
          jobStatus.records = allRecords.length
        }
      } catch (pageErr) {
        console.error(`Page ${page + 1} failed after retries:`, pageErr)
        jobStatus.skippedPages.push(page + 1)
      }

      if (page < jobStatus.totalPages - 1) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    if (allRecords.length === 0) {
      throw new Error('No data was downloaded. Please try again later.')
    }

    jobStatus.progressText = 'Generating Excel file...'
    emit()
    downloadExcelLeadsompleted(allRecords)

    jobStatus.status = 'completed'
    jobStatus.progressText = `Download complete (${allRecords.length} records)`
    emit()
  } catch (err) {
    console.error('Download failed:', err)
    jobStatus.status = 'failed'
    jobStatus.error = err?.response?.data?.message || err.message || 'Download failed'
    emit()
  }

  setTimeout(() => {
    job = null
    emit()
  }, COMPLETION_DISMISS_MS)
}

const startDownload = ({ totalCount, deviceType, store, fromDate, toDate }) => {
  if (job) {
    return 'duplicate'
  }

  if (!totalCount || totalCount <= 0) {
    return 'empty'
  }

  const userToken1 = sessionStorage.getItem('authToken')
  const totalPages = Math.ceil(totalCount / BATCH_SIZE)

  job = {
    status: 'running',
    totalPages,
    progressText: `Preparing download... (0/${totalPages} pages)`,
    records: 0,
    skippedPages: [],
  }
  emit()

  runDownload(job, {
    deviceType,
    store,
    fromDate,
    toDate,
    userToken1,
  })

  return 'started'
}

export const leadDownloadManager = {
  startDownload,
  subscribe,
  getSnapshot,
}
