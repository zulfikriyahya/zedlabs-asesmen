'use client'
import { useEffect, useState } from 'react'
import { sessionsApi } from '@/lib/api/sessions.api'
import { apiGet } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamSession } from '@/types/exam'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Loading } from '@/components/ui/Loading'
import { formatScore } from '@/lib/utils/format'

interface AttemptResult {
  attemptId: string; userId: string; username: string
  totalScore: number | null; maxScore: number | null
  gradingStatus: string; submittedAt: string | null
}

const GRADING_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning', AUTO_GRADED: 'info', MANUAL_REQUIRED: 'warning', COMPLETED: 'info', PUBLISHED: 'success',
}

export default function HasilPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [selectedSid, setSelectedSid] = useState('')
  const [results, setResults] = useState<AttemptResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    sessionsApi.list({ limit: 100 }).then(res => setSessions(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedSid) { setResults([]); return }
    setLoading(true)
    apiGet<{ data: AttemptResult[] }>(`submissions?sessionId=${selectedSid}`)
      .then(res => setResults(res.data))
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [selectedSid])

  const sessionOptions = sessions.map(s => ({ value: s.id, label: s.title }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hasil Ujian</h1>
      <div className="max-w-sm">
        <Select label="Pilih Sesi" options={sessionOptions} placeholder="Pilih sesi..." value={selectedSid} onChange={e => setSelectedSid(e.target.value)} />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {selectedSid && (
        loading ? <Loading text="Memuat hasil..." /> : (
          <Table
            data={results}
            keyExtractor={r => r.attemptId}
            emptyText="Belum ada hasil untuk sesi ini"
            zebra
            columns={[
              { key: 'student', header: 'Siswa', render: r => <span className="font-medium">{r.username}</span> },
              {
                key: 'score', header: 'Nilai', className: 'w-32',
                render: r => (
                  <span className={`font-mono font-bold text-sm ${r.totalScore !== null && r.maxScore !== null && (r.totalScore / r.maxScore) >= 0.75 ? 'text-success' : 'text-base-content'}`}>
                    {formatScore(r.totalScore, r.maxScore)}
                  </span>
                ),
              },
              {
                key: 'status', header: 'Status', className: 'w-36',
                render: r => <Badge variant={GRADING_VARIANT[r.gradingStatus] ?? 'neutral'} size="sm">{r.gradingStatus.replace(/_/g, ' ')}</Badge>,
              },
            ]}
          />
        )
      )}

      {!selectedSid && (
        <div className="flex flex-col items-center py-12 text-center text-base-content/40">
          <span className="text-4xl mb-2">📊</span>
          <p>Pilih sesi untuk melihat hasil ujian</p>
        </div>
      )}
    </div>
  )
}
