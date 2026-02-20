'use client'
import { useEffect, useState, useRef } from 'react'
import { io, type Socket } from 'socket.io-client' // NOTE: tambahkan socket.io-client ke package.json
import { useAuthStore } from '@/stores/auth.store'
import { monitoringApi } from '@/lib/api/monitoring.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { StudentProgressCard } from './StudentProgressCard'
import { ActivityLogViewer } from './ActivityLogViewer'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Loading } from '@/components/ui/Loading'
import type { ActivitySummary, LiveActivityEvent } from '@/types/activity'
import type { ID } from '@/types/common'

type StudentStatus = ActivitySummary & {
  answered: number
  total: number
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'OFFLINE'
}

interface LiveMonitorProps {
  sessionId: ID
}

export function LiveMonitor({ sessionId }: LiveMonitorProps) {
  const { accessToken } = useAuthStore()
  const [students, setStudents] = useState<StudentStatus[]>([])
  const [activityLogs, setActivityLogs] = useState<Record<ID, LiveActivityEvent[]>>({})
  const [selectedStudent, setSelectedStudent] = useState<StudentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  // Load initial data
  useEffect(() => {
    monitoringApi.getSessionStatus(sessionId)
      .then(data => setStudents((data as any).students ?? []))
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [sessionId])

  // Socket.IO real-time
  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:3001'
    const socket = io(`${WS_URL}/monitoring`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join-session', { sessionId })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('student-update', (data: StudentStatus) => {
      setStudents(prev => {
        const idx = prev.findIndex(s => s.userId === data.userId)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...prev[idx]!, ...data }
          return next
        }
        return [...prev, data]
      })
    })

    socket.on('activity-log', (log: LiveActivityEvent) => {
      setActivityLogs(prev => ({
        ...prev,
        [log.userId]: [log, ...(prev[log.userId] ?? [])].slice(0, 50),
      }))
    })

    socketRef.current = socket
    return () => { socket.disconnect() }
  }, [sessionId, accessToken])

  const activeCount = students.filter(s => s.status === 'IN_PROGRESS').length
  const submittedCount = students.filter(s => s.status === 'SUBMITTED').length
  const alertCount = students.filter(s => s.tabBlurCount >= 3 || s.copyPasteCount >= 2).length

  if (loading) return <Loading text="Memuat data monitoring..." />

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-success' : 'bg-error animate-pulse'}`} />
          <span className="text-base-content/60">{connected ? 'Terhubung' : 'Terputus'}</span>
        </div>
        <Badge variant="success" size="sm">🟢 {activeCount} mengerjakan</Badge>
        <Badge variant="primary" size="sm">✓ {submittedCount} selesai</Badge>
        {alertCount > 0 && <Badge variant="warning" size="sm">⚠ {alertCount} perlu perhatian</Badge>}
        <span className="ml-auto text-xs text-base-content/40">{students.length} peserta total</span>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Student grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {students.map(s => (
          <StudentProgressCard
            key={s.userId}
            summary={s}
            onSelect={() => setSelectedStudent(s)}
          />
        ))}
        {students.length === 0 && (
          <div className="col-span-full text-center py-12 text-base-content/40">
            Belum ada peserta yang aktif
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`Detail: ${selectedStudent?.username}`}
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Tab Blur', value: selectedStudent.tabBlurCount, alert: selectedStudent.tabBlurCount >= 3 },
                { label: 'Copy-Paste', value: selectedStudent.copyPasteCount, alert: selectedStudent.copyPasteCount >= 2 },
                { label: 'Total Event', value: selectedStudent.totalEvents, alert: false },
              ].map(stat => (
                <div key={stat.label} className={`rounded-box p-3 ${stat.alert ? 'bg-warning/10 border border-warning' : 'bg-base-200'}`}>
                  <p className={`text-2xl font-bold ${stat.alert ? 'text-warning' : ''}`}>{stat.value}</p>
                  <p className="text-xs text-base-content/60">{stat.label}</p>
                </div>
              ))}
            </div>
            <ActivityLogViewer
              logs={activityLogs[selectedStudent.userId] ?? []}
              username={selectedStudent.username}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
