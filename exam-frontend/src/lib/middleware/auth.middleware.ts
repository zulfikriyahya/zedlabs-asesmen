// Next.js middleware helper — digunakan di src/middleware.ts
import type { NextRequest } from 'next/server'

export function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}
