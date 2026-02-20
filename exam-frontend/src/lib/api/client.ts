/**
 * HTTP client berbasis ky — satu instance dengan interceptor token refresh.
 * Semua API call di lib/api/*.api.ts menggunakan instance ini.
 */

import ky, { type KyInstance, type Options, HTTPError } from 'ky'
import { ApiError } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// Singleton token accessor — dihindari coupling ke zustand store di level ini
// agar client bisa dipakai di server components dan API routes
let _getToken: (() => string | null) | null = null
let _onUnauthorized: (() => void) | null = null
let _isRefreshing = false
let _refreshPromise: Promise<string | null> | null = null

export function configureApiClient(opts: {
  getToken: () => string | null
  onUnauthorized: () => void
}): void {
  _getToken = opts.getToken
  _onUnauthorized = opts.onUnauthorized
}

async function refreshAccessToken(): Promise<string | null> {
  if (_isRefreshing) return _refreshPromise

  _isRefreshing = true
  _refreshPromise = fetch('/api/auth/refresh', { method: 'POST' })
    .then(async (res) => {
      if (!res.ok) return null
      const data = await res.json() as { accessToken: string }
      return data.accessToken
    })
    .catch(() => null)
    .finally(() => { _isRefreshing = false })

  return _refreshPromise
}

export const apiClient: KyInstance = ky.create({
  prefixUrl: BASE_URL,
  timeout: 30_000,
  retry: {
    limit: 1,
    statusCodes: [408, 429, 502, 503, 504],
    methods: ['get'],
  },
  hooks: {
    beforeRequest: [
      (req) => {
        const token = _getToken?.()
        if (token) req.headers.set('Authorization', `Bearer ${token}`)
      },
    ],
    afterResponse: [
      async (req, _opts, res) => {
        if (res.status !== 401) return res

        // Coba refresh sekali
        const newToken = await refreshAccessToken()
        if (!newToken) {
          _onUnauthorized?.()
          return res
        }

        // Retry request dengan token baru
        req.headers.set('Authorization', `Bearer ${newToken}`)
        return ky(req)
      },
    ],
    beforeError: [
      async (err) => {
        const { response } = err
        if (!response) return err

        try {
          const body = await response.clone().json() as {
            message?: string
            error?: string
            details?: Record<string, string[]>
          }
          ;(err as HTTPError & { apiError?: ApiError }).apiError = new ApiError(
            response.status,
            body.message ?? body.error ?? 'Request failed',
            body.details,
          )
        } catch {
          // body bukan JSON — biarkan ky error handling default
        }
        return err
      },
    ],
  },
})

// Helper untuk unwrap response dan throw ApiError jika gagal
export async function apiGet<T>(path: string, opts?: Options): Promise<T> {
  return apiClient.get(path, opts).json<T>()
}

export async function apiPost<T>(path: string, json: unknown, opts?: Options): Promise<T> {
  return apiClient.post(path, { ...opts, json }).json<T>()
}

export async function apiPatch<T>(path: string, json: unknown, opts?: Options): Promise<T> {
  return apiClient.patch(path, { ...opts, json }).json<T>()
}

export async function apiPut<T>(path: string, json: unknown, opts?: Options): Promise<T> {
  return apiClient.put(path, { ...opts, json }).json<T>()
}

export async function apiDelete<T>(path: string, opts?: Options): Promise<T> {
  return apiClient.delete(path, opts).json<T>()
}
