'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { sessionsApi } from '@/lib/api/sessions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatDateTime } from '@/lib/utils/format'
import type { ExamSession } from '@/types/exam'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Confirm } from '@/components/ui/Confirm'
import { useToast } from '@/hooks/use-toast'

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'error' | 'info' | 'neutral'> = {
  SCHEDULED: 'info', ACTIVE: 'success', PAUSED: 'warning',
  COMPLETED: 'neutral', CANCELLED: 'error',
}

export default function SesiPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activateTarget, setActivateTarget] = useState<ExamSession | null>(null)
  const [actioning, setActioning] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sessionsApi.list({ limit: 50 })
      setSessions(res.data)
    } catch (e) { setError(parseErrorMessage(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleActivate = async () => {
    if (!activateTarget) return
    setActioning(true)
    try {
      await sessionsApi.activate(activateTarget.id)
      success(`Sesi "${activateTarget.title}" diaktifkan!`)
      setActivateTarget(null)
      void load()
    } catch (e) { toastError(parseErrorMessage(e)) }
    finally { setActioning(false) }
  }

  const handlePause = async (id: string) => {
    try { await sessionsApi.pause(id); success('Sesi dijeda'); void load() }
    catch (e) { toastError(parseErrorMessage(e)) }
  }

  const handleComplete = async (id: string) => {
    try { await sessionsApi.complete(id); success('Sesi diselesaikan'); void load() }
    catch (e) { toastError(parseErrorMessage(e)) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sesi Ujian</h1>
          <p className="text-sm text-base-content/60">{sessions.length} sesi</p>
        </div>
        <Button size="sm" onClick={() => router.push('/operator/sesi/create')}>+ Buat Sesi</Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Table
        data={sessions}
        keyExtractor={s => s.id}
        loading={loading}
        emptyText="Belum ada sesi"
        zebra
        columns={[
          {
            key: 'title', header: 'Judul',
            render: s => (
              <div>
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-base-content/50">{s.examPackage?.title}</p>
              </div>
            ),
          },
          {
            key: 'time', header: 'Waktu',
            render: s => (
              <div className="text-xs text-base-content/70 space-y-0.5">
                <p>▶ {formatDateTime(s.startTime)}</p>
                <p>■ {formatDateTime(s.endTime)}</p>
              </div>
            ),
          },
          {
            key: 'status', header: 'Status', className: 'w-28',
            render: s => <Badge variant={STATUS_VARIANT[s.status] ?? 'neutral'} size="sm">{s.status}</Badge>,
          },
          {
            key: 'students', header: 'Peserta', className: 'w-20 text-center',
            render: s => <span className="font-mono text-sm">{s.studentCount ?? 0}</span>,
          },
          {
            key: 'actions', header: '', className: 'w-52',
            render: s => (
              <div className="flex gap-1 flex-wrap justify-end">
                {s.status === 'SCHEDULED' && (
                  <Button size="xs" variant="success" onClick={() => setActivateTarget(s)}>▶ Aktifkan</Button>
                )}
                {s.status === 'ACTIVE' && (
                  <Button size="xs" variant="warning" onClick={() => void handlePause(s.id)}>⏸ Jeda</Button>
                )}
                {(s.status === 'ACTIVE' || s.status === 'PAUSED') && (
                  <Button size="xs" variant="error" onClick={() => void handleComplete(s.id)}>■ Selesai</Button>
                )}
                <Button size="xs" variant="ghost" onClick={() => router.push(`/operator/sesi/${s.id}/edit`)}>Edit</Button>
              </div>
            ),
          },
        ]}
      />

      <Confirm
        open={!!activateTarget}
        onCancel={() => setActivateTarget(null)}
        onConfirm={handleActivate}
        title="Aktifkan Sesi?"
        message={`Sesi "${activateTarget?.title}" akan diaktifkan. Peserta bisa mulai download soal.`}
        confirmLabel="Aktifkan"
        loading={actioning}
      />
    </div>
  )
}
