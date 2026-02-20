'use client';
import { clsx } from 'clsx';
import type { MultipleChoiceOption } from '@/types/question';

interface MultipleChoiceProps {
  options: MultipleChoiceOption[];
  value?: string;
  onChange: (key: string) => void;
  disabled?: boolean;
}

export function MultipleChoice({ options, value, onChange, disabled }: MultipleChoiceProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const selected = value === opt.key;
        return (
          <label
            key={opt.key}
            className={clsx(
              'flex cursor-pointer items-start gap-3 rounded-box border p-3 transition-colors',
              selected
                ? 'border-primary bg-primary/5'
                : 'border-base-300 hover:border-primary/40 hover:bg-base-200/50',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <input
              type="radio"
              name="mc-answer"
              className="radio-primary radio mt-0.5 shrink-0"
              checked={selected}
              onChange={() => !disabled && onChange(opt.key)}
              disabled={disabled}
            />
            <div className="flex items-start gap-2">
              <span
                className={clsx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase',
                  selected ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/60',
                )}
              >
                {opt.key}
              </span>
              <span className="text-sm leading-relaxed">{opt.text}</span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
