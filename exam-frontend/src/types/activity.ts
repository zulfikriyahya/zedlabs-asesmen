import type { ID } from './common';
import type { ActivityLogType } from './sync';

export interface ExamActivityLog {
  id: ID;
  attemptId: ID;
  userId: ID;
  type: ActivityLogType;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// State lokal di IndexedDB sebelum sync
export interface LocalActivityLog {
  id?: number; // Dexie auto-increment
  attemptId: ID;
  sessionId: ID;
  type: ActivityLogType;
  metadata?: Record<string, unknown>;
  timestamp: number; // Date.now()
  synced: boolean;
}

// Untuk monitoring real-time via Socket.IO
export interface LiveActivityEvent {
  attemptId: ID;
  userId: ID;
  username: string;
  type: ActivityLogType;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Statistik ringkasan per attempt (untuk monitoring & audit review)
export interface ActivitySummary {
  attemptId: ID;
  userId: ID;
  username: string;
  tabBlurCount: number;
  copyPasteCount: number;
  idleCount: number;
  totalEvents: number;
  lastEventAt: string | null;
}
