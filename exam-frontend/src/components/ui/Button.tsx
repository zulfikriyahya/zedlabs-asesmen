'use client'
import { forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'error' | 'warning' | 'success'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  wide?: boolean
  outline?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, wide, outline, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'btn',
        variant && `btn-${variant}`,
        size !== 'md' && `btn-${size}`,
        wide && 'btn-wide',
        outline && 'btn-outline',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="loading loading-spinner loading-sm" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
