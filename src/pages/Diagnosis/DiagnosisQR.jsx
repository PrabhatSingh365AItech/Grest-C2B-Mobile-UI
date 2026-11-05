import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import axiosInstance from '../../utils/axiosInterceptor'
import DiagnosisLayout from '../../components/DiagnosisLayout'
import { toast } from 'react-hot-toast'

const DiagnosisQR = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const imei = location.state?.imei || 'Unknown IMEI'
  const detectedModel = location.state?.detectedModel || 'Unknown Device'

  const [sessionId, setSessionId] = useState('')
  const [status, setStatus] = useState('Initializing...')
  const WAITING_FOR_SCAN = 'Waiting for scan...'

  const createSession = async () => {
    try {
      setStatus('Generating session...')
      const profileStr = sessionStorage.getItem('profile')
      const profile = profileStr ? JSON.parse(profileStr) : {}

      const response = await axiosInstance.post('/api/diagnosis/session', {
        imei,
        storeId: profile?.storeCode || '',
        agentId: profile?.id || ''
      })

      if (response.data?.success) {
        setSessionId(response.data.data.sessionId)
        setStatus(WAITING_FOR_SCAN)
      }
    } catch (error) {
      console.error('Error creating diagnosis session:', error)
      setStatus('Failed to generate session')
    }
  }

  useEffect(() => {
    // Generate a session ID when component mounts
    createSession()
  }, [imei, detectedModel])

  const checkTestCompleted = async () => {
    if (!sessionId) {
      return
    }
    setStatus('Checking results...')
    try {
      const response = await axiosInstance.get(`/api/diagnosis/session/${sessionId}`)
      if (response.data?.success) {
        const currentStatus = response.data.data.status
        setStatus(currentStatus)

        if (currentStatus === 'Completed' || response.data.data.results) {
          navigate('/diagnosis/report', {
            state: {
              imei,
              detectedModel,
              diagnosisResults: response.data.data.results || {},
              sessionId
            }
          })
        } else {
          setStatus(WAITING_FOR_SCAN)
          toast.error('Test not completed yet. Please complete the test in the mobile app first.')
        }
      }
    } catch (error) {
      console.error('Error polling session status:', error)
      setStatus(WAITING_FOR_SCAN)
      toast.error('Error checking status. Try again.')
    }
  }

  // Using the client provided URL directly without appending sessionId for testing
  const deepLinkUrl = `https://p.blre.cc/DFlOpe`

  return (
    <DiagnosisLayout>
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-100 px-6 py-6 flex flex-col items-center">
          <h2 className="text-lg font-bold text-center text-gray-900 mb-2">Scan to Begin</h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            Ask the customer to scan this code with their phone camera
          </p>

          <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 mb-6 flex justify-center items-center">
            {sessionId ? (
              <QRCodeSVG value={deepLinkUrl} size={200} />
            ) : (
              <div className="w-[200px] h-[200px] bg-gray-200 animate-pulse rounded-md" />
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <p className="text-sm font-semibold text-primary">{status}</p>
          </div>

          <button
            onClick={checkTestCompleted}
            className="w-full border-2 border-primary bg-primary text-white text-sm font-medium px-4 py-3 rounded-lg hover:opacity-90 transition mb-2"
          >
            Test Completed
          </button>
          <p className="text-xs text-center text-gray-600 mt-2 mb-4">
            <span className="text-red-600 font-semibold">Disclaimer:</span>{' '}
            Please put IMEI in app before continuing. Only click this when the
            test is completed and you have clicked continue in the app.
          </p>

          <button
            onClick={createSession}
            className="w-full border-2 border-primary bg-white text-primary text-sm font-medium px-4 py-3 rounded-lg hover:bg-primary hover:text-white transition"
          >
            Refresh QR
          </button>
        </div>
      </div>
    </DiagnosisLayout>
  )
}

export default DiagnosisQR
