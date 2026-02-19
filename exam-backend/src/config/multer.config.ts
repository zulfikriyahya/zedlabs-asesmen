// ── multer.config.ts ─────────────────────────────────────
export const multerConfig = registerAs('multer', () => ({
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? String(1024 ** 3), 10),
  allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES ?? 'image/jpeg,image/png,image/webp').split(
    ',',
  ),
  allowedAudioTypes: (process.env.ALLOWED_AUDIO_TYPES ?? 'audio/mpeg,audio/wav,audio/webm').split(
    ',',
  ),
  allowedVideoTypes: (process.env.ALLOWED_VIDEO_TYPES ?? 'video/mp4,video/webm').split(','),
}));
