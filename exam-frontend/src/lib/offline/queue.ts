import { db } from '@/lib/db/schema';
import type { SyncQueueItem } from '@/types/sync';

export async function addToQueue(
  type: SyncQueueItem['type'],
  data: any,
  priority: number = 1
) {
  const item: SyncQueueItem = {
    type,
    data,
    priority,
    retry_count: 0,
    max_retries: 5,
    status: 'pending',
    created_at: new Date()
  };

  // @ts-ignore - Dexie types sometimes tricky with auto-increment
  return await db.sync_queue.add(item);
}

export async function getNextBatch(limit: number = 10) {
  return await db.sync_queue
    .where('status')
    .equals('pending')
    .sortBy('priority') 
    .then(items => items.reverse().slice(0, limit));
}

export async function markAsProcessed(id: number) {
  return await db.sync_queue.update(id, {
    status: 'completed',
    processed_at: new Date()
  });
}

export async function markAsFailed(id: number, error: string) {
  const item = await db.sync_queue.get(id);
  if (!item) return;

  const newRetryCount = item.retry_count + 1;
  const status = newRetryCount >= item.max_retries ? 'failed' : 'pending';

  return await db.sync_queue.update(id, {
    status,
    retry_count: newRetryCount,
    error_message: error
  });
}