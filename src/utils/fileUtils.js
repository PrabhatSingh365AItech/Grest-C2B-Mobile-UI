/**
 * Convert dataURL to a File object
 * @param {string} dataurl - The data URL to convert
 * @param {string} filename - The name for the file
 * @returns {File|null} The File object or null if conversion fails
 */
export const dataURLtoFile = (dataurl, filename) => {
  if (!dataurl) {
    return null
  }

  const arr = dataurl.split(',')
  if (arr.length < 2) {
    return null
  }

  const mimeMatch = arr[0].match(/:(.*?);/)
  if (!mimeMatch) {
    return null
  }

  const mime = mimeMatch[1]
  const bstr = atob(arr[1])
  const u8arr = new Uint8Array(bstr.length)
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  return new File([u8arr], filename, { type: mime })
}
