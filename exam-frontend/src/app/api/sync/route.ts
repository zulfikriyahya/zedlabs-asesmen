export async function POST(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value
  const API5 = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

  const contentType = req.headers.get('content-type') ?? ''
  let body: FormData | string
  let headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  if (contentType.includes('multipart/form-data')) {
    body = await req.formData()
  } else {
    body = await req.text()
    headers = { ...headers, 'Content-Type': 'application/json' }
  }

  const res = await fetch(`${API5}/sync`, {
    method: 'POST',
    headers,
    body,
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
