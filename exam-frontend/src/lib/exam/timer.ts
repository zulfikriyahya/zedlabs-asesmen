export interface TimerConfig {
  durationSeconds: number
  startedAt: number        // Date.now() saat attempt dimulai
}

export function calcRemainingSeconds(config: TimerConfig): number {
  const elapsedMs = Date.now() - config.startedAt
  const elapsed = Math.floor(elapsedMs / 1000)
  return Math.max(0, config.durationSeconds - elapsed)
}

export function calcElapsedSeconds(startedAt: number): number {
  return Math.floor((Date.now() - startedAt) / 1000)
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
