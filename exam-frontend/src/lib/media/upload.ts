import { apiClient } from '@/lib/api/client';

const CHUNK_SIZE = 1024 * 1024; // 1MB

export async function uploadMediaChunked(
  attemptId: number,
  answerId: number,
  file: Blob,
  checksum: string,
  onProgress: (progress: number) => void
) {
  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
  const uploadId = `${attemptId}-${answerId}-${Date.now()}`;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', i.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('uploadId', uploadId);
    formData.append('checksum', checksum); // Send checksum with final chunk or init

    await apiClient.post(`/student/attempts/${attemptId}/answers/${answerId}/media-chunk`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const progress = Math.round(((i + 1) / totalChunks) * 100);
    onProgress(progress);
  }
  
  return { success: true, uploadId };
}