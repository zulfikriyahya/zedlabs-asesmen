'use client'
import { clsx } from 'clsx'
import type { MultipleChoiceOption } from '@/types/question'

interface MultipleChoiceComplexProps {
  options: MultipleChoiceOption[]
  value?: string[]
  onChange: (keys: string[]) => void
  disabled?: boolean
}

export function MultipleChoiceComplex({ options, value = [], onChange, disabled }: MultipleChoiceComplexProps) {
  const toggle = (key: string) => {
    const next = value.includes(key) ? value.filter(k => k !== key) : [...value, key]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-base-content/50 mb-3">Pilih satu atau lebih jawaban yang benar</p>
      {options.map(opt => {
        const checked = value.includes(opt.key)
        return (
          <label
            key={opt.key}
            className={clsx(
              'flex cursor-pointer items-start gap-3 rounded-box border p-3 transition-colors',
              checked ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/40 hover:bg-base-200/50',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <input
              type="checkbox"
              className="checkbox checkbox-primary mt-0.5 shrink-0"
              checked={checked}
              onChange={() => !disabled && toggle(opt.key)}
              disabled={disabled}
            />
            <div className="flex items-start gap-2">
              <span className={clsx(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase',
                checked ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/60',
              )}>
                {opt.key}
              </span>
              <span className="text-sm leading-relaxed">{opt.text}</span>
            </div>
          </label>
        )
      })}
    </div>
  )
}
