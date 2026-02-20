'use client'
import { useParams } from 'next/navigation'
import { LiveMonitor } from '@/components/monitoring/LiveMonitor'

export default function MonitoringSessionPage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Live Monitoring</h1>
        <p className="text-sm text-base-content/60 font-mono">Session: {sessionId}</p>
      </div>
      <LiveMonitor sessionId={sessionId} />
    </div>
  )
}
