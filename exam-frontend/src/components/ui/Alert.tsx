import { clsx } from 'clsx'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const ICONS: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
}

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div role="alert" className={clsx('alert', `alert-${variant}`, className)}>
      <span>{ICONS[variant]}</span>
      <div>
        {title && <h3 className="font-bold">{title}</h3>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
