'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

export default function UjianPage() {
  const router = useRouter()
  return (
    <div className="mx-auto max-w-lg space-y-4 pt-8">
      <Card>
        <h1 className="text-xl font-bold mb-2">Ujian Saya</h1>
        <p className="text-sm text-base-content/60 mb-4">
          Untuk mengikuti ujian, masukkan kode token yang diberikan oleh pengawas.
        </p>
        <Button className="w-full" onClick={() => router.push('/siswa/ujian/download')}>
          Masukkan Token Ujian
        </Button>
      </Card>
      <Alert variant="info">
        Pastikan Anda sudah mendapatkan kode token dari pengawas sebelum memulai ujian.
      </Alert>
    </div>
  )
}
