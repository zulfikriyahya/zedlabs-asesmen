import { create } from 'zustand';
import type { SyncStatus } from '@/types/common';

interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncAt: number | null;
  lastError: string | null;
  overallStatus: SyncStatus | 'IDLE';

  setPending: (count: number) => void;
  setFailed: (count: number) => void;
  setSyncing: (v: boolean) => void;
  setLastSync: () => void;
  setError: (err: string | null) => void;
  incrementFailed: () => void;
  decrementPending: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  lastSyncAt: null,
  lastError: null,
  overallStatus: 'IDLE',

  setPending: (pendingCount) =>
    set({ pendingCount, overallStatus: pendingCount > 0 ? 'PENDING' : 'IDLE' }),

  setFailed: (failedCount) => set({ failedCount }),

  setSyncing: (isSyncing) =>
    set({ isSyncing, overallStatus: isSyncing ? 'PROCESSING' : get().overallStatus }),

  setLastSync: () => set({ lastSyncAt: Date.now(), overallStatus: 'COMPLETED', lastError: null }),

  setError: (lastError) =>
    set({ lastError, overallStatus: lastError ? 'FAILED' : get().overallStatus }),

  incrementFailed: () => set((s) => ({ failedCount: s.failedCount + 1 })),

  decrementPending: () =>
    set((s) => ({
      pendingCount: Math.max(0, s.pendingCount - 1),
      overallStatus: s.pendingCount - 1 <= 0 ? 'COMPLETED' : 'PROCESSING',
    })),
}));
