export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

export function supportsWebCrypto(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}

export function supportsIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined'
}

export function supportsMediaRecorder(): boolean {
  return typeof MediaRecorder !== 'undefined'
}
