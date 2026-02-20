'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { apiGet, apiPatch } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamRoom } from '@/types/exam'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/hooks/use-toast'

interface RoomForm { name: string; capacity?: number }

export default function EditRuangPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RoomForm>()

  useEffect(() => {
    apiGet<ExamRoom>(`exam-rooms/${id}`)
      .then(room => reset({ name: room.name, capacity: room.capacity ?? undefined }))
      .catch(e => setLoadError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (data: RoomForm) => {
    setServerError(null)
    try {
      await apiPatch(`exam-rooms/${id}`, {
        name: data.name,
        capacity: data.capacity ?? null,
      })
      success('Ruang ujian berhasil diperbarui!')
      router.push('/operator/ruang')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  if (loading) return <Loading fullscreen text="Memuat data ruang..." />
  if (loadError) return (
    <div className="mx-auto max-w-md pt-8">
      <Alert variant="error">{loadError}</Alert>
      <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Kembali</Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Edit Ruang Ujian</h1>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Ruang"
            placeholder="Contoh: Lab Komputer 1"
            error={errors.name?.message}
            {...register('name', { required: 'Nama ruang wajib diisi' })}
          />
          <Input
            label="Kapasitas (opsional)"
            type="number"
            placeholder="30"
            hint="Kosongkan jika tidak ada batas kapasitas"
            {...register('capacity', { valueAsNumber: true })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
