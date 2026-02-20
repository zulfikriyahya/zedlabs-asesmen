import { enqueueSyncItem, getPendingSyncItems } from '@/lib/db/queries';
import { useSyncStore } from '@/stores/sync.store';
import type { SyncType, SyncPayload } from '@/types/sync';
import { v4 as uuidv4 } from 'uuid';

export async function enqueue(type: SyncType, payload: SyncPayload): Promise<void> {
  await enqueueSyncItem({
    idempotencyKey: uuidv4(),
    type,
    payload,
    status: 'PENDING',
    retryCount: 0,
    createdAt: Date.now(),
  });
  const items = await getPendingSyncItems();
  useSyncStore.getState().setPending(items.length);
}
