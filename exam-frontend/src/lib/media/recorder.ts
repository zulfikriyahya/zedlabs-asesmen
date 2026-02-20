export interface RecorderOptions {
  audio?: boolean
  video?: boolean
  mimeType?: string
}

export function getSupportedMimeType(prefer: 'audio' | 'video'): string {
  const audio = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
  const video = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4']
  const list = prefer === 'audio' ? audio : video
  return list.find(t => MediaRecorder.isTypeSupported(t)) ?? list[0]!
}
