'use client'
import { useEffect } from 'react'
import { useUiStore } from '@/stores/ui.store'

export function useOnlineStatus(): boolean {
  const { isOnline, setOnline } = useUiStore()

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [setOnline])

  return isOnline
}
