import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number   // ms; undefined = tidak auto-dismiss
}

interface UiState {
  toasts: Toast[]
  isOnline: boolean
  isSidebarOpen: boolean
  theme: 'light' | 'dark'

  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  setOnline: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
  toggleSidebar: () => void
  setTheme: (t: 'light' | 'dark') => void
}

let _toastCounter = 0

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSidebarOpen: true,
  theme: 'light',

  addToast: (toast) => {
    const id = `toast-${++_toastCounter}`
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }))
    return id
  },

  removeToast: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),

  setOnline: (isOnline) => set({ isOnline }),

  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),

  setTheme: (theme) => {
    set({ theme })
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  },
}))
