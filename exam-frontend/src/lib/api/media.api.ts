import { apiGet } from './client';
import type { MediaUploadResponse, PresignedUrlResponse } from '@/types/media';

export const mediaApi = {
  upload: (formData: FormData) =>
    fetch('/api/media', { method: 'POST', body: formData }).then(async (r) => {
      if (!r.ok) throw new Error('Upload gagal');
      return r.json() as Promise<MediaUploadResponse>;
    }),

  getPresignedUrl: (objectKey: string) =>
    apiGet<PresignedUrlResponse>(`media/presigned?key=${encodeURIComponent(objectKey)}`),

  uploadChunk: (formData: FormData) =>
    fetch('/api/sync', { method: 'POST', body: formData }).then(async (r) => {
      if (!r.ok) throw new Error('Chunk upload gagal');
      return r.json() as Promise<{ objectKey?: string }>;
    }),
};
