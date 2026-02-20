import { getPendingSyncItems, updateSyncItemStatus, incrementRetry } from '@/lib/db/queries';
import { syncApi } from '@/lib/api/sync.api';
import { useSyncStore } from '@/stores/sync.store';
import { isOnline } from '@/lib/utils/network';
import type { ID } from '@/types/common';

export async function flushSyncQueue(attemptId: ID): Promise<void> {
  if (!isOnline()) return;
  const sync = useSyncStore.getState();
  if (sync.isSyncing) return;

  const items = await getPendingSyncItems();
  if (items.length === 0) return;

  sync.setSyncing(true);
  try {
    const res = await syncApi.pushBatch({
      batch: items.slice(0, 20).map((i) => ({
        type: i.type,
        attemptId,
        idempotencyKey: i.idempotencyKey,
        payload: i.payload,
      })),
    });

    await Promise.all(
      items
        .slice(0, 20)
        .map((i) =>
          i.id !== undefined ? updateSyncItemStatus(i.id, 'COMPLETED') : Promise.resolve(),
        ),
    );
    sync.setLastSync();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sync failed';
    sync.setError(msg);
  } finally {
    sync.setSyncing(false);
    const remaining = await getPendingSyncItems();
    sync.setPending(remaining.length);
  }
}
