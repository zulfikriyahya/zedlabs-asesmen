'use client'
import { clsx } from 'clsx'
import { useSyncStatus } from '@/hooks/use-sync-status'

export function AutoSaveIndicator() {
  const { isSyncing, lastSyncAt, lastError, pendingCount } = useSyncStatus()

  const lastSyncFormatted = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {isSyncing ? (
        <>
          <span className="loading loading-spinner loading-xs text-warning" />
          <span className="text-warning">Menyimpan...</span>
        </>
      ) : lastError ? (
        <>
          <span className="h-2 w-2 rounded-full bg-error" />
          <span className="text-error">Gagal simpan</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
          <span className="text-warning">{pendingCount} belum tersimpan</span>
        </>
      ) : lastSyncFormatted ? (
        <>
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-base-content/50">Tersimpan {lastSyncFormatted}</span>
        </>
      ) : (
        <>
          <span className="h-2 w-2 rounded-full bg-base-300" />
          <span className="text-base-content/40">Auto-save aktif</span>
        </>
      )}
    </div>
  )
}
