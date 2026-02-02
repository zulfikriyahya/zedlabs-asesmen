// src/lib/db/queries.ts
import { db } from './schema';
import type { ExamAnswer } from '@/types/answer';
import type { ActivityLog } from '@/types/activity';
import type { SyncQueueItem } from '@/types/sync';

/**
 * Get all answers for an attempt
 */
export async function getAnswersByAttempt(attemptId: number): Promise<ExamAnswer[]> {
  return await db.exam_answers
    .where('attempt_id')
    .equals(attemptId)
    .toArray();
}

/**
 * Get unsynced answers
 */
export async function getUnsyncedAnswers(): Promise<ExamAnswer[]> {
  return await db.exam_answers
    .where('synced')
    .equals(0)
    .toArray();
}

/**
 * Mark answer as synced
 */
export async function markAnswerSynced(answerId: number): Promise<void> {
  await db.exam_answers.update(answerId, { synced: true });
}

/**
 * Get activity logs for an attempt
 */
export async function getActivityLogsByAttempt(attemptId: number): Promise<ActivityLog[]> {
  return await db.activity_logs
    .where('attempt_id')
    .equals(attemptId)
    .sortBy('timestamp');
}

/**
 * Get unsynced activity logs
 */
export async function getUnsyncedActivityLogs(): Promise<ActivityLog[]> {
  return await db.activity_logs
    .where('synced')
    .equals(0)
    .toArray();
}

/**
 * Get pending sync queue items
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return await db.sync_queue
    .where('status')
    .equals('pending')
    .or('status')
    .equals('failed')
    .filter(item => item.retry_count < item.max_retries)
    .sortBy('priority');
}

/**
 * Get sync queue items by attempt
 */
export async function getSyncItemsByAttempt(attemptId: number): Promise<SyncQueueItem[]> {
  return await db.sync_queue
    .where('attempt_id')
    .equals(attemptId)
    .toArray();
}

/**
 * Clear all data (for logout)
 */
export async function clearAllData(): Promise<void> {
  await db.exam_answers.clear();
  await db.activity_logs.clear();
  await db.sync_queue.clear();
  await db.exam_states.clear();
  await db.downloaded_exams.clear();
  await db.media_files.clear();
}

/**
 * Get database size estimate
 */
export async function getDatabaseSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}