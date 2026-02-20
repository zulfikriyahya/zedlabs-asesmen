import type { ID, SyncStatus, SyncType } from './common'
import type { SubmitAnswerPayload } from './answer'

// ── Server model ──────────────────────────────────────────────────────────────

export interface SyncQueueItem {
  id: ID
  attemptId: ID
  idempotencyKey: string
  type: SyncType
  payload: SyncPayload
  status: SyncStatus
  retryCount: number
  maxRetries: number
  lastError: string | null
  processedAt: string | null
  createdAt: string
  updatedAt: string
}

// ── Payload union per SyncType ────────────────────────────────────────────────

export type SyncPayload =
  | SubmitAnswerPayload
  | SubmitExamPayload
  | UploadMediaPayload
  | ActivityLogPayload

export interface SubmitExamPayload {
  attemptId: ID
  idempotencyKey: string
  submittedAt: string
}

export interface UploadMediaPayload {
  attemptId: ID
  questionId: ID
  idempotencyKey: string
  chunkIndex: number
  totalChunks: number
  mimeType: string
  data: string    // base64 chunk
}

export interface ActivityLogPayload {
  attemptId: ID
  type: ActivityLogType
  metadata?: Record<string, unknown>
  timestamp: number
}

export type ActivityLogType =
  | 'tab_blur'
  | 'tab_focus'
  | 'copy_paste'
  | 'idle'
  | 'resume'
  | 'screen_capture_attempt'

// ── Dexie local sync queue ────────────────────────────────────────────────────

export interface LocalSyncItem {
  id?: number           // Dexie auto-increment
  idempotencyKey: string
  type: SyncType
  payload: SyncPayload
  status: SyncStatus
  retryCount: number
  createdAt: number     // Date.now()
  processedAt?: number
  lastError?: string
}

// ── PowerSync batch mutation ──────────────────────────────────────────────────

export interface PowerSyncBatchItem {
  type: SyncType
  attemptId: ID
  idempotencyKey: string
  payload: SyncPayload
}

export interface PowerSyncBatch {
  batch: PowerSyncBatchItem[]
}
