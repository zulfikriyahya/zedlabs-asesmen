'use client';
import { useRef } from 'react';

interface EssayProps {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  minRows?: number;
  maxLength?: number;
}

export function Essay({
  value = '',
  onChange,
  disabled,
  minRows = 6,
  maxLength = 5000,
}: EssayProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > maxLength) return;
    onChange(e.target.value);
    // Auto-resize
    const el = ref.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  return (
    <div className="form-control">
      <textarea
        ref={ref}
        className="textarea textarea-bordered w-full resize-none leading-relaxed"
        rows={minRows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Tuliskan jawaban Anda di sini..."
        style={{ minHeight: `${minRows * 1.75}rem` }}
      />
      <label className="label">
        <span className="label-text-alt text-base-content/40">
          {value.length}/{maxLength} karakter
        </span>
        {value.length > maxLength * 0.9 && (
          <span className="label-text-alt text-warning">Mendekati batas</span>
        )}
      </label>
    </div>
  );
}
