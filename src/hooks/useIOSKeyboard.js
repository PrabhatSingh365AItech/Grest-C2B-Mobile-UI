import { useState, useEffect } from 'react'

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export const useIOSKeyboard = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    if (!isIOS()) return

    const viewport = window.visualViewport
    if (!viewport) return

    const handleResize = () => {
      const heightDiff = window.innerHeight - viewport.height
      setKeyboardVisible(heightDiff > 150)
    }

    viewport.addEventListener('resize', handleResize)
    return () => viewport.removeEventListener('resize', handleResize)
  }, [])

  return keyboardVisible
}
