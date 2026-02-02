// src/types/sync.ts
export type SyncItemType = 'answer' | 'media' | 'activity' | 'submission';
export type SyncStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SyncQueueItem {
  id?: number;
  attempt_id: number;
  type: SyncItemType;
  data: any;
  priority: number; // 1-5, 5 = highest
  retry_count: number;
  max_retries: number;
  status: SyncStatus;
  created_at: Date;
  processed_at?: Date;
  error_message?: string;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  percentage: number;
}

export interface DownloadProgress {
  phase: 'preparing' | 'exam_data' | 'media_files' | 'complete';
  current: number;
  total: number;
  currentFile?: string;
  percentage: number;
}

export interface UploadProgress {
  uploaded: number;
  total: number;
  percentage: number;
  currentChunk?: number;
  totalChunks?: number;
}