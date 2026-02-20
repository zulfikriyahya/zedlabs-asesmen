'use client'
import { clsx } from 'clsx'
import type { MatchingOption } from '@/types/question'

interface MatchingProps {
  options: MatchingOption
  value?: Record<string, string>
  onChange: (val: Record<string, string>) => void
  disabled?: boolean
}

export function Matching({ options, value = {}, onChange, disabled }: MatchingProps) {
  const handleSelect = (leftKey: string, rightKey: string) => {
    const current = value[leftKey]
    // Toggle: klik ulang rightKey yang sama = hapus pilihan
    const next = { ...value, [leftKey]: current === rightKey ? '' : rightKey }
    onChange(next)
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th>Pernyataan</th>
            {options.right.map(r => (
              <th key={r.key} className="text-center">{r.key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {options.left.map(l => (
            <tr key={l.key} className="hover">
              <td className="text-sm">{l.text}</td>
              {options.right.map(r => (
                <td key={r.key} className="text-center">
                  <input
                    type="radio"
                    name={`match-${l.key}`}
                    className="radio radio-primary radio-sm"
                    checked={value[l.key] === r.key}
                    onChange={() => !disabled && handleSelect(l.key, r.key)}
                    disabled={disabled}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            {options.right.map(r => (
              <td key={r.key} className="text-center text-xs text-base-content/60">{r.text}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
