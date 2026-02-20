'use client'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import type { MatchingOption } from '@/types/question'

export function MatchingEditor() {
  const { watch, setValue } = useFormContext()
  const options: MatchingOption = watch('options') ?? { left: [], right: [] }
  const correctAnswer: Record<string, string> = watch('correctAnswer') ?? {}

  const addPair = () => {
    const idx = options.left.length
    const leftKey = String.fromCharCode(65 + idx) // A, B, C...
    const rightKey = String(idx + 1)               // 1, 2, 3...
    setValue('options', {
      left: [...options.left, { key: leftKey, text: '' }],
      right: [...options.right, { key: rightKey, text: '' }],
    })
  }

  const removePair = (idx: number) => {
    const lKey = options.left[idx]?.key
    const rKey = options.right[idx]?.key
    setValue('options', {
      left: options.left.filter((_, i) => i !== idx),
      right: options.right.filter((_, i) => i !== idx),
    })
    if (lKey) {
      const { [lKey]: _, ...rest } = correctAnswer
      setValue('correctAnswer', rest)
    }
  }

  const setMatch = (leftKey: string, rightKey: string) => {
    setValue('correctAnswer', { ...correctAnswer, [leftKey]: rightKey })
  }

  return (
    <div className="space-y-3">
      <label className="label">
        <span className="label-text font-medium">Pasangan Menjodohkan</span>
        <span className="label-text-alt text-base-content/40">Atur pasangan jawaban yang benar</span>
      </label>
      {options.left.map((l, idx) => {
        const r = options.right[idx]
        return (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={l.text}
              onChange={e => {
                const next = [...options.left]
                next[idx] = { ...l, text: e.target.value }
                setValue('options', { ...options, left: next })
              }}
              placeholder={`Kiri ${l.key}`}
              className="input input-bordered input-sm flex-1"
            />
            {/* Select pasangan kanan */}
            <select
              className="select select-bordered select-sm w-32"
              value={correctAnswer[l.key] ?? ''}
              onChange={e => setMatch(l.key, e.target.value)}
            >
              <option value="">— Pasangan</option>
              {options.right.map(rv => (
                <option key={rv.key} value={rv.key}>{rv.key}. {rv.text.slice(0, 20)}</option>
              ))}
            </select>
            {r && (
              <input
                value={r.text}
                onChange={e => {
                  const next = [...options.right]
                  next[idx] = { ...r, text: e.target.value }
                  setValue('options', { ...options, right: next })
                }}
                placeholder={`Kanan ${r.key}`}
                className="input input-bordered input-sm flex-1"
              />
            )}
            <button
              type="button"
              onClick={() => removePair(idx)}
              className="btn btn-sm btn-square btn-ghost text-error"
              disabled={options.left.length <= 2}
            >✕</button>
          </div>
        )
      })}
      {options.left.length < 8 && (
        <Button type="button" size="xs" variant="ghost" onClick={addPair}>+ Tambah Baris</Button>
      )}
    </div>
  )
}
