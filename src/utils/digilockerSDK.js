// Utility to load and initialize Digilocker SDK
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

// Check if running on native mobile platform
const isMobile = () => {
  return Capacitor.isNativePlatform()
}

// Open URL in system browser on mobile
export const openInSystemBrowser = async (url) => {
  if (isMobile()) {
    await Browser.open({ 
      url: url,
      presentationStyle: 'popover',
      windowName: '_self'
    })
  } else {
    // On web, open in new window
    window.open(url, '_blank', 'width=600,height=800')
  }
}

export const loadDigilockerSDK = () => {
  return new Promise((resolve, reject) => {
    // Check if SDK is already loaded
    if (window.Digio) {
      resolve(window.Digio)
      return
    }

    // Create script tag
    const script = document.createElement('script')
    script.src = 'https://ext.digio.in/sdk/v11/digio.js'
    script.type = 'text/javascript'
    script.async = true

    script.onload = () => {
      if (window.Digio) {
        resolve(window.Digio)
      } else {
        reject(new Error('Digilocker SDK failed to load'))
      }
    }

    script.onerror = () => {
      reject(new Error('Failed to load Digilocker SDK script'))
    }

    document.head.appendChild(script)
  })
}

export const initializeDigilocker = (options) => {
  const isNative = isMobile()
  
  // Different configuration for mobile vs web
  const defaultOptions = {
    environment: 'sandbox',
    callback: function (response) {
      console.log('Digilocker Response:', response)
    },
    // On mobile: use redirection, on web: use iframe
    is_redirection_approach: isNative,
    is_iframe: !isNative,
    // Redirect URL for mobile apps (will return to app after verification)
    redirect_url: isNative ? 'grestc2b://digilocker/callback' : undefined,
    theme: {
      primaryColor: '#AB3498',
      secondaryColor: '#000000',
    },
    event_listener: function (event) {
      console.log('Digilocker Event:', event.event)
    },
  }

  const mergedOptions = { ...defaultOptions, ...options }
  return new window.Digio(mergedOptions)
}

export const submitDigilockerKYC = (
  digioInstance,
  entityId,
  identifier,
  accessToken
) => {
  if (!digioInstance) {
    throw new Error('Digilocker instance not initialized')
  }

  // Always use SDK to initialize and submit
  // The SDK will handle the proper URL generation
  digioInstance.init()
  digioInstance.submit(entityId, identifier, accessToken)
  
  // Log for debugging
  console.log('Digilocker KYC submitted with:', { entityId, identifier })
}

// Handle deep link callback from Digilocker (for mobile apps)
export const parseDigilockerCallback = (url) => {
  try {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)
    
    // Extract response parameters from URL
    const response = {
      message: params.get('message') || params.get('status'),
      entity_id: params.get('entity_id'),
      error_code: params.get('error_code'),
      // Add any other params that Digilocker returns
    }
    
    console.log('Parsed Digilocker callback:', response)
    return response
  } catch (error) {
    console.error('Error parsing callback URL:', error)
    return null
  }
}
