'use client'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'error' | 'warning' | 'primary'
  loading?: boolean
}

export function Confirm({
  open, onConfirm, onCancel, title = 'Konfirmasi',
  message, confirmLabel = 'Ya', cancelLabel = 'Batal',
  variant = 'primary', loading,
}: ConfirmProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <p className="mb-6 text-base-content/80">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
