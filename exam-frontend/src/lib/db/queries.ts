/**
 * Query helpers Dexie — satu tempat untuk semua operasi IndexedDB.
 * Semua fungsi menerima db instance (memudahkan testing dengan mock db).
 */

import type { ExamDatabase, StoredExamPackage } from './schema'
import type { LocalAnswer, SubmitAnswerPayload } from '@/types/answer'
import type { LocalActivityLog } from '@/types/activity'
import type { LocalSyncItem } from '@/types/sync'
import type { LocalMediaBlob } from '@/types/media'
import type { SyncStatus } from '@/types/common'
import { getDb } from './db'

const db = () => getDb()

// ── examPackages ──────────────────────────────────────────────────────────────

export async function saveExamPackage(pkg: StoredExamPackage): Promise<void> {
  await db().examPackages.put(pkg)
}

export async function getExamPackage(sessionId: string): Promise<StoredExamPackage | undefined> {
  return db().examPackages.get(sessionId)
}

export async function deleteExamPackage(sessionId: string): Promise<void> {
  await db().examPackages.delete(sessionId)
}

export async function purgeExpiredPackages(): Promise<number> {
  const now = Date.now()
  return db().examPackages.where('expiresAt').below(now).delete()
}

// ── answers ───────────────────────────────────────────────────────────────────

export async function upsertAnswer(ans: Omit<LocalAnswer, 'id'>): Promise<number> {
  const existing = await db().answers
    .where('[attemptId+questionId]')
    .equals([ans.attemptId, ans.questionId])
    .first()

  if (existing?.id !== undefined) {
    await db().answers.update(existing.id, { ...ans, savedAt: Date.now() })
    return existing.id
  }
  return db().answers.add({ ...ans, savedAt: Date.now() })
}

export async function getAnswersByAttempt(attemptId: string): Promise<LocalAnswer[]> {
  return db().answers.where('attemptId').equals(attemptId).toArray()
}

export async function getUnsyncedAnswers(attemptId: string): Promise<LocalAnswer[]> {
  return db().answers
    .where('[attemptId+questionId]')
    .between([attemptId, Dexie.minKey], [attemptId, Dexie.maxKey])
    .filter(a => !a.synced)
    .toArray()
}

export async function markAnswerSynced(id: number): Promise<void> {
  await db().answers.update(id, { synced: true })
}

export async function clearAnswers(attemptId: string): Promise<void> {
  await db().answers.where('attemptId').equals(attemptId).delete()
}

// ── activityLogs ──────────────────────────────────────────────────────────────

export async function addActivityLog(log: Omit<LocalActivityLog, 'id'>): Promise<number> {
  return db().activityLogs.add(log)
}

export async function getUnsyncedLogs(attemptId: string): Promise<LocalActivityLog[]> {
  return db().activityLogs
    .where('attemptId').equals(attemptId)
    .filter(l => !l.synced)
    .toArray()
}

export async function markLogsSynced(ids: number[]): Promise<void> {
  await db().activityLogs.bulkUpdate(ids.map(id => ({ key: id, changes: { synced: true } })))
}

// ── syncQueue ─────────────────────────────────────────────────────────────────

export async function enqueueSyncItem(item: Omit<LocalSyncItem, 'id'>): Promise<number> {
  return db().syncQueue.add(item)
}

export async function getPendingSyncItems(): Promise<LocalSyncItem[]> {
  return db().syncQueue
    .where('status').equals('PENDING' satisfies SyncStatus)
    .toArray()
}

export async function updateSyncItemStatus(
  id: number,
  status: SyncStatus,
  error?: string,
): Promise<void> {
  await db().syncQueue.update(id, {
    status,
    ...(error ? { lastError: error } : {}),
    ...(status === 'COMPLETED' ? { processedAt: Date.now() } : {}),
  })
}

export async function incrementRetry(id: number, error: string): Promise<void> {
  const item = await db().syncQueue.get(id)
  if (!item) return
  const newCount = item.retryCount + 1
  await db().syncQueue.update(id, {
    retryCount: newCount,
    lastError: error,
    status: newCount >= item.retryCount ? ('FAILED' satisfies SyncStatus) : item.status,
  })
}

// ── mediaBlobs ────────────────────────────────────────────────────────────────

export async function saveMediaBlob(blob: Omit<LocalMediaBlob, 'id'>): Promise<number> {
  return db().mediaBlobs.add(blob)
}

export async function getUnuploadedBlobs(attemptId: string): Promise<LocalMediaBlob[]> {
  return db().mediaBlobs
    .where('attemptId').equals(attemptId)
    .filter(b => !b.uploaded)
    .toArray()
}

export async function markBlobUploaded(id: number, objectKey: string): Promise<void> {
  await db().mediaBlobs.update(id, { uploaded: true, objectKey })
}

export async function clearSessionData(sessionId: string): Promise<void> {
  await Promise.all([
    db().answers.where('sessionId').equals(sessionId).delete(),
    db().activityLogs.where('sessionId').equals(sessionId).delete(),
    db().mediaBlobs.where('sessionId').equals(sessionId).delete(),
  ])
}

// Dexie import untuk minKey/maxKey
import Dexie from 'dexie'
