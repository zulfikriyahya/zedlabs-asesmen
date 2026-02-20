import { type NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/schemas/auth.schema'
import { generateDeviceFingerprint } from '@/lib/crypto/checksum'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ message: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 })
    }

    const fingerprint = body.fingerprint as string ?? ''

    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...parsed.data, fingerprint }),
    })

    const data = await res.json() as {
      accessToken?: string
      refreshToken?: string
      user?: unknown
      message?: string
    }

    if (!res.ok) {
      return NextResponse.json({ message: data.message ?? 'Login gagal' }, { status: res.status })
    }

    const response = NextResponse.json({ user: data.user, accessToken: data.accessToken })

    // httpOnly cookie untuk refresh token
    if (data.refreshToken) {
      response.cookies.set('refresh_token', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })
    }

    // access_token di cookie (untuk middleware) — pendek umurnya
    if (data.accessToken) {
      response.cookies.set('access_token', data.accessToken, {
        httpOnly: false,   // dibaca middleware
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/',
      })
    }

    return response
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
