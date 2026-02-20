import type { ID } from './common';

export type MediaType = 'image' | 'audio' | 'video';

export interface MediaUploadResponse {
  objectKey: string;
  presignedUrl: string;
  expiresAt: string;
  mimeType: string;
  size: number;
}

export interface PresignedUrlResponse {
  url: string;
  expiresAt: string;
}

// Chunk upload untuk media rekaman offline
export interface ChunkUploadState {
  uploadId: string;
  questionId: ID;
  attemptId: ID;
  mimeType: string;
  totalChunks: number;
  uploadedChunks: number;
  objectKey: string | null; // tersedia setelah semua chunk diterima
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

// State rekaman lokal sebelum upload
export interface LocalMediaBlob {
  id?: number; // Dexie auto-increment
  questionId: ID;
  attemptId: ID;
  sessionId: ID;
  mimeType: string;
  blob: Blob;
  duration?: number; // detik
  size: number;
  recordedAt: number; // Date.now()
  uploaded: boolean;
  objectKey?: string;
}

// Hasil rekaman yang sudah selesai
export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  duration: number;
  size: number;
}
