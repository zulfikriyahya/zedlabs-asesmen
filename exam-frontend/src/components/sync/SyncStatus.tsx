'use client'
import { clsx } from 'clsx'
import { useSyncStatus } from '@/hooks/use-sync-status'
import { Tooltip } from '@/components/ui/Tooltip'

export function SyncStatus() {
  const { isOnline, isSyncing, pendingCount, failedCount, lastSyncAt, canSync } = useSyncStatus()

  const lastSync = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString('id-ID')
    : null

  return (
    <Tooltip tip={lastSync ? `Terakhir sync: ${lastSync}` : 'Belum pernah sync'}>
      <div className={clsx(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors',
        isSyncing && 'bg-warning/10 text-warning',
        !isSyncing && failedCount > 0 && 'bg-error/10 text-error',
        !isSyncing && failedCount === 0 && pendingCount > 0 && 'bg-warning/10 text-warning',
        !isSyncing && failedCount === 0 && pendingCount === 0 && 'bg-success/10 text-success',
      )}>
        {isSyncing
          ? <><span className="loading loading-spinner loading-xs" /> Syncing...</>
          : failedCount > 0
            ? <><span>✕</span> {failedCount} gagal</>
            : pendingCount > 0
              ? <><span className="animate-pulse">●</span> {pendingCount} pending</>
              : <><span>✓</span> Tersimpan</>
        }
      </div>
    </Tooltip>
  )
}
