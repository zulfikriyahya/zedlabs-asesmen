'use client'
import { clsx } from 'clsx'
import { useUiStore } from '@/stores/ui.store'

const VARIANT_CLASS: Record<string, string> = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
}

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore()
  if (toasts.length === 0) return null

  return (
    <div className="toast toast-end toast-bottom z-50">
      {toasts.map(t => (
        <div
          key={t.id}
          role="alert"
          className={clsx('alert shadow-lg cursor-pointer animate-fade-in', VARIANT_CLASS[t.variant])}
          onClick={() => removeToast(t.id)}
        >
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
