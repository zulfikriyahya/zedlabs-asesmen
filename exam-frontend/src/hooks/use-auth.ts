'use client'
import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/lib/api/auth.api'
import { configureApiClient } from '@/lib/api/client'
import { keyManager } from '@/lib/crypto/key-manager'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  const logout = useCallback(async () => {
    keyManager.clearAll()
    await authApi.logout()
    store.clearAuth()
    router.replace('/login')
  }, [store, router])

  useEffect(() => {
    configureApiClient({
      getToken: () => useAuthStore.getState().accessToken,
      onUnauthorized: () => void logout(),
    })

    if (!store.isAuthenticated && store.isLoading) {
      authApi.refresh()
        .then(async ({ accessToken }) => {
          // Fetch user profile dengan token baru
          const res = await fetch('/api/auth/me', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          })
          if (res.ok) {
            const user = await res.json()
            store.setAuth(user, accessToken)
          } else {
            store.setLoading(false)
          }
        })
        .catch(() => store.setLoading(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ...store, logout }
}
