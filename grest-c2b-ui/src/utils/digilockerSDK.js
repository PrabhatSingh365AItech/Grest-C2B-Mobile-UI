// Utility to load and initialize Digilocker SDK

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
  const defaultOptions = {
    environment: 'sandbox',
    callback: function (response) {
      console.log('Digilocker Response:', response)
    },
    is_redirection_approach: false,
    is_iframe: true,
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

  digioInstance.init()
  digioInstance.submit(entityId, identifier, accessToken)
}
