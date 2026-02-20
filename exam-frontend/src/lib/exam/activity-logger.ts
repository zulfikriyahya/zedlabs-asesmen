/**
 * Activity logger — merekam event tab blur, copy-paste, idle ke IndexedDB.
 * Dipanggil dari ActivityLogger component dan useExam hook.
 */

import { addActivityLog } from '@/lib/db/queries';
import { enqueueSyncItem } from '@/lib/db/queries';
import type { ActivityLogType, LocalActivityLog } from '@/types';
import type { ID } from '@/types/common';
import { v4 as uuidv4 } from 'uuid';

export interface LogActivityParams {
  attemptId: ID;
  sessionId: ID;
  type: ActivityLogType;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  const { attemptId, sessionId, type, metadata } = params;

  const log: Omit<LocalActivityLog, 'id'> = {
    attemptId,
    sessionId,
    type,
    metadata,
    timestamp: Date.now(),
    synced: false,
  };

  await addActivityLog(log);

  // Enqueue ke syncQueue untuk dikirim ke server
  await enqueueSyncItem({
    idempotencyKey: uuidv4(),
    type: 'ACTIVITY_LOG',
    payload: { attemptId, type, metadata, timestamp: log.timestamp },
    status: 'PENDING',
    retryCount: 0,
    createdAt: Date.now(),
  });
}

/**
 * Setup event listeners untuk deteksi aktivitas mencurigakan.
 * Mengembalikan cleanup function untuk dipanggil saat unmount.
 */
export function setupActivityListeners(params: {
  attemptId: ID;
  sessionId: ID;
  onLog?: (type: ActivityLogType) => void;
}): () => void {
  const { attemptId, sessionId, onLog } = params;

  const log = (type: ActivityLogType, metadata?: Record<string, unknown>) => {
    void logActivity({ attemptId, sessionId, type, metadata });
    onLog?.(type);
  };

  // Tab visibility
  const onVisibilityChange = () => {
    if (document.hidden) log('tab_blur');
    else log('tab_focus');
  };

  // Paste detection
  const onPaste = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text')?.slice(0, 100);
    log('copy_paste', { preview: text });
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('paste', onPaste);

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    document.removeEventListener('paste', onPaste);
  };
}
