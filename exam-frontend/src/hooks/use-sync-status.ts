'use client';
import { useSyncStore } from '@/stores/sync.store';
import { useOnlineStatus } from './use-online-status';

export function useSyncStatus() {
  const sync = useSyncStore();
  const isOnline = useOnlineStatus();

  return {
    ...sync,
    isOnline,
    canSync: isOnline && !sync.isSyncing && sync.pendingCount > 0,
  };
}
