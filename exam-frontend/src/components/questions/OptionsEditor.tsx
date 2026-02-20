'use client'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import type { MultipleChoiceOption } from '@/types/question'

const DEFAULT_KEYS = ['a', 'b', 'c', 'd', 'e']

interface OptionsEditorProps {
  fieldName: string   // 'options'
  correctAnswerField?: string
  multi?: boolean     // COMPLEX_MULTIPLE_CHOICE
}

export function OptionsEditor({ fieldName, correctAnswerField = 'correctAnswer', multi = false }: OptionsEditorProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const options: MultipleChoiceOption[] = watch(fieldName) ?? []
  const correctAnswer: string | string[] = watch(correctAnswerField) ?? (multi ? [] : '')

  const addOption = () => {
    const key = DEFAULT_KEYS[options.length] ?? String.fromCharCode(97 + options.length)
    setValue(fieldName, [...options, { key, text: '' }])
  }

  const removeOption = (idx: number) => {
    const removed = options[idx]!.key
    const next = options.filter((_, i) => i !== idx)
    setValue(fieldName, next)
    // Hapus dari correctAnswer jika ada
    if (multi) {
      setValue(correctAnswerField, (correctAnswer as string[]).filter(k => k !== removed))
    } else if (correctAnswer === removed) {
      setValue(correctAnswerField, '')
    }
  }

  const toggleCorrect = (key: string) => {
    if (multi) {
      const arr = correctAnswer as string[]
      setValue(correctAnswerField, arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key])
    } else {
      setValue(correctAnswerField, key)
    }
  }

  return (
    <div className="space-y-2">
      <label className="label">
        <span className="label-text font-medium">Pilihan Jawaban</span>
        <span className="label-text-alt text-base-content/40">
          {multi ? 'Klik ✓ untuk pilih jawaban benar (bisa lebih dari satu)' : 'Klik ✓ untuk pilih jawaban benar'}
        </span>
      </label>
      {options.map((opt, idx) => {
        const isCorrect = multi
          ? (correctAnswer as string[]).includes(opt.key)
          : correctAnswer === opt.key
        return (
          <div key={idx} className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-base-300 text-xs font-bold uppercase">
              {opt.key}
            </span>
            <input
              {...register(`${fieldName}.${idx}.text`)}
              placeholder={`Pilihan ${opt.key.toUpperCase()}`}
              className="input input-bordered input-sm flex-1"
            />
            <button
              type="button"
              title="Tandai sebagai jawaban benar"
              onClick={() => toggleCorrect(opt.key)}
              className={`btn btn-sm btn-square ${isCorrect ? 'btn-success' : 'btn-ghost border border-base-300'}`}
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => removeOption(idx)}
              className="btn btn-sm btn-square btn-ghost text-error"
              disabled={options.length <= 2}
            >
              ✕
            </button>
          </div>
        )
      })}
      {options.length < 6 && (
        <Button type="button" size="xs" variant="ghost" onClick={addOption} className="mt-1">
          + Tambah Pilihan
        </Button>
      )}
    </div>
  )
}
