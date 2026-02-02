// src/lib/offline/sync.ts
import { db } from '@/lib/db/schema';
import { apiClient } from '@/lib/api/client';
import type { SyncQueueItem, SyncProgress } from '@/types/sync';

export class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.stopSync();
    });
  }

  start(): void {
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, 30000);

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async processSyncQueue(): Promise<void> {
    if (this.isSyncing) return;

    this.isSyncing = true;

    try {
      const pendingItems = await db.sync_queue
        .where('status')
        .equals('pending')
        .or('status')
        .equals('failed')
        .filter(item => item.retry_count < item.max_retries)
        .sortBy('priority');

      for (const item of pendingItems.reverse()) {
        await this.processItem(item);
      }
    } catch (error) {
      console.error('Sync queue processing failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    try {
      await db.sync_queue.update(item.id!, { status: 'processing' });

      switch (item.type) {
        case 'answer':
          await this.syncAnswer(item);
          break;
        case 'media':
          await this.syncMedia(item);
          break;
        case 'activity':
          await this.syncActivity(item);
          break;
        case 'submission':
          await this.syncSubmission(item);
          break;
      }

      await db.sync_queue.update(item.id!, {
        status: 'completed',
        processed_at: new Date(),
      });

      window.dispatchEvent(
        new CustomEvent('sync:progress', {
          detail: { item, status: 'completed' },
        })
      );
    } catch (error: any) {
      console.error(`Failed to sync item ${item.id}:`, error);

      const newRetryCount = item.retry_count + 1;

      if (newRetryCount >= item.max_retries) {
        await db.sync_queue.update(item.id!, {
          status: 'failed',
          retry_count: newRetryCount,
          error_message: error.message,
        });

        window.dispatchEvent(
          new CustomEvent('sync:error', {
            detail: { item, error: error.message },
          })
        );
      } else {
        await db.sync_queue.update(item.id!, {
          status: 'pending',
          retry_count: newRetryCount,
          error_message: error.message,
        });
      }
    }
  }

  private async syncAnswer(item: SyncQueueItem): Promise<void> {
    const { attempt_id, answers } = item.data;
    await apiClient.post(`/student/attempts/${attempt_id}/answers`, { answers });
  }

  private async syncMedia(item: SyncQueueItem): Promise<void> {
    const { attempt_id, answer_id, media_blob, checksum } = item.data;
    
    const formData = new FormData();
    formData.append('file', media_blob);
    formData.append('checksum', checksum);
    
    await apiClient.post(`/student/attempts/${attempt_id}/answers/${answer_id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  private async syncActivity(item: SyncQueueItem): Promise<void> {
    const { attempt_id, events } = item.data;
    await apiClient.post(`/student/attempts/${attempt_id}/activity`, { events });
  }

  private async syncSubmission(item: SyncQueueItem): Promise<void> {
    const { attempt_id, submitted_at, answers, activity_logs } = item.data;
    await apiClient.post(`/student/attempts/${attempt_id}/submit`, {
      submitted_at,
      answers,
      activity_logs,
    });
  }

  async getSyncStatus(attemptId: number): Promise<SyncProgress> {
    const items = await db.sync_queue
      .where('attempt_id')
      .equals(attemptId)
      .toArray();

    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const failed = items.filter(i => i.status === 'failed').length;
    const pending = items.filter(i => i.status === 'pending' || i.status === 'processing').length;

    return {
      total,
      completed,
      failed,
      pending,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}

export const syncManager = new SyncManager();