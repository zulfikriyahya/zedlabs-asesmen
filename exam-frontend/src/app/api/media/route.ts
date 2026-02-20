export async function POST(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value
  const API4 = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
  const formData = await req.formData()

  const res = await fetch(`${API4}/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
