/**
 * Dexie table definitions — IndexedDB schema untuk offline-first flow.
 * Tabel ini menyimpan data LOKAL; tidak pernah menyimpan key enkripsi.
 */

import type { LocalAnswer } from '@/types/answer'
import type { LocalActivityLog } from '@/types/activity'
import type { LocalSyncItem } from '@/types/sync'
import type { LocalMediaBlob } from '@/types/media'
import type { DecryptedExamPackage } from '@/types/exam'

// ── Tipe tambahan untuk IndexedDB ─────────────────────────────────────────────

export interface StoredExamPackage {
  sessionId: string
  attemptId: string
  packageHash: string
  encryptedData: string   // ciphertext — dekripsi saat sesi aktif, tidak pernah disimpan plain
  iv: string
  expiresAt: number       // Date.now() + TTL
  storedAt: number
}

// ── Nama tabel Dexie ─────────────────────────────────────────────────────────

export type DexieTables = {
  examPackages: StoredExamPackage
  answers: LocalAnswer
  activityLogs: LocalActivityLog
  syncQueue: LocalSyncItem
  mediaBlobs: LocalMediaBlob
}

// ── Index definition string per tabel ────────────────────────────────────────
// Format Dexie: "primaryKey, [compound], index1, index2"

export const DB_SCHEMA = {
  examPackages: 'sessionId, attemptId, packageHash, expiresAt',
  answers: '++id, [attemptId+questionId], questionId, sessionId, synced, savedAt',
  activityLogs: '++id, attemptId, sessionId, type, synced, timestamp',
  syncQueue: '++id, idempotencyKey, status, type, createdAt, retryCount',
  mediaBlobs: '++id, [attemptId+questionId], sessionId, uploaded, recordedAt',
} as const satisfies Record<keyof DexieTables, string>

export const DB_NAME = 'exam_offline_db'
export const DB_VERSION = 1
