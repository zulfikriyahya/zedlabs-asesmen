import { create } from 'zustand'
import type { ActivityLogType, LocalActivityLog } from '@/types'

interface ActivityState {
  logs: LocalActivityLog[]
  tabBlurCount: number
  copyPasteCount: number
  idleCount: number
  isTabActive: boolean

  addLog: (log: Omit<LocalActivityLog, 'id' | 'synced'>) => void
  setTabActive: (v: boolean) => void
  clearLogs: () => void
}

export const useActivityStore = create<ActivityState>((set) => ({
  logs: [],
  tabBlurCount: 0,
  copyPasteCount: 0,
  idleCount: 0,
  isTabActive: true,

  addLog: (log) =>
    set(s => {
      const counter: Partial<Record<ActivityLogType, keyof ActivityState>> = {
        tab_blur: 'tabBlurCount',
        copy_paste: 'copyPasteCount',
        idle: 'idleCount',
      }
      const key = counter[log.type as ActivityLogType]
      return {
        logs: [...s.logs, { ...log, synced: false }],
        ...(key ? { [key]: (s[key] as number) + 1 } : {}),
      }
    }),

  setTabActive: (isTabActive) => set({ isTabActive }),

  clearLogs: () =>
    set({ logs: [], tabBlurCount: 0, copyPasteCount: 0, idleCount: 0 }),
}))
