import { clsx } from 'clsx'

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'xs' | 'sm' | 'md' | 'lg'
  outline?: boolean
  className?: string
}

export function Badge({ children, variant = 'neutral', size, outline, className }: BadgeProps) {
  return (
    <span className={clsx(
      'badge',
      `badge-${variant}`,
      size && `badge-${size}`,
      outline && 'badge-outline',
      className,
    )}>
      {children}
    </span>
  )
}
