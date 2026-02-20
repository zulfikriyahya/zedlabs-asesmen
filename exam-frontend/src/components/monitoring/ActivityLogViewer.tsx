import { clsx } from 'clsx'
import type { ActivitySummary, LiveActivityEvent } from '@/types/activity'
import { formatDateTime } from '@/lib/utils/format'

const EVENT_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  tab_blur: { label: 'Keluar Tab', icon: '👁', className: 'text-warning' },
  tab_focus: { label: 'Kembali ke Tab', icon: '✓', className: 'text-success' },
  copy_paste: { label: 'Copy-Paste', icon: '📋', className: 'text-error' },
  idle: { label: 'Idle', icon: '💤', className: 'text-base-content/40' },
  resume: { label: 'Resume', icon: '▶', className: 'text-info' },
  screen_capture_attempt: { label: 'Screenshot', icon: '📸', className: 'text-error font-bold' },
}

interface ActivityLogViewerProps {
  logs: LiveActivityEvent[]
  username?: string
}

export function ActivityLogViewer({ logs, username }: ActivityLogViewerProps) {
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-2">
      {username && <h3 className="text-sm font-semibold">Log Aktivitas: {username}</h3>}
      {sorted.length === 0 ? (
        <p className="text-xs text-base-content/40 py-4 text-center">Belum ada aktivitas tercatat</p>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {sorted.map((log, i) => {
            const cfg = EVENT_CONFIG[log.type] ?? { label: log.type, icon: '•', className: '' }
            return (
              <div key={i} className="flex items-start gap-2 text-xs py-1 border-b border-base-200 last:border-0">
                <span>{cfg.icon}</span>
                <div className="flex-1">
                  <span className={clsx('font-medium', cfg.className)}>{cfg.label}</span>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <span className="text-base-content/40 ml-1">
                      {log.metadata.preview ? `"${String(log.metadata.preview).slice(0, 40)}"` : ''}
                    </span>
                  )}
                </div>
                <span className="text-base-content/30 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
