'use client'
import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  inputSize?: 'xs' | 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, inputSize = 'md', className, ...rest }, ref) => (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'input input-bordered w-full',
          inputSize !== 'md' && `input-${inputSize}`,
          error && 'input-error',
          className,
        )}
        {...rest}
      />
      {(error || hint) && (
        <label className="label">
          <span className={clsx('label-text-alt', error ? 'text-error' : 'text-base-content/60')}>
            {error ?? hint}
          </span>
        </label>
      )}
    </div>
  ),
)
Input.displayName = 'Input'
