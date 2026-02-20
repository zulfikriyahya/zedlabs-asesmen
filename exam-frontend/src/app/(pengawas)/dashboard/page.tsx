'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function PengawasDashboard() {
  const router = useRouter()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Pengawas</h1>
      <Card>
        <p className="text-sm text-base-content/60 mb-4">
          Pantau peserta ujian secara real-time melalui halaman monitoring.
        </p>
        <Button onClick={() => router.push('/pengawas/monitoring/live')}>
          Lihat Sesi Aktif →
        </Button>
      </Card>
    </div>
  )
}
