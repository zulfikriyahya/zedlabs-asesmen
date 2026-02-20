'use client'
import { useEffect } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { QuestionType } from '@/types/common'
import { OptionsEditor } from './OptionsEditor'
import { MatchingEditor } from './MatchingEditor'
import { MediaUpload } from './MediaUpload'
import { TagSelector } from './TagSelector'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const QUESTION_TYPES: Array<{ value: QuestionType; label: string }> = [
  { value: 'MULTIPLE_CHOICE', label: 'Pilihan Ganda' },
  { value: 'COMPLEX_MULTIPLE_CHOICE', label: 'Pilihan Ganda Kompleks' },
  { value: 'TRUE_FALSE', label: 'Benar/Salah' },
  { value: 'MATCHING', label: 'Menjodohkan' },
  { value: 'SHORT_ANSWER', label: 'Jawaban Singkat' },
  { value: 'ESSAY', label: 'Esai' },
]

interface QuestionEditorProps {
  subjects: Array<{ value: string; label: string }>
}

export function QuestionEditor({ subjects }: QuestionEditorProps) {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext()
  const qType: QuestionType = watch('type')

  // Init options saat tipe berubah
  useEffect(() => {
    if (qType === 'MULTIPLE_CHOICE' || qType === 'COMPLEX_MULTIPLE_CHOICE') {
      setValue('options', [
        { key: 'a', text: '' }, { key: 'b', text: '' },
        { key: 'c', text: '' }, { key: 'd', text: '' },
      ])
      setValue('correctAnswer', qType === 'COMPLEX_MULTIPLE_CHOICE' ? [] : '')
    } else if (qType === 'TRUE_FALSE') {
      setValue('options', null)
      setValue('correctAnswer', '')
    } else if (qType === 'MATCHING') {
      setValue('options', {
        left: [{ key: 'A', text: '' }, { key: 'B', text: '' }],
        right: [{ key: '1', text: '' }, { key: '2', text: '' }],
      })
      setValue('correctAnswer', {})
    } else {
      setValue('options', null)
      setValue('correctAnswer', '')
    }
  }, [qType, setValue])

  return (
    <div className="space-y-5">
      {/* Mata pelajaran + Tipe */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="subjectId"
          render={({ field, fieldState }) => (
            <Select
              label="Mata Pelajaran"
              options={subjects}
              placeholder="Pilih mata pelajaran"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="type"
          render={({ field, fieldState }) => (
            <Select
              label="Tipe Soal"
              options={QUESTION_TYPES}
              placeholder="Pilih tipe"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
      </div>

      {/* Konten soal */}
      <div className="form-control">
        <label className="label"><span className="label-text font-medium">Teks Soal</span></label>
        <textarea
          {...register('content.text')}
          rows={4}
          placeholder="Tulis pertanyaan di sini..."
          className={`textarea textarea-bordered resize-none leading-relaxed ${errors.content ? 'textarea-error' : ''}`}
        />
        {errors['content.text' as keyof typeof errors] && (
          <label className="label">
            <span className="label-text-alt text-error">Teks soal wajib diisi</span>
          </label>
        )}
      </div>

      {/* Media upload untuk soal */}
      <Controller
        control={control}
        name="content.images"
        render={({ field }) => (
          <MediaUpload
            value={field.value ?? []}
            onChange={field.onChange}
            label="Gambar Soal (opsional)"
            maxFiles={3}
          />
        )}
      />

      {/* Input jawaban sesuai tipe */}
      {(qType === 'MULTIPLE_CHOICE' || qType === 'COMPLEX_MULTIPLE_CHOICE') && (
        <OptionsEditor fieldName="options" multi={qType === 'COMPLEX_MULTIPLE_CHOICE'} />
      )}

      {qType === 'TRUE_FALSE' && (
        <div className="form-control">
          <label className="label"><span className="label-text font-medium">Jawaban Benar</span></label>
          <div className="flex gap-3">
            {['true', 'false'].map(v => {
              const curr = watch('correctAnswer')
              return (
                <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-box border-2 px-4 py-2 ${curr === v ? 'border-primary bg-primary/5' : 'border-base-300'}`}>
                  <input
                    type="radio"
                    className="radio radio-primary radio-sm"
                    {...register('correctAnswer')}
                    value={v}
                    checked={curr === v}
                    onChange={() => setValue('correctAnswer', v)}
                  />
                  {v === 'true' ? 'Benar' : 'Salah'}
                </label>
              )
            })}
          </div>
        </div>
      )}

      {qType === 'MATCHING' && <MatchingEditor />}

      {(qType === 'SHORT_ANSWER' || qType === 'ESSAY') && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Kunci Jawaban / Jawaban Model</span>
            <span className="label-text-alt text-base-content/40">Dienkripsi sebelum disimpan</span>
          </label>
          <textarea
            {...register('correctAnswer')}
            rows={3}
            placeholder={qType === 'SHORT_ANSWER' ? 'Kata kunci jawaban...' : 'Jawaban model untuk referensi guru...'}
            className="textarea textarea-bordered resize-none"
          />
        </div>
      )}

      {/* Poin & Kesulitan */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Poin"
          type="number"
          inputSize="sm"
          {...register('points', { valueAsNumber: true })}
          error={(errors.points as any)?.message}
        />
        <div className="form-control">
          <label className="label"><span className="label-text font-medium">Tingkat Kesulitan</span></label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => {
              const curr = watch('difficulty')
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setValue('difficulty', n)}
                  className={`btn btn-sm btn-square ${curr >= n ? 'btn-warning' : 'btn-ghost border border-base-300'}`}
                >
                  ★
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="label"><span className="label-text font-medium">Tag</span></label>
        <Controller
          control={control}
          name="tagIds"
          render={({ field }) => (
            <TagSelector selected={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>
    </div>
  )
}
