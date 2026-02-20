'use client'
import { useEffect, useState } from 'react'
import { getPendingSyncItems } from '@/lib/db/queries'
import type { LocalSyncItem } from '@/types/sync'
import { Badge } from '@/components/ui/Badge'
import { formatRelative } from '@/lib/utils/format'

export function UploadQueue() {
  const [items, setItems] = useState<LocalSyncItem[]>([])

  useEffect(() => {
    const load = () => getPendingSyncItems().then(setItems)
    void load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  if (items.length === 0) return (
    <div className="text-center text-sm text-base-content/40 py-6">
      Tidak ada item pending di antrian
    </div>
  )

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-base-content/60">{items.length} item menunggu dikirim</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-2 rounded-box bg-base-200 px-3 py-2 text-xs">
          <div>
            <span className="font-mono font-medium">{item.type}</span>
            <span className="text-base-content/40 ml-2">{item.retryCount > 0 ? `retry #${item.retryCount}` : 'baru'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {item.lastError && (
              <Badge variant="error" size="xs">Error</Badge>
            )}
            <Badge
              variant={item.status === 'PENDING' ? 'warning' : item.status === 'FAILED' ? 'error' : 'success'}
              size="xs"
            >
              {item.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
