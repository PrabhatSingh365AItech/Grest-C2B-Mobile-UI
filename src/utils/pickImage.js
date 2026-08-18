import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

export const pickImageFile = async () => {
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Prompt,
    correctOrientation: true,
    saveToGallery: false,
  })

  if (!photo?.webPath) {
    return null
  }

  const response = await fetch(photo.webPath)
  const blob = await response.blob()
  const ext = photo.format === 'png' ? 'png' : 'jpg'
  const type = blob.type || (ext === 'png' ? 'image/png' : 'image/jpeg')

  return new File([blob], `upload-${Date.now()}.${ext}`, { type })
}

export const isNativeApp = () => Capacitor.isNativePlatform()
