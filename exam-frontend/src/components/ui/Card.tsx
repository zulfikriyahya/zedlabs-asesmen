import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  compact?: boolean
  bordered?: boolean
}

export function Card({ children, className, compact, bordered }: CardProps) {
  return (
    <div className={clsx('card bg-base-100 shadow-sm', compact && 'card-compact', bordered && 'border border-base-300', className)}>
      <div className="card-body">{children}</div>
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={clsx('card-title', className)}>{children}</h2>
}
