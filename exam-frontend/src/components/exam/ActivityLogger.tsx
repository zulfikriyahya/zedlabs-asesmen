'use client'
import { useEffect } from 'react'
import { setupActivityListeners } from '@/lib/exam/activity-logger'
import { useActivityStore } from '@/stores/activity.store'
import type { ID } from '@/types/common'

interface ActivityLoggerProps {
  attemptId: ID
  sessionId: ID
}

export function ActivityLogger({ attemptId, sessionId }: ActivityLoggerProps) {
  const { addLog, setTabActive } = useActivityStore()

  useEffect(() => {
    const cleanup = setupActivityListeners({
      attemptId,
      sessionId,
      onLog: (type) => {
        addLog({ attemptId, sessionId, type, timestamp: Date.now() })
        if (type === 'tab_blur') setTabActive(false)
        if (type === 'tab_focus') setTabActive(true)
      },
    })
    return cleanup
  }, [attemptId, sessionId, addLog, setTabActive])

  // Invisible — hanya efek samping
  return null
}
