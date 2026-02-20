export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value
  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 })
  }

  const API2 = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
  const res = await fetch(`${API2}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    const response = NextResponse.json({ message: 'Session expired' }, { status: 401 })
    response.cookies.delete('refresh_token')
    response.cookies.delete('access_token')
    return response
  }

  const data = await res.json() as { accessToken: string; refreshToken?: string }
  const response = NextResponse.json({ accessToken: data.accessToken })

  response.cookies.set('access_token', data.accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })

  if (data.refreshToken) {
    response.cookies.set('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
  }

  return response
}
