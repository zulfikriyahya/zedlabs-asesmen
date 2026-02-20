import { apiGet, apiPost } from './client'
import type { PowerSyncBatch } from '@/types/sync'
import type { ID } from '@/types/common'

export const syncApi = {
  pushBatch: (batch: PowerSyncBatch) =>
    apiPost<{ processed: number; failed: number }>('sync', batch),

  getStatus: (attemptId: ID) =>
    apiGet<{ pending: number; failed: number; lastProcessed: string | null }>(
      `sync/status/${attemptId}`,
    ),

  powersyncPush: (batch: PowerSyncBatch) =>
    apiPost<void>('powersync/data', batch),
}
