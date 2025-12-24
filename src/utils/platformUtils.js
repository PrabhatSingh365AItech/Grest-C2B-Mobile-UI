/**
 * Detects if the current platform is Android
 * @returns {boolean} true if running on Android, false otherwise
 */
export const isAndroid = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return /android/i.test(userAgent)
}

/**
 * Detects if the current platform is iOS
 * @returns {boolean} true if running on iOS, false otherwise
 */
export const isIOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream
}

/**
 * Detects if the current platform is mobile (Android or iOS)
 * @returns {boolean} true if running on mobile, false otherwise
 */
export const isMobile = () => {
  return isAndroid() || isIOS()
}

