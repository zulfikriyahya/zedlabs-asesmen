'use client'
import { useEffect, useState } from 'react'
import { analyticsApi } from '@/lib/api/analytics.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

export default function GuruDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    analyticsApi.getDashboard()
      .then(setStats)
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading text="Memuat dashboard..." />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Guru</h1>
      {error && <Alert variant="warning">{error}</Alert>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Soal', key: 'totalQuestions' },
          { label: 'Paket Ujian', key: 'totalPackages' },
          { label: 'Sesi Aktif', key: 'activeSessions' },
          { label: 'Perlu Dinilai', key: 'pendingGrading' },
        ].map(item => (
          <Card key={item.key} compact className="text-center">
            <p className="text-3xl font-bold text-primary">
              {stats ? String(stats[item.key] ?? 0) : '—'}
            </p>
            <p className="text-xs text-base-content/60 mt-1">{item.label}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
