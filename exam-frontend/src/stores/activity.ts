// src/stores/activity.ts
import { atom } from 'nanostores';
import type { ActivityLog } from '@/types/activity';

interface ActivityState {
  logs: ActivityLog[];
  pendingSync: number;
}

const initialState: ActivityState = {
  logs: [],
  pendingSync: 0,
};

export const $activityStore = atom<ActivityState>(initialState);

export function addActivityLog(log: ActivityLog): void {
  const state = $activityStore.get();
  $activityStore.set({
    logs: [...state.logs, log],
    pendingSync: state.pendingSync + 1,
  });
}

export function clearActivityLogs(): void {
  $activityStore.set(initialState);
}

export function decrementPendingSync(): void {
  const state = $activityStore.get();
  $activityStore.set({
    ...state,
    pendingSync: Math.max(0, state.pendingSync - 1),
  });
}