'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { apiPost } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface RoomForm { name: string; capacity?: number }

export default function CreateRuangPage() {
  const router = useRouter()
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RoomForm>()

  const onSubmit = async (data: RoomForm) => {
    setServerError(null)
    try {
      await apiPost('exam-rooms', {
        name: data.name,
        capacity: data.capacity ?? null,
      })
      success('Ruang ujian berhasil dibuat!')
      router.push('/operator/ruang')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Tambah Ruang Ujian</h1>
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

          <Alert variant="info" className="text-xs">
            Ruang ujian digunakan untuk mengelompokkan peserta dalam sesi ujian yang sama.
          </Alert>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>
              Simpan Ruang
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
