'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { examPackagesApi } from '@/lib/api/exam-packages.api'
import { questionsApi } from '@/lib/api/questions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { createExamPackageSchema, type CreateExamPackageInput } from '@/schemas/exam.schema'
import type { Question } from '@/types/question'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/use-toast'

export default function CreateUjianPage() {
  const router = useRouter()
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQIds, setSelectedQIds] = useState<string[]>([])
  const [qSearch, setQSearch] = useState('')

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<CreateExamPackageInput>({
    resolver: zodResolver(createExamPackageSchema),
    defaultValues: {
      settings: { duration: 90, shuffleQuestions: false, shuffleOptions: false, showResult: true, maxAttempts: 1 },
    },
  })

  useEffect(() => {
    questionsApi.list({ status: 'approved', limit: 100 })
      .then(res => setQuestions(res.data))
      .catch(() => {})
  }, [])

  const toggleQ = (id: string) => {
    setSelectedQIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const onSubmit = async (data: CreateExamPackageInput) => {
    setServerError(null)
    try {
      const pkg = await examPackagesApi.create({
        ...data,
        questionIds: selectedQIds.map((qId, i) => ({ questionId: qId, order: i + 1 })),
      })
      success('Paket ujian berhasil dibuat!')
      router.push('/guru/ujian')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  const filteredQ = questions.filter(q =>
    q.content.text.toLowerCase().includes(qSearch.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Buat Paket Ujian</h1>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card bordered>
          <h2 className="font-semibold mb-4">Informasi Paket</h2>
          <div className="space-y-4">
            <Input label="Judul Paket" placeholder="Contoh: UAS Matematika Kelas X" error={errors.title?.message} {...register('title')} />
            <Input label="Deskripsi (opsional)" placeholder="Deskripsi singkat paket ujian" {...register('description')} />
          </div>
        </Card>

        <Card bordered>
          <h2 className="font-semibold mb-4">Pengaturan</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Input label="Durasi (menit)" type="number" error={(errors.settings?.duration as any)?.message} {...register('settings.duration', { valueAsNumber: true })} />
            <Input label="Maks. Percobaan" type="number" {...register('settings.maxAttempts', { valueAsNumber: true })} />
            <div className="col-span-2 sm:col-span-1 space-y-2 pt-2">
              {[
                { field: 'settings.shuffleQuestions', label: 'Acak urutan soal' },
                { field: 'settings.shuffleOptions', label: 'Acak pilihan jawaban' },
                { field: 'settings.showResult', label: 'Tampilkan hasil ke siswa' },
              ].map(({ field, label }) => (
                <label key={field} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" {...register(field as any)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </Card>

        <Card bordered>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Pilih Soal</h2>
            <Badge variant="primary" size="sm">{selectedQIds.length} dipilih</Badge>
          </div>
          <Input
            placeholder="Cari soal..."
            value={qSearch}
            onChange={e => setQSearch(e.target.value)}
            inputSize="sm"
            className="mb-3"
          />
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {filteredQ.map(q => {
              const sel = selectedQIds.includes(q.id)
              return (
                <label key={q.id} className={`flex cursor-pointer items-start gap-2 rounded-box p-2 text-sm transition-colors ${sel ? 'bg-primary/5 border border-primary/30' : 'hover:bg-base-200'}`}>
                  <input type="checkbox" className="checkbox checkbox-primary checkbox-sm mt-0.5 shrink-0" checked={sel} onChange={() => toggleQ(q.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1">{q.content.text}</p>
                    <div className="flex gap-1 mt-0.5">
                      <Badge variant="neutral" size="xs">{q.type.replace(/_/g, ' ')}</Badge>
                      <Badge variant="ghost" size="xs">{q.points}pt</Badge>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" loading={isSubmitting} disabled={selectedQIds.length === 0}>
            Simpan Paket ({selectedQIds.length} soal)
          </Button>
        </div>
      </form>
    </div>
  )
}
