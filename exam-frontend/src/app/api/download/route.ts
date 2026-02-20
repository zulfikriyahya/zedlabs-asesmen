export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = req.cookies.get('access_token')?.value
  const API3 = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

  const res = await fetch(`${API3}/student/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
