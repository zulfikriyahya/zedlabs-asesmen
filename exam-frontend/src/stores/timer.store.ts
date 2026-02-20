import { create } from 'zustand'

interface TimerState {
  durationSeconds: number    // total durasi ujian
  remainingSeconds: number
  isRunning: boolean
  isExpired: boolean
  startedAt: number | null   // Date.now() saat timer mulai

  start: (durationSeconds: number, elapsedSeconds?: number) => void
  tick: () => void           // dipanggil setiap detik oleh useTimer hook
  pause: () => void
  resume: () => void
  expire: () => void
  reset: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  durationSeconds: 0,
  remainingSeconds: 0,
  isRunning: false,
  isExpired: false,
  startedAt: null,

  start: (durationSeconds, elapsedSeconds = 0) => {
    const remaining = Math.max(0, durationSeconds - elapsedSeconds)
    set({
      durationSeconds,
      remainingSeconds: remaining,
      isRunning: remaining > 0,
      isExpired: remaining === 0,
      startedAt: Date.now() - elapsedSeconds * 1000,
    })
  },

  tick: () => {
    const { remainingSeconds } = get()
    if (remainingSeconds <= 1) {
      set({ remainingSeconds: 0, isRunning: false, isExpired: true })
    } else {
      set({ remainingSeconds: remainingSeconds - 1 })
    }
  },

  pause: () => set({ isRunning: false }),

  resume: () => {
    const { remainingSeconds } = get()
    if (remainingSeconds > 0) set({ isRunning: true })
  },

  expire: () => set({ remainingSeconds: 0, isRunning: false, isExpired: true }),

  reset: () =>
    set({
      durationSeconds: 0,
      remainingSeconds: 0,
      isRunning: false,
      isExpired: false,
      startedAt: null,
    }),
}))

// Selectors
export const selectFormattedTime = (s: TimerState): string => {
  const h = Math.floor(s.remainingSeconds / 3600)
  const m = Math.floor((s.remainingSeconds % 3600) / 60)
  const sec = s.remainingSeconds % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export const selectProgressPercent = (s: TimerState): number => {
  if (s.durationSeconds === 0) return 0
  return Math.round(((s.durationSeconds - s.remainingSeconds) / s.durationSeconds) * 100)
}

export const selectIsWarning = (s: TimerState): boolean =>
  s.remainingSeconds > 0 && s.remainingSeconds <= 300   // 5 menit terakhir
