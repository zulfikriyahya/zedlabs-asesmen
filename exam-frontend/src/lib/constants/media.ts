export const ALLOWED_MEDIA_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  AUDIO: ['audio/webm', 'audio/mp3', 'audio/wav'],
  VIDEO: ['video/webm', 'video/mp4'],
};

export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  VIDEO: 500 * 1024 * 1024, // 500MB
};

export const RECORDING_CONSTRAINTS = {
  AUDIO: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  },
  VIDEO: {
    audio: true,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user',
    },
  },
};