'use client'

interface ShortAnswerProps {
  value?: string
  onChange: (val: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ShortAnswer({ value = '', onChange, disabled, placeholder = 'Ketik jawaban singkat...' }: ShortAnswerProps) {
  return (
    <div className="form-control">
      <input
        type="text"
        className="input input-bordered w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={500}
      />
      <label className="label">
        <span className="label-text-alt text-base-content/40">{value.length}/500 karakter</span>
      </label>
    </div>
  )
}
