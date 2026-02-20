'use client'
import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
}

export function Modal({ open, onClose, title, children, size = 'md', closeOnBackdrop = true }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) ref.current?.showModal()
    else ref.current?.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onClose}
      onClick={closeOnBackdrop ? (e) => { if (e.target === ref.current) onClose() } : undefined}
    >
      <div className={clsx(
        'modal-box',
        size === 'sm' && 'max-w-sm',
        size === 'lg' && 'max-w-3xl',
        size === 'xl' && 'max-w-5xl',
      )}>
        {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
        <button className="btn btn-ghost btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>✕</button>
        {children}
      </div>
    </dialog>
  )
}
