import { apiClient } from './client';

export async function uploadMedia(file: File, type: 'image' | 'audio' | 'video') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await apiClient.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data; // Returns { url: string, id: string }
}

export async function getMediaUrl(mediaId: string) {
  // Logic to handle signed URLs if using S3, or direct URL
  return `/api/media/${mediaId}`;
}