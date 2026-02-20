'use client';
import { useCallback } from 'react';
import { useSyncStore } from '@/stores/sync.store';
import { getPendingSyncItems, updateSyncItemStatus, incrementRetry } from '@/lib/db/queries';
import { syncApi } from '@/lib/api/sync.api';
import type { ID } from '@/types/common';

const MAX_BATCH = 20;

export function usePowerSync(attemptId: ID) {
  const sync = useSyncStore();

  const flush = useCallback(async () => {
    if (sync.isSyncing) return;
    const items = await getPendingSyncItems();
    if (items.length === 0) return;

    sync.setSyncing(true);
    const batch = items.slice(0, MAX_BATCH);

    try {
      await syncApi.pushBatch({
        batch: batch.map((item) => ({
          type: item.type,
          attemptId,
          idempotencyKey: item.idempotencyKey,
          payload: item.payload,
        })),
      });
      await Promise.all(
        batch.map((item) =>
          item.id !== undefined ? updateSyncItemStatus(item.id, 'COMPLETED') : Promise.resolve(),
        ),
      );
      sync.setLastSync();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync error';
      await Promise.all(
        batch.map((item) =>
          item.id !== undefined ? incrementRetry(item.id, msg) : Promise.resolve(),
        ),
      );
      sync.setError(msg);
    } finally {
      sync.setSyncing(false);
      const remaining = await getPendingSyncItems();
      sync.setPending(remaining.length);
    }
  }, [attemptId, sync]);

  return { flush };
}
