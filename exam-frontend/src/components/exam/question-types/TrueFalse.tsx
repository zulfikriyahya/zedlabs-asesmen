'use client';
import { clsx } from 'clsx';

interface TrueFalseProps {
  value?: string;
  onChange: (val: 'true' | 'false') => void;
  disabled?: boolean;
}

export function TrueFalse({ value, onChange, disabled }: TrueFalseProps) {
  return (
    <div className="flex gap-4">
      {(['true', 'false'] as const).map((opt) => {
        const selected = value === opt;
        const label = opt === 'true' ? 'Benar' : 'Salah';
        const emoji = opt === 'true' ? '✓' : '✕';
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !disabled && onChange(opt)}
            disabled={disabled}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-box border-2 py-4 text-sm font-semibold transition-all',
              selected && opt === 'true' && 'border-success bg-success/10 text-success',
              selected && opt === 'false' && 'border-error bg-error/10 text-error',
              !selected && 'border-base-300 hover:border-base-content/30',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <span className="text-xl">{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
