// src/stores/sync.ts
import { atom } from 'nanostores';
import type { SyncProgress } from '@/types/sync';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  progress: SyncProgress | null;
  lastSync: Date | null;
  error: string | null;
}

const initialState: SyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false,
  isSyncing: false,
  progress: null,
  lastSync: null,
  error: null,
};

export const $syncStore = atom<SyncState>(initialState);

export function setOnlineStatus(isOnline: boolean): void {
  $syncStore.set({
    ...$syncStore.get(),
    isOnline,
  });
}

export function setSyncing(isSyncing: boolean): void {
  $syncStore.set({
    ...$syncStore.get(),
    isSyncing,
  });
}

export function setSyncProgress(progress: SyncProgress): void {
  $syncStore.set({
    ...$syncStore.get(),
    progress,
  });
}

export function setSyncCompleted(): void {
  $syncStore.set({
    ...$syncStore.get(),
    isSyncing: false,
    progress: null,
    lastSync: new Date(),
    error: null,
  });
}

export function setSyncError(error: string): void {
  $syncStore.set({
    ...$syncStore.get(),
    isSyncing: false,
    error,
  });
}

export function clearSyncError(): void {
  $syncStore.set({
    ...$syncStore.get(),
    error: null,
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setOnlineStatus(true));
  window.addEventListener('offline', () => setOnlineStatus(false));
}