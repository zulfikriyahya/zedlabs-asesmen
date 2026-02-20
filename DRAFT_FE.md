## Direktori: src

### File: `src/app/api/auth/login/route.ts`

```typescript
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

```

---

### File: `src/app/api/auth/logout/route.ts`

```typescript
export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('refresh_token')
  res.cookies.delete('access_token')
  return res
}

```

---

### File: `src/app/api/auth/refresh/route.ts`

```typescript
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

```

---

### File: `src/app/api/download/route.ts`

```typescript
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

```

---

### File: `src/app/api/health/route.ts`

```typescript
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}

```

---

### File: `src/app/api/media/route.ts`

```typescript
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

```

---

### File: `src/app/api/sync/route.ts`

```typescript
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

```

---

### File: `src/app/global.css`

```css
@import url('./styles/animations.css');
@import url('./styles/arabic.css');
@import url('./styles/print.css');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --scrollbar-width: 6px;
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--bc) / 0.2) transparent;
  }

  *::-webkit-scrollbar { width: var(--scrollbar-width); }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb {
    background-color: hsl(var(--bc) / 0.2);
    border-radius: 9999px;
  }

  body {
    @apply text-base-content;
  }
}

@layer utilities {
  .truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

```

---

### File: `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import '@/app/global.css'

export const metadata: Metadata = {
  title: { default: 'Sistem Ujian', template: '%s | Sistem Ujian' },
  description: 'Sistem Ujian Offline-First untuk Sekolah dan Madrasah',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-base-100 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

```

---

### File: `src/app/loading.tsx`

```typescript
export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  )
}

```

---

### File: `src/app/not-found.tsx`

```typescript
import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-lg text-base-content/60">Halaman tidak ditemukan</p>
      <Link href="/" className="btn btn-primary btn-sm">Kembali ke Beranda</Link>
    </div>
  )
}

```

---

### File: `src/app/page.tsx`

```typescript
import { redirect } from 'next/navigation'
export default function RootPage() { redirect('/login') }

```

---

### File: `src/app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      {children}
    </main>
  )
}

```

---

### File: `src/app/(auth)/login/page.tsx`

```typescript
import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Login' }

export default function LoginPage() {
  return (
    <div className="card w-full max-w-md bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold">Masuk</h2>
        <p className="text-sm text-base-content/60">Sistem Ujian Sekolah & Madrasah</p>
        <LoginForm />
      </div>
    </div>
  )
}

```

---

### File: `src/app/(guru)/dashboard/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { analyticsApi } from '@/lib/api/analytics.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

export default function GuruDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    analyticsApi.getDashboard()
      .then(setStats)
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading text="Memuat dashboard..." />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Guru</h1>
      {error && <Alert variant="warning">{error}</Alert>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Soal', key: 'totalQuestions' },
          { label: 'Paket Ujian', key: 'totalPackages' },
          { label: 'Sesi Aktif', key: 'activeSessions' },
          { label: 'Perlu Dinilai', key: 'pendingGrading' },
        ].map(item => (
          <Card key={item.key} compact className="text-center">
            <p className="text-3xl font-bold text-primary">
              {stats ? String(stats[item.key] ?? 0) : '—'}
            </p>
            <p className="text-xs text-base-content/60 mt-1">{item.label}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

```

---

### File: `src/app/(guru)/grading/page.tsx`

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { gradingApi } from '@/lib/api/grading.api'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ManualGradingItem } from '@/types/answer'
import { ManualGradingCard } from '@/components/grading/ManualGradingCard'
import { GradingRubric } from '@/components/grading/GradingRubric'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

export default function GradingPage() {
  const [items, setItems] = useState<ManualGradingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const LIMIT = 10

  const load = useCallback(async (reset = false) => {
    setLoading(true)
    try {
      const res = await gradingApi.listPending({
        status: 'MANUAL_REQUIRED',
        page: reset ? 1 : page,
        limit: LIMIT,
      })
      if (reset) {
        setItems(res.data)
        setPage(1)
      } else {
        setItems(prev => [...prev, ...res.data])
      }
      setHasMore(res.data.length === LIMIT)
    } catch (e) {
      setError(parseErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { void load(true) }, [])

  const handleGraded = (answerId: string) => {
    setItems(prev => prev.filter(i => i.answerId !== answerId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Penilaian Manual</h1>
          <p className="text-sm text-base-content/60">Soal esai yang memerlukan penilaian manual</p>
        </div>
        {items.length > 0 && (
          <Badge variant="warning">{items.length} menunggu penilaian</Badge>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && items.length === 0 ? (
        <Loading text="Memuat daftar penilaian..." />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">✅</span>
          <p className="font-medium">Semua jawaban sudah dinilai!</p>
          <p className="text-sm text-base-content/60 mt-1">Tidak ada jawaban yang menunggu penilaian manual.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main — grading cards */}
          <div className="space-y-4">
            {items.map(item => (
              <ManualGradingCard
                key={item.answerId}
                item={item}
                onGraded={() => handleGraded(item.answerId)}
              />
            ))}
            {hasMore && !loading && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => { setPage(p => p + 1); void load() }}
              >
                Muat Lebih Banyak
              </Button>
            )}
            {loading && items.length > 0 && <Loading size="sm" />}
          </div>

          {/* Sidebar — rubrik */}
          <div className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <GradingRubric maxScore={10} />
              <div className="rounded-box bg-base-200 p-3 text-xs text-base-content/60 space-y-1">
                <p className="font-medium">Tips Penilaian Esai</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Fokus pada esensi jawaban</li>
                  <li>Perhatikan kesesuaian konsep</li>
                  <li>Gunakan slider untuk nilai presisi</li>
                  <li>Berikan feedback konstruktif</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/app/(guru)/grading/[attemptId]/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { gradingApi } from '@/lib/api/grading.api'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ManualGradingItem } from '@/types/answer'
import { ManualGradingCard } from '@/components/grading/ManualGradingCard'
import { GradingRubric } from '@/components/grading/GradingRubric'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/use-toast'

export default function AttemptGradingPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string
  const { success, error: toastError } = useToast()

  const [items, setItems] = useState<ManualGradingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    gradingApi.listPending({ status: 'MANUAL_REQUIRED' })
      .then(res => setItems(res.data.filter(i => i.attemptId === attemptId)))
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [attemptId])

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await gradingApi.completeGrading(attemptId)
      await gradingApi.publishResult({ attemptId })
      success('Penilaian selesai dan hasil dipublikasikan!')
      router.replace('/guru/grading')
    } catch (e) {
      toastError(parseErrorMessage(e))
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return <Loading fullscreen text="Memuat data penilaian..." />

  const allGraded = items.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-xl font-bold">Nilai Attempt: <span className="font-mono text-base">{attemptId.slice(0, 8)}</span></h1>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {allGraded ? (
        <div className="space-y-4">
          <Alert variant="success" title="Semua jawaban sudah dinilai!">
            Klik tombol di bawah untuk menyelesaikan penilaian dan mempublikasikan hasil ke siswa.
          </Alert>
          <Button className="w-full" loading={completing} onClick={handleComplete}>
            Selesaikan & Publikasikan Hasil
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {items.map(item => (
              <ManualGradingCard
                key={item.answerId}
                item={item}
                onGraded={() => setItems(prev => prev.filter(i => i.answerId !== item.answerId))}
              />
            ))}
          </div>
          <div className="hidden lg:block">
            <GradingRubric maxScore={items[0]?.maxScore ?? 10} />
          </div>
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/app/(guru)/hasil/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { sessionsApi } from '@/lib/api/sessions.api'
import { apiGet } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamSession } from '@/types/exam'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Loading } from '@/components/ui/Loading'
import { formatScore } from '@/lib/utils/format'

interface AttemptResult {
  attemptId: string; userId: string; username: string
  totalScore: number | null; maxScore: number | null
  gradingStatus: string; submittedAt: string | null
}

const GRADING_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning', AUTO_GRADED: 'info', MANUAL_REQUIRED: 'warning', COMPLETED: 'info', PUBLISHED: 'success',
}

export default function HasilPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [selectedSid, setSelectedSid] = useState('')
  const [results, setResults] = useState<AttemptResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    sessionsApi.list({ limit: 100 }).then(res => setSessions(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedSid) { setResults([]); return }
    setLoading(true)
    apiGet<{ data: AttemptResult[] }>(`submissions?sessionId=${selectedSid}`)
      .then(res => setResults(res.data))
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [selectedSid])

  const sessionOptions = sessions.map(s => ({ value: s.id, label: s.title }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hasil Ujian</h1>
      <div className="max-w-sm">
        <Select label="Pilih Sesi" options={sessionOptions} placeholder="Pilih sesi..." value={selectedSid} onChange={e => setSelectedSid(e.target.value)} />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {selectedSid && (
        loading ? <Loading text="Memuat hasil..." /> : (
          <Table
            data={results}
            keyExtractor={r => r.attemptId}
            emptyText="Belum ada hasil untuk sesi ini"
            zebra
            columns={[
              { key: 'student', header: 'Siswa', render: r => <span className="font-medium">{r.username}</span> },
              {
                key: 'score', header: 'Nilai', className: 'w-32',
                render: r => (
                  <span className={`font-mono font-bold text-sm ${r.totalScore !== null && r.maxScore !== null && (r.totalScore / r.maxScore) >= 0.75 ? 'text-success' : 'text-base-content'}`}>
                    {formatScore(r.totalScore, r.maxScore)}
                  </span>
                ),
              },
              {
                key: 'status', header: 'Status', className: 'w-36',
                render: r => <Badge variant={GRADING_VARIANT[r.gradingStatus] ?? 'neutral'} size="sm">{r.gradingStatus.replace(/_/g, ' ')}</Badge>,
              },
            ]}
          />
        )
      )}

      {!selectedSid && (
        <div className="flex flex-col items-center py-12 text-center text-base-content/40">
          <span className="text-4xl mb-2">📊</span>
          <p>Pilih sesi untuk melihat hasil ujian</p>
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/app/(guru)/layout.tsx`

```typescript
import { MainLayout } from '@/components/layout/MainLayout'

const GURU_NAV = [
  { href: '/guru/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/guru/soal', label: 'Bank Soal', icon: 'file-text' },
  { href: '/guru/ujian', label: 'Paket Ujian', icon: 'book-open' },
  { href: '/guru/grading', label: 'Penilaian', icon: 'check-circle' },
  { href: '/guru/hasil', label: 'Hasil', icon: 'bar-chart' },
]

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={GURU_NAV} role="TEACHER">{children}</MainLayout>
}

```

---

### File: `src/app/(guru)/soal/create/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createQuestionSchema, type CreateQuestionInput } from '@/schemas/question.schema'
import { questionsApi } from '@/lib/api/questions.api'
import { analyticsApi } from '@/lib/api/analytics.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { QuestionEditor } from '@/components/questions/QuestionEditor'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useToast } from '@/hooks/use-toast'

export default function CreateSoalPage() {
  const router = useRouter()
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Array<{ value: string; label: string }>>([])

  const methods = useForm<CreateQuestionInput>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      type: 'MULTIPLE_CHOICE',
      points: 1,
      difficulty: 1,
      tagIds: [],
      content: { text: '', images: [] },
      options: [
        { key: 'a', text: '' }, { key: 'b', text: '' },
        { key: 'c', text: '' }, { key: 'd', text: '' },
      ],
      correctAnswer: '',
    },
  })

  useEffect(() => {
    // Load subjects dari analytics/dashboard atau endpoint tersendiri
    fetch('/api/auth/me').then(() =>
      questionsApi.listTags() // placeholder — ganti dengan subjectsApi.list()
    ).catch(() => {})

    // Sementara hardcode — ganti dengan subjectsApi.list()
    setSubjects([{ value: '', label: 'Pilih mata pelajaran...' }])
  }, [])

  const onSubmit = async (data: CreateQuestionInput) => {
    setServerError(null)
    try {
      await questionsApi.create(data)
      success('Soal berhasil dibuat!')
      router.push('/guru/soal')
    } catch (e) {
      setServerError(parseErrorMessage(e))
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Buat Soal Baru</h1>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <QuestionEditor subjects={subjects} />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" loading={methods.formState.isSubmitting}>Simpan Soal</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

```

---

### File: `src/app/(guru)/soal/import/page.tsx`

```typescript
'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { questionsApi } from '@/lib/api/questions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'

interface ImportResult {
  imported: number
  failed: number
  errors?: string[]
}

export default function ImportSoalPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleImport = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await questionsApi.importBulk(fd)
      setResult(res)
      if (res.imported > 0) success(`${res.imported} soal berhasil diimport`)
    } catch (e) {
      toastError(parseErrorMessage(e))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Import Soal</h1>
      </div>

      <Card bordered>
        <div className="space-y-4">
          <div
            className="flex cursor-pointer flex-col items-center rounded-box border-2 border-dashed border-base-300 p-8 hover:border-primary/50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {file ? (
              <div className="text-center">
                <p className="text-2xl mb-1">📄</p>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-4xl mb-2">📋</p>
                <p className="text-sm font-medium">Klik untuk pilih file</p>
                <p className="text-xs text-base-content/50 mt-1">Excel (.xlsx, .xls) atau CSV</p>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null) }}
          />

          {result && (
            <Alert variant={result.failed > 0 ? 'warning' : 'success'}>
              <p>{result.imported} soal berhasil · {result.failed} gagal</p>
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-1 text-xs list-disc list-inside space-y-0.5">
                  {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  {result.errors.length > 5 && <li>...dan {result.errors.length - 5} lainnya</li>}
                </ul>
              )}
            </Alert>
          )}

          <Alert variant="info" title="Format kolom yang diperlukan">
            <ul className="text-xs mt-1 list-disc list-inside space-y-0.5">
              <li>type: MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER | ESSAY | MATCHING | COMPLEX_MULTIPLE_CHOICE</li>
              <li>content: teks pertanyaan</li>
              <li>options: a|b|c|d (dipisah pipe, untuk PG)</li>
              <li>correctAnswer: kunci jawaban</li>
              <li>points: nilai soal (default: 1)</li>
              <li>difficulty: 1-5 (default: 1)</li>
            </ul>
          </Alert>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button
              className="flex-1"
              disabled={!file}
              loading={uploading}
              onClick={handleImport}
            >
              Import Soal
            </Button>
          </div>
        </div>
      </Card>

      <Card compact>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Template import</p>
          <a
            href="/templates/import-soal.xlsx"
            download
            className="btn btn-xs btn-ghost border border-base-300"
          >
            ⬇ Download template
          </a>
        </div>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(guru)/soal/page.tsx`

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { questionsApi, type QuestionQueryParams } from '@/lib/api/questions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import type { Question } from '@/types/question'
import type { QuestionType } from '@/types/common'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Confirm } from '@/components/ui/Confirm'
import { Alert } from '@/components/ui/Alert'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils/format'

const TYPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'MULTIPLE_CHOICE', label: 'Pilihan Ganda' },
  { value: 'COMPLEX_MULTIPLE_CHOICE', label: 'PG Kompleks' },
  { value: 'TRUE_FALSE', label: 'Benar/Salah' },
  { value: 'MATCHING', label: 'Menjodohkan' },
  { value: 'SHORT_ANSWER', label: 'Jawaban Singkat' },
  { value: 'ESSAY', label: 'Esai' },
]

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  draft: 'warning', review: 'info', approved: 'success',
}

export default function SoalListPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)
  const [deleting, setDeleting] = useState(false)
  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: QuestionQueryParams = { page, limit: LIMIT }
      if (search) params.search = search
      if (type) params.type = type as QuestionType
      const res = await questionsApi.list(params)
      setQuestions(res.data)
      setTotal(res.meta.total)
    } catch (e) {
      setError(parseErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [page, search, type])

  useEffect(() => { void load() }, [load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await questionsApi.delete(deleteTarget.id)
      success('Soal berhasil dihapus')
      setDeleteTarget(null)
      void load()
    } catch (e) {
      toastError(parseErrorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await questionsApi.approve(id)
      success('Soal disetujui')
      void load()
    } catch (e) {
      toastError(parseErrorMessage(e))
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bank Soal</h1>
          <p className="text-sm text-base-content/60">{total} soal tersedia</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => router.push('/guru/soal/import')}>
            📥 Import
          </Button>
          <Button size="sm" onClick={() => router.push('/guru/soal/create')}>
            + Buat Soal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Cari soal..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            inputSize="sm"
          />
        </div>
        <div className="w-44">
          <Select
            options={TYPE_OPTIONS}
            value={type}
            onChange={e => { setType(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Table
        data={questions}
        keyExtractor={q => q.id}
        loading={loading}
        emptyText="Tidak ada soal ditemukan"
        zebra
        columns={[
          {
            key: 'content',
            header: 'Soal',
            render: q => (
              <div>
                <p className="text-sm line-clamp-2">{q.content.text}</p>
                <div className="flex gap-1.5 mt-1">
                  <Badge variant="neutral" size="xs">{q.type.replace(/_/g, ' ')}</Badge>
                  {q.tags?.map(t => (
                    <Badge key={t.id} variant="ghost" size="xs">{t.name}</Badge>
                  ))}
                </div>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            className: 'w-28',
            render: q => <Badge variant={STATUS_VARIANT[q.status] ?? 'neutral'} size="sm">{q.status}</Badge>,
          },
          {
            key: 'points',
            header: 'Poin',
            className: 'w-16 text-center',
            render: q => <span className="font-mono text-sm">{q.points}</span>,
          },
          {
            key: 'difficulty',
            header: 'Kesulitan',
            className: 'w-24',
            render: q => <span>{'★'.repeat(q.difficulty)}{'☆'.repeat(5 - q.difficulty)}</span>,
          },
          {
            key: 'actions',
            header: '',
            className: 'w-40',
            render: q => (
              <div className="flex gap-1 justify-end">
                {q.status === 'review' && (
                  <Button size="xs" variant="success" onClick={() => void handleApprove(q.id)}>✓ Setuju</Button>
                )}
                <Button size="xs" variant="ghost" onClick={() => router.push(`/guru/soal/${q.id}/edit`)}>Edit</Button>
                <Button size="xs" variant="ghost" onClick={() => setDeleteTarget(q)} className="text-error">Hapus</Button>
              </div>
            ),
          },
        ]}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <Button size="xs" variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</Button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <Button key={p} size="xs" variant={p === page ? 'primary' : 'ghost'} onClick={() => setPage(p)}>{p}</Button>
          ))}
          <Button size="xs" variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</Button>
        </div>
      )}

      <Confirm
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Soal?"
        message={`Soal ini akan dihapus permanen. Tindakan tidak bisa dibatalkan.`}
        variant="error"
        confirmLabel="Hapus"
        loading={deleting}
      />
    </div>
  )
}

```

---

### File: `src/app/(guru)/soal/[id]/edit/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createQuestionSchema, type CreateQuestionInput } from '@/schemas/question.schema'
import { questionsApi } from '@/lib/api/questions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { QuestionEditor } from '@/components/questions/QuestionEditor'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/hooks/use-toast'

export default function EditSoalPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [subjects] = useState<Array<{ value: string; label: string }>>([])

  const methods = useForm<CreateQuestionInput>({ resolver: zodResolver(createQuestionSchema) })

  useEffect(() => {
    questionsApi.getById(id)
      .then(q => {
        methods.reset({
          subjectId: q.subjectId,
          type: q.type,
          content: q.content,
          options: q.options as any,
          correctAnswer: undefined, // correctAnswer terenkripsi — tidak diisi ulang
          points: q.points,
          difficulty: q.difficulty,
          tagIds: q.tags?.map(t => t.id) ?? [],
        })
      })
      .catch(e => setLoadError(parseErrorMessage(e)))
  }, [id, methods])

  const onSubmit = async (data: CreateQuestionInput) => {
    setServerError(null)
    try {
      await questionsApi.update(id, data)
      success('Soal berhasil diperbarui!')
      router.push('/guru/soal')
    } catch (e) {
      setServerError(parseErrorMessage(e))
    }
  }

  if (loadError) return <Alert variant="error">{loadError}</Alert>
  if (!methods.formState.defaultValues && !loadError) return <Loading fullscreen />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Edit Soal</h1>
      </div>

      <Alert variant="info">
        Kunci jawaban yang sudah dienkripsi tidak ditampilkan. Kosongkan jika tidak ingin mengubah jawaban.
      </Alert>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <QuestionEditor subjects={subjects} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" loading={methods.formState.isSubmitting}>Simpan Perubahan</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

```

---

### File: `src/app/(guru)/ujian/create/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { examPackagesApi } from '@/lib/api/exam-packages.api'
import { questionsApi } from '@/lib/api/questions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { createExamPackageSchema, type CreateExamPackageInput } from '@/schemas/exam.schema'
import type { Question } from '@/types/question'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/use-toast'

export default function CreateUjianPage() {
  const router = useRouter()
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQIds, setSelectedQIds] = useState<string[]>([])
  const [qSearch, setQSearch] = useState('')

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<CreateExamPackageInput>({
    resolver: zodResolver(createExamPackageSchema),
    defaultValues: {
      settings: { duration: 90, shuffleQuestions: false, shuffleOptions: false, showResult: true, maxAttempts: 1 },
    },
  })

  useEffect(() => {
    questionsApi.list({ status: 'approved', limit: 100 })
      .then(res => setQuestions(res.data))
      .catch(() => {})
  }, [])

  const toggleQ = (id: string) => {
    setSelectedQIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const onSubmit = async (data: CreateExamPackageInput) => {
    setServerError(null)
    try {
      const pkg = await examPackagesApi.create({
        ...data,
        questionIds: selectedQIds.map((qId, i) => ({ questionId: qId, order: i + 1 })),
      })
      success('Paket ujian berhasil dibuat!')
      router.push('/guru/ujian')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  const filteredQ = questions.filter(q =>
    q.content.text.toLowerCase().includes(qSearch.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Buat Paket Ujian</h1>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card bordered>
          <h2 className="font-semibold mb-4">Informasi Paket</h2>
          <div className="space-y-4">
            <Input label="Judul Paket" placeholder="Contoh: UAS Matematika Kelas X" error={errors.title?.message} {...register('title')} />
            <Input label="Deskripsi (opsional)" placeholder="Deskripsi singkat paket ujian" {...register('description')} />
          </div>
        </Card>

        <Card bordered>
          <h2 className="font-semibold mb-4">Pengaturan</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Input label="Durasi (menit)" type="number" error={(errors.settings?.duration as any)?.message} {...register('settings.duration', { valueAsNumber: true })} />
            <Input label="Maks. Percobaan" type="number" {...register('settings.maxAttempts', { valueAsNumber: true })} />
            <div className="col-span-2 sm:col-span-1 space-y-2 pt-2">
              {[
                { field: 'settings.shuffleQuestions', label: 'Acak urutan soal' },
                { field: 'settings.shuffleOptions', label: 'Acak pilihan jawaban' },
                { field: 'settings.showResult', label: 'Tampilkan hasil ke siswa' },
              ].map(({ field, label }) => (
                <label key={field} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" {...register(field as any)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </Card>

        <Card bordered>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Pilih Soal</h2>
            <Badge variant="primary" size="sm">{selectedQIds.length} dipilih</Badge>
          </div>
          <Input
            placeholder="Cari soal..."
            value={qSearch}
            onChange={e => setQSearch(e.target.value)}
            inputSize="sm"
            className="mb-3"
          />
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {filteredQ.map(q => {
              const sel = selectedQIds.includes(q.id)
              return (
                <label key={q.id} className={`flex cursor-pointer items-start gap-2 rounded-box p-2 text-sm transition-colors ${sel ? 'bg-primary/5 border border-primary/30' : 'hover:bg-base-200'}`}>
                  <input type="checkbox" className="checkbox checkbox-primary checkbox-sm mt-0.5 shrink-0" checked={sel} onChange={() => toggleQ(q.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1">{q.content.text}</p>
                    <div className="flex gap-1 mt-0.5">
                      <Badge variant="neutral" size="xs">{q.type.replace(/_/g, ' ')}</Badge>
                      <Badge variant="ghost" size="xs">{q.points}pt</Badge>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" loading={isSubmitting} disabled={selectedQIds.length === 0}>
            Simpan Paket ({selectedQIds.length} soal)
          </Button>
        </div>
      </form>
    </div>
  )
}

```

---

### File: `src/app/(guru)/ujian/page.tsx`

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { examPackagesApi } from '@/lib/api/exam-packages.api'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamPackage } from '@/types/exam'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Confirm } from '@/components/ui/Confirm'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils/format'

const PKG_STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
  DRAFT: 'warning', REVIEW: 'info', PUBLISHED: 'success', ARCHIVED: 'neutral',
}

export default function UjianListPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [packages, setPackages] = useState<ExamPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [publishTarget, setPublishTarget] = useState<ExamPackage | null>(null)
  const [publishing, setPublishing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await examPackagesApi.list({ limit: 50 })
      setPackages(res.data)
    } catch (e) { setError(parseErrorMessage(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const handlePublish = async () => {
    if (!publishTarget) return
    setPublishing(true)
    try {
      await examPackagesApi.publish(publishTarget.id)
      success(`Paket "${publishTarget.title}" dipublikasikan!`)
      setPublishTarget(null)
      void load()
    } catch (e) { toastError(parseErrorMessage(e)) }
    finally { setPublishing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paket Ujian</h1>
          <p className="text-sm text-base-content/60">{packages.length} paket</p>
        </div>
        <Button size="sm" onClick={() => router.push('/guru/ujian/create')}>+ Buat Paket</Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Table
        data={packages}
        keyExtractor={p => p.id}
        loading={loading}
        emptyText="Belum ada paket ujian"
        zebra
        columns={[
          {
            key: 'title', header: 'Paket',
            render: p => (
              <div>
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-base-content/50">{p.questionCount ?? 0} soal · {p.settings.duration} menit</p>
              </div>
            ),
          },
          { key: 'status', header: 'Status', className: 'w-28', render: p => <Badge variant={PKG_STATUS_VARIANT[p.status] ?? 'neutral'} size="sm">{p.status}</Badge> },
          { key: 'published', header: 'Dipublikasikan', className: 'w-32', render: p => <span className="text-xs">{p.publishedAt ? formatDate(p.publishedAt) : '—'}</span> },
          {
            key: 'actions', header: '', className: 'w-48',
            render: p => (
              <div className="flex gap-1 justify-end flex-wrap">
                <Button size="xs" variant="ghost" onClick={() => router.push(`/guru/ujian/${p.id}/preview`)}>Preview</Button>
                <Button size="xs" variant="ghost" onClick={() => router.push(`/guru/ujian/${p.id}/edit`)}>Edit</Button>
                {p.status !== 'PUBLISHED' && (
                  <Button size="xs" variant="success" onClick={() => setPublishTarget(p)}>Publish</Button>
                )}
                {p.status === 'PUBLISHED' && (
                  <Button size="xs" variant="ghost" onClick={() => router.push(`/guru/ujian/${p.id}/statistics`)}>Statistik</Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Confirm
        open={!!publishTarget}
        onCancel={() => setPublishTarget(null)}
        onConfirm={handlePublish}
        title="Publish Paket?"
        message={`Paket "${publishTarget?.title}" akan dipublikasikan dan bisa digunakan operator untuk sesi ujian.`}
        confirmLabel="Publish"
        loading={publishing}
      />
    </div>
  )
}

```

---

### File: `src/app/(guru)/ujian/[id]/edit/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { examPackagesApi } from '@/lib/api/exam-packages.api'
import { questionsApi } from '@/lib/api/questions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { createExamPackageSchema, type CreateExamPackageInput } from '@/schemas/exam.schema'
import type { Question } from '@/types/question'
import type { ExamPackage } from '@/types/exam'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/hooks/use-toast'

export default function EditUjianPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQIds, setSelectedQIds] = useState<string[]>([])
  const [qSearch, setQSearch] = useState('')
  const [pkg, setPkg] = useState<ExamPackage | null>(null)

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
    useForm<CreateExamPackageInput>({
      resolver: zodResolver(createExamPackageSchema),
    })

  useEffect(() => {
    Promise.all([
      examPackagesApi.getById(id),
      questionsApi.list({ status: 'approved', limit: 100 }),
    ])
      .then(([pkgData, qRes]) => {
        setPkg(pkgData)
        setQuestions(qRes.data)
        reset({
          title: pkgData.title,
          description: pkgData.description ?? undefined,
          subjectId: pkgData.subjectId ?? undefined,
          settings: pkgData.settings,
        })
        // Load existing question IDs
        examPackagesApi.getById(id).then(p => {
          // questionIds dari pkg jika ada
          setSelectedQIds((p as any).questionIds ?? [])
        })
      })
      .catch(e => setLoadError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id, reset])

  const toggleQ = (qid: string) =>
    setSelectedQIds(prev => prev.includes(qid) ? prev.filter(x => x !== qid) : [...prev, qid])

  const onSubmit = async (data: CreateExamPackageInput) => {
    setServerError(null)
    try {
      await examPackagesApi.update(id, {
        ...data,
        questionIds: selectedQIds.map((qId, i) => ({ questionId: qId, order: i + 1 })),
      } as any)
      success('Paket ujian berhasil diperbarui!')
      router.push('/guru/ujian')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  if (loading) return <Loading fullscreen text="Memuat paket ujian..." />
  if (loadError) return <Alert variant="error">{loadError}</Alert>

  const filteredQ = questions.filter(q =>
    q.content.text.toLowerCase().includes(qSearch.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Paket Ujian</h1>
          {pkg && <p className="text-sm text-base-content/60">{pkg.title}</p>}
        </div>
      </div>

      {pkg?.status === 'PUBLISHED' && (
        <Alert variant="warning" title="Paket Sudah Dipublikasikan">
          Mengubah paket yang sudah dipublikasikan dapat mempengaruhi sesi ujian yang sedang berjalan.
        </Alert>
      )}

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card bordered>
          <h2 className="font-semibold mb-4">Informasi Paket</h2>
          <div className="space-y-4">
            <Input
              label="Judul Paket"
              placeholder="Contoh: UAS Matematika Kelas X"
              error={errors.title?.message}
              {...register('title')}
            />
            <Input
              label="Deskripsi (opsional)"
              placeholder="Deskripsi singkat paket ujian"
              {...register('description')}
            />
          </div>
        </Card>

        <Card bordered>
          <h2 className="font-semibold mb-4">Pengaturan</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Input
              label="Durasi (menit)"
              type="number"
              error={(errors.settings?.duration as any)?.message}
              {...register('settings.duration', { valueAsNumber: true })}
            />
            <Input
              label="Maks. Percobaan"
              type="number"
              {...register('settings.maxAttempts', { valueAsNumber: true })}
            />
            <div className="col-span-2 sm:col-span-1 space-y-2 pt-2">
              {[
                { field: 'settings.shuffleQuestions', label: 'Acak urutan soal' },
                { field: 'settings.shuffleOptions', label: 'Acak pilihan jawaban' },
                { field: 'settings.showResult', label: 'Tampilkan hasil ke siswa' },
              ].map(({ field, label }) => (
                <label key={field} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    {...register(field as any)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </Card>

        <Card bordered>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Pilih Soal</h2>
            <Badge variant="primary" size="sm">{selectedQIds.length} dipilih</Badge>
          </div>
          <Input
            placeholder="Cari soal..."
            value={qSearch}
            onChange={e => setQSearch(e.target.value)}
            inputSize="sm"
            className="mb-3"
          />
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {filteredQ.map(q => {
              const sel = selectedQIds.includes(q.id)
              return (
                <label
                  key={q.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-box p-2 text-sm transition-colors ${
                    sel ? 'bg-primary/5 border border-primary/30' : 'hover:bg-base-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm mt-0.5 shrink-0"
                    checked={sel}
                    onChange={() => toggleQ(q.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1">{q.content.text}</p>
                    <div className="flex gap-1 mt-0.5">
                      <Badge variant="neutral" size="xs">{q.type.replace(/_/g, ' ')}</Badge>
                      <Badge variant="ghost" size="xs">{q.points}pt</Badge>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" loading={isSubmitting} disabled={selectedQIds.length === 0}>
            Simpan Perubahan ({selectedQIds.length} soal)
          </Button>
        </div>
      </form>
    </div>
  )
}

```

---

### File: `src/app/(guru)/ujian/[id]/preview/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { examPackagesApi } from '@/lib/api/exam-packages.api'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamPackage } from '@/types/exam'
import type { ExamQuestion } from '@/types/question'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDuration } from '@/lib/exam/timer'

// Tipe lokal untuk paket dengan soal yang di-embed
interface PackageWithQuestions extends ExamPackage {
  questions?: ExamQuestion[]
}

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: 'Pilihan Ganda',
  COMPLEX_MULTIPLE_CHOICE: 'PG Kompleks',
  TRUE_FALSE: 'Benar/Salah',
  MATCHING: 'Menjodohkan',
  SHORT_ANSWER: 'Jawaban Singkat',
  ESSAY: 'Esai',
}

export default function PreviewUjianPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [pkg, setPkg] = useState<PackageWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    examPackagesApi.getById(id)
      .then(data => setPkg(data as PackageWithQuestions))
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading fullscreen text="Memuat preview..." />
  if (error) return <Alert variant="error">{error}</Alert>
  if (!pkg) return null

  const questions = pkg.questions ?? []
  const totalPoints = questions.reduce((sum, q) => sum + (q.pointsOverride ?? q.points), 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <div>
          <h1 className="text-2xl font-bold">Preview: {pkg.title}</h1>
          <p className="text-sm text-base-content/60">
            {questions.length} soal · {formatDuration(pkg.settings.duration * 60)} · {totalPoints} poin total
          </p>
        </div>
      </div>

      <Alert variant="info">
        Ini adalah tampilan preview. Jawaban benar tidak ditampilkan di sini.
      </Alert>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Soal', value: questions.length },
          { label: 'Durasi', value: formatDuration(pkg.settings.duration * 60) },
          { label: 'Total Poin', value: totalPoints },
          { label: 'Maks. Percobaan', value: pkg.settings.maxAttempts },
        ].map(s => (
          <Card key={s.label} compact className="text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-base-content/60 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Pengaturan */}
      <Card bordered compact>
        <p className="text-sm font-medium mb-2">Pengaturan:</p>
        <div className="flex flex-wrap gap-2">
          {pkg.settings.shuffleQuestions && <Badge variant="info" size="sm">Soal Diacak</Badge>}
          {pkg.settings.shuffleOptions && <Badge variant="info" size="sm">Opsi Diacak</Badge>}
          {pkg.settings.showResult && <Badge variant="success" size="sm">Hasil Ditampilkan</Badge>}
          {!pkg.settings.showResult && <Badge variant="warning" size="sm">Hasil Disembunyikan</Badge>}
        </div>
      </Card>

      {questions.length === 0 ? (
        <Alert variant="warning">Paket ini belum memiliki soal.</Alert>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          {/* Navigator */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-base-content/50 mb-2 px-1">DAFTAR SOAL</p>
            <div className="flex flex-wrap gap-1 lg:flex-col">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`flex items-center gap-2 rounded-box px-3 py-2 text-left text-sm transition-colors w-full ${
                    activeIdx === idx
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-200'
                  }`}
                >
                  <span className="font-mono font-bold w-6 shrink-0">{idx + 1}</span>
                  <span className="flex-1 truncate hidden lg:inline">{q.content.text.slice(0, 30)}</span>
                  <Badge
                    variant="ghost"
                    size="xs"
                    className={activeIdx === idx ? 'bg-primary-content/20 text-primary-content' : ''}
                  >
                    {q.pointsOverride ?? q.points}pt
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Question display */}
          {questions[activeIdx] && (
            <Card bordered>
              <div className="space-y-4">
                {/* Meta */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary" size="sm">Soal {activeIdx + 1}</Badge>
                  <Badge variant="neutral" size="sm">{TYPE_LABEL[questions[activeIdx]!.type] ?? questions[activeIdx]!.type}</Badge>
                  <Badge variant="ghost" size="sm">{questions[activeIdx]!.pointsOverride ?? questions[activeIdx]!.points} poin</Badge>
                  <Badge variant="ghost" size="sm">{'★'.repeat(questions[activeIdx]!.difficulty)}{'☆'.repeat(5 - questions[activeIdx]!.difficulty)}</Badge>
                </div>

                {/* Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-base leading-relaxed">{questions[activeIdx]!.content.text}</p>
                  {questions[activeIdx]!.content.images?.map((src, i) => (
                    <img key={i} src={src} alt={`Gambar ${i + 1}`} className="max-h-48 rounded-box object-contain mt-2" />
                  ))}
                </div>

                {/* Options preview */}
                {(() => {
                  const q = questions[activeIdx]!
                  if (q.type === 'MULTIPLE_CHOICE' || q.type === 'COMPLEX_MULTIPLE_CHOICE') {
                    const opts = q.options as Array<{ key: string; text: string }> | null
                    return opts && (
                      <div className="space-y-2">
                        {opts.map(opt => (
                          <div key={opt.key} className="flex items-center gap-3 rounded-box border border-base-300 p-3 text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-base-200 text-xs font-bold uppercase">{opt.key}</span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  if (q.type === 'TRUE_FALSE') {
                    return (
                      <div className="flex gap-3">
                        {['Benar', 'Salah'].map(label => (
                          <div key={label} className="flex flex-1 items-center justify-center gap-2 rounded-box border-2 border-base-300 py-3 text-sm font-medium">
                            {label === 'Benar' ? '✓' : '✕'} {label}
                          </div>
                        ))}
                      </div>
                    )
                  }
                  if (q.type === 'MATCHING') {
                    const opts = q.options as { left: Array<{ key: string; text: string }>; right: Array<{ key: string; text: string }> } | null
                    return opts && (
                      <div className="overflow-x-auto">
                        <table className="table table-compact w-full text-sm">
                          <thead><tr><th>Kiri</th><th>Kanan (pasangkan)</th></tr></thead>
                          <tbody>
                            {opts.left.map((l, i) => (
                              <tr key={l.key}>
                                <td>{l.key}. {l.text}</td>
                                <td className="text-base-content/50">{opts.right[i]?.key}. {opts.right[i]?.text}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  }
                  if (q.type === 'SHORT_ANSWER') {
                    return <div className="input input-bordered w-full opacity-50 cursor-not-allowed flex items-center text-sm text-base-content/40">Ketik jawaban singkat...</div>
                  }
                  if (q.type === 'ESSAY') {
                    return <div className="textarea textarea-bordered w-full opacity-50 cursor-not-allowed h-24 flex items-start pt-3 text-sm text-base-content/40">Tulis jawaban esai...</div>
                  }
                  return null
                })()}

                {/* Nav */}
                <div className="flex justify-between pt-2">
                  <Button size="sm" variant="ghost" onClick={() => setActiveIdx(i => Math.max(0, i - 1))} disabled={activeIdx === 0}>
                    ← Sebelumnya
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setActiveIdx(i => Math.min(questions.length - 1, i + 1))} disabled={activeIdx === questions.length - 1}>
                    Berikutnya →
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/app/(guru)/ujian/[id]/statistics/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { examPackagesApi } from '@/lib/api/exam-packages.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { ExamStatistics } from '@/components/analytics/ExamStatistics'
import { ItemAnalysisChart } from '@/components/analytics/ItemAnalysisChart'
import { DashboardStats } from '@/components/analytics/DashboardStats'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function PackageStatisticsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    examPackagesApi.getItemAnalysis(id)
      .then(setData)
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading fullscreen text="Memuat statistik..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Statistik Paket</h1>
      </div>

      {error && <Alert variant="warning">{error}</Alert>}

      {data && (
        <>
          <DashboardStats
            stats={[
              { label: 'Total Peserta', value: data.totalAttempts ?? 0, icon: '👥' },
              { label: 'Rata-rata Nilai', value: `${(data.avgScore ?? 0).toFixed(1)}%`, icon: '📊', variant: 'primary' },
              { label: 'Nilai Tertinggi', value: `${(data.maxScore ?? 0).toFixed(1)}%`, icon: '🏆', variant: 'success' },
              { label: 'Nilai Terendah', value: `${(data.minScore ?? 0).toFixed(1)}%`, icon: '📉' },
            ]}
          />

          {data.scoreDistribution && (
            <Card bordered>
              <ExamStatistics
                labels={Object.keys(data.scoreDistribution)}
                scores={Object.values(data.scoreDistribution) as number[]}
              />
            </Card>
          )}

          {data.itemAnalysis && data.itemAnalysis.length > 0 && (
            <Card bordered>
              <ItemAnalysisChart items={data.itemAnalysis} />
            </Card>
          )}
        </>
      )}
    </div>
  )
}

```

---

### File: `src/app/(operator)/dashboard/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { analyticsApi } from '@/lib/api/analytics.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { Loading } from '@/components/ui/Loading'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'

export default function OperatorDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    analyticsApi.getDashboard()
      .then(setStats)
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading text="Memuat dashboard..." />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Operator</h1>
      {error && <Alert variant="warning">{error}</Alert>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Sesi', key: 'totalSessions' },
          { label: 'Sesi Aktif', key: 'activeSessions' },
          { label: 'Total Peserta', key: 'totalStudents' },
          { label: 'Laporan', key: 'totalReports' },
        ].map(item => (
          <Card key={item.key} compact className="text-center">
            <p className="text-3xl font-bold text-primary">
              {stats ? String(stats[item.key] ?? 0) : '—'}
            </p>
            <p className="text-xs text-base-content/60 mt-1">{item.label}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

```

---

### File: `src/app/(operator)/laporan/page.tsx`

```typescript
'use client'
import { useState } from 'react'
import { apiPost, apiGet } from '@/lib/api/client'
import { sessionsApi } from '@/lib/api/sessions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { useEffect } from 'react'
import type { ExamSession } from '@/types/exam'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'

type ReportFormat = 'pdf' | 'excel'

export default function LaporanPage() {
  const { success, error: toastError } = useToast()
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [selectedSid, setSelectedSid] = useState('')
  const [format, setFormat] = useState<ReportFormat>('excel')
  const [generating, setGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    sessionsApi.list({ limit: 100 }).then(res => setSessions(res.data)).catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!selectedSid) return
    setGenerating(true)
    setDownloadUrl(null)
    try {
      const res = await apiPost<{ jobId: string }>('reports/generate', {
        sessionId: selectedSid,
        format,
      })
      // Poll hingga selesai
      let url: string | null = null
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000))
        const status = await apiGet<{ status: string; url?: string }>(`reports/status/${res.jobId}`)
        if (status.status === 'completed' && status.url) { url = status.url; break }
        if (status.status === 'failed') throw new Error('Gagal generate laporan')
      }
      if (url) {
        setDownloadUrl(url)
        success('Laporan berhasil digenerate!')
      }
    } catch (e) { toastError(parseErrorMessage(e)) }
    finally { setGenerating(false) }
  }

  const sessionOptions = sessions.map(s => ({ value: s.id, label: s.title }))

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Ekspor Laporan</h1>

      <Card bordered>
        <div className="space-y-4">
          <Select
            label="Pilih Sesi Ujian"
            options={sessionOptions}
            placeholder="Pilih sesi..."
            value={selectedSid}
            onChange={e => setSelectedSid(e.target.value)}
          />

          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Format Laporan</span></label>
            <div className="flex gap-3">
              {(['excel', 'pdf'] as const).map(f => (
                <label key={f} className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-box border-2 py-3 text-sm font-medium transition-colors ${format === f ? 'border-primary bg-primary/5' : 'border-base-300'}`}>
                  <input type="radio" className="radio radio-primary radio-sm" checked={format === f} onChange={() => setFormat(f)} />
                  {f === 'excel' ? '📊 Excel' : '📄 PDF'}
                </label>
              ))}
            </div>
          </div>

          {downloadUrl && (
            <Alert variant="success">
              Laporan siap!{' '}
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="link link-success font-medium">
                Download di sini
              </a>
            </Alert>
          )}

          <Button
            className="w-full"
            disabled={!selectedSid}
            loading={generating}
            onClick={handleGenerate}
          >
            {generating ? 'Membuat laporan...' : 'Generate Laporan'}
          </Button>
        </div>
      </Card>

      <Card compact>
        <p className="text-xs font-medium mb-2">Konten laporan:</p>
        <ul className="text-xs text-base-content/60 list-disc list-inside space-y-0.5">
          <li>Daftar peserta dan status pengerjaan</li>
          <li>Nilai per peserta (jika sudah dipublikasikan)</li>
          <li>Statistik soal (jawaban terbanyak, dll)</li>
          <li>Waktu mulai dan submit masing-masing peserta</li>
        </ul>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(operator)/layout.tsx`

```typescript
import { MainLayout } from '@/components/layout/MainLayout'

const OP_NAV = [
  { href: '/operator/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/operator/ruang', label: 'Ruang Ujian', icon: 'home' },
  { href: '/operator/sesi', label: 'Sesi Ujian', icon: 'calendar' },
  { href: '/operator/peserta', label: 'Peserta', icon: 'users' },
  { href: '/operator/laporan', label: 'Laporan', icon: 'file-text' },
]

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={OP_NAV} role="OPERATOR">{children}</MainLayout>
}

```

---

### File: `src/app/(operator)/peserta/import/page.tsx`

```typescript
'use client'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sessionsApi } from '@/lib/api/sessions.api'
import { apiPost } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamSession } from '@/types/exam'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'

export default function ImportPesertaPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [selectedSid, setSelectedSid] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ imported: number; failed: number } | null>(null)

  useEffect(() => {
    sessionsApi.list({ limit: 100 }).then(res => setSessions(res.data)).catch(() => {})
  }, [])

  const handleImport = async () => {
    if (!file || !selectedSid) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('sessionId', selectedSid)
      const res = await apiPost<{ imported: number; failed: number }>('sessions/import-students', fd)
      setResult(res)
      success(`${res.imported} peserta berhasil diimport`)
    } catch (e) { toastError(parseErrorMessage(e)) }
    finally { setUploading(false) }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Import Peserta</h1>
      </div>

      <Card bordered>
        <div className="space-y-4">
          <Select
            label="Pilih Sesi"
            options={sessions.map(s => ({ value: s.id, label: s.title }))}
            placeholder="Pilih sesi tujuan..."
            value={selectedSid}
            onChange={e => setSelectedSid(e.target.value)}
          />

          <div
            className="flex cursor-pointer flex-col items-center rounded-box border-2 border-dashed border-base-300 p-6 hover:border-primary/50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {file
              ? <p className="text-sm font-medium">📄 {file.name}</p>
              : <><span className="text-3xl mb-1">📋</span><p className="text-sm text-base-content/60">Pilih file Excel/CSV daftar peserta</p></>
            }
          </div>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null) }} />

          {result && (
            <Alert variant={result.failed > 0 ? 'warning' : 'success'}>
              {result.imported} peserta berhasil · {result.failed} gagal
            </Alert>
          )}

          <Alert variant="info" title="Format kolom">
            username (atau email) — satu baris satu peserta
          </Alert>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => router.back()}>Batal</Button>
            <Button className="flex-1" disabled={!file || !selectedSid} loading={uploading} onClick={handleImport}>
              Import Peserta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(operator)/peserta/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { sessionsApi } from '@/lib/api/sessions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamSession, SessionStudent } from '@/types/exam'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useToast } from '@/hooks/use-toast'

export default function PesertaPage() {
  const { success, error: toastError } = useToast()
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [selectedSid, setSelectedSid] = useState('')
  const [students, setStudents] = useState<SessionStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    sessionsApi.list({ limit: 100 })
      .then(res => setSessions(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedSid) { setStudents([]); return }
    setLoading(true)
    sessionsApi.getStudents(selectedSid)
      .then(setStudents)
      .catch(e => toastError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [selectedSid])

  const handleRemove = async (userId: string) => {
    if (!selectedSid) return
    setRemoving(userId)
    try {
      await sessionsApi.removeStudent(selectedSid, userId)
      success('Peserta berhasil dihapus')
      setStudents(prev => prev.filter(s => s.userId !== userId))
    } catch (e) { toastError(parseErrorMessage(e)) }
    finally { setRemoving(null) }
  }

  const sessionOptions = sessions.map(s => ({ value: s.id, label: `${s.title} (${s.status})` }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Peserta Ujian</h1>
      </div>

      <div className="max-w-sm">
        <Select
          label="Pilih Sesi"
          options={sessionOptions}
          placeholder="Pilih sesi..."
          value={selectedSid}
          onChange={e => setSelectedSid(e.target.value)}
        />
      </div>

      {selectedSid && (
        <Table
          data={students}
          keyExtractor={s => s.userId}
          loading={loading}
          emptyText="Belum ada peserta di sesi ini"
          columns={[
            {
              key: 'user', header: 'Peserta',
              render: s => (
                <div>
                  <p className="font-medium text-sm">{s.username ?? '—'}</p>
                  <p className="text-xs text-base-content/50">{s.email}</p>
                </div>
              ),
            },
            {
              key: 'token', header: 'Token Code', className: 'w-32',
              render: s => <code className="text-xs bg-base-200 px-2 py-0.5 rounded">{s.tokenCode}</code>,
            },
            {
              key: 'expires', header: 'Expires', className: 'w-40',
              render: s => s.expiresAt
                ? <span className="text-xs">{new Date(s.expiresAt).toLocaleString('id-ID')}</span>
                : <Badge variant="neutral" size="xs">Tidak ada batas</Badge>,
            },
            {
              key: 'actions', header: '', className: 'w-24',
              render: s => (
                <Button
                  size="xs" variant="ghost"
                  loading={removing === s.userId}
                  onClick={() => void handleRemove(s.userId)}
                  className="text-error"
                >
                  Hapus
                </Button>
              ),
            },
          ]}
        />
      )}

      {!selectedSid && (
        <div className="flex flex-col items-center py-12 text-center text-base-content/40">
          <span className="text-4xl mb-2">👥</span>
          <p>Pilih sesi untuk melihat daftar peserta</p>
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/app/(operator)/ruang/create/page.tsx`

```typescript
'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { apiPost } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface RoomForm { name: string; capacity?: number }

export default function CreateRuangPage() {
  const router = useRouter()
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RoomForm>()

  const onSubmit = async (data: RoomForm) => {
    setServerError(null)
    try {
      await apiPost('exam-rooms', {
        name: data.name,
        capacity: data.capacity ?? null,
      })
      success('Ruang ujian berhasil dibuat!')
      router.push('/operator/ruang')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Tambah Ruang Ujian</h1>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Ruang"
            placeholder="Contoh: Lab Komputer 1"
            error={errors.name?.message}
            {...register('name', { required: 'Nama ruang wajib diisi' })}
          />
          <Input
            label="Kapasitas (opsional)"
            type="number"
            placeholder="30"
            hint="Kosongkan jika tidak ada batas kapasitas"
            {...register('capacity', { valueAsNumber: true })}
          />

          <Alert variant="info" className="text-xs">
            Ruang ujian digunakan untuk mengelompokkan peserta dalam sesi ujian yang sama.
          </Alert>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>
              Simpan Ruang
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(operator)/ruang/page.tsx`

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamRoom } from '@/types/exam'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Confirm } from '@/components/ui/Confirm'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'

interface RoomForm { name: string; capacity?: number }

export default function RuangPage() {
  const { success, error: toastError } = useToast()
  const [rooms, setRooms] = useState<ExamRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ExamRoom | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExamRoom | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RoomForm>()

  const load = useCallback(async () => {
    setLoading(true)
    try { setRooms(await apiGet<ExamRoom[]>('exam-rooms')) }
    catch (e) { toastError(parseErrorMessage(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const openCreate = () => { setEditTarget(null); reset({ name: '', capacity: undefined }); setModalOpen(true) }
  const openEdit = (r: ExamRoom) => { setEditTarget(r); reset({ name: r.name, capacity: r.capacity ?? undefined }); setModalOpen(true) }

  const onSubmit = async (data: RoomForm) => {
    try {
      if (editTarget) { await apiPatch(`exam-rooms/${editTarget.id}`, data); success('Ruang diperbarui') }
      else { await apiPost('exam-rooms', data); success('Ruang dibuat') }
      setModalOpen(false)
      void load()
    } catch (e) { toastError(parseErrorMessage(e)) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try { await apiDelete(`exam-rooms/${deleteTarget.id}`); success('Ruang dihapus'); setDeleteTarget(null); void load() }
    catch (e) { toastError(parseErrorMessage(e)) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ruang Ujian</h1>
        <Button size="sm" onClick={openCreate}>+ Tambah Ruang</Button>
      </div>

      <Table
        data={rooms}
        keyExtractor={r => r.id}
        loading={loading}
        emptyText="Belum ada ruang ujian"
        columns={[
          { key: 'name', header: 'Nama Ruang', render: r => <span className="font-medium">{r.name}</span> },
          { key: 'cap', header: 'Kapasitas', className: 'w-28 text-center', render: r => <span>{r.capacity ?? '—'} orang</span> },
          {
            key: 'actions', header: '', className: 'w-28',
            render: r => (
              <div className="flex gap-1 justify-end">
                <Button size="xs" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
                <Button size="xs" variant="ghost" className="text-error" onClick={() => setDeleteTarget(r)}>Hapus</Button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Ruang' : 'Tambah Ruang'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nama Ruang" placeholder="Lab Komputer 1" error={errors.name?.message} {...register('name', { required: 'Wajib diisi' })} />
          <Input label="Kapasitas (opsional)" type="number" placeholder="30" {...register('capacity', { valueAsNumber: true })} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={isSubmitting}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Ruang?"
        message={`Ruang "${deleteTarget?.name}" akan dihapus permanen.`}
        variant="error"
        confirmLabel="Hapus"
        loading={deleting}
      />
    </div>
  )
}

```

---

### File: `src/app/(operator)/ruang/[id]/edit/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { apiGet, apiPatch } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamRoom } from '@/types/exam'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/hooks/use-toast'

interface RoomForm { name: string; capacity?: number }

export default function EditRuangPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RoomForm>()

  useEffect(() => {
    apiGet<ExamRoom>(`exam-rooms/${id}`)
      .then(room => reset({ name: room.name, capacity: room.capacity ?? undefined }))
      .catch(e => setLoadError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (data: RoomForm) => {
    setServerError(null)
    try {
      await apiPatch(`exam-rooms/${id}`, {
        name: data.name,
        capacity: data.capacity ?? null,
      })
      success('Ruang ujian berhasil diperbarui!')
      router.push('/operator/ruang')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  if (loading) return <Loading fullscreen text="Memuat data ruang..." />
  if (loadError) return (
    <div className="mx-auto max-w-md pt-8">
      <Alert variant="error">{loadError}</Alert>
      <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Kembali</Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Edit Ruang Ujian</h1>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Ruang"
            placeholder="Contoh: Lab Komputer 1"
            error={errors.name?.message}
            {...register('name', { required: 'Nama ruang wajib diisi' })}
          />
          <Input
            label="Kapasitas (opsional)"
            type="number"
            placeholder="30"
            hint="Kosongkan jika tidak ada batas kapasitas"
            {...register('capacity', { valueAsNumber: true })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(operator)/sesi/create/page.tsx`

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sessionsApi, type CreateSessionPayload } from '@/lib/api/sessions.api'
import { examPackagesApi } from '@/lib/api/exam-packages.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { createSessionSchema, type CreateSessionInput } from '@/schemas/exam.schema'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'

export default function CreateSesiPage() {
  const router = useRouter()
  const { success } = useToast()
  const [packages, setPackages] = useState<Array<{ value: string; label: string }>>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
  })

  useEffect(() => {
    examPackagesApi.list({ limit: 100 })
      .then(res => setPackages(res.data
        .filter(p => p.status === 'PUBLISHED')
        .map(p => ({ value: p.id, label: p.title }))
      ))
      .catch(() => {})
  }, [])

  const onSubmit = async (data: CreateSessionInput) => {
    setServerError(null)
    try {
      await sessionsApi.create(data as CreateSessionPayload)
      success('Sesi berhasil dibuat!')
      router.push('/operator/sesi')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Buat Sesi Ujian</h1>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Judul Sesi" placeholder="Contoh: UAS Matematika Kelas X"
            error={errors.title?.message} {...register('title')} />

          <Select
            label="Paket Ujian"
            options={packages}
            placeholder="Pilih paket..."
            error={errors.examPackageId?.message}
            {...register('examPackageId')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Waktu Mulai" type="datetime-local"
              error={errors.startTime?.message} {...register('startTime')} />
            <Input label="Waktu Selesai" type="datetime-local"
              error={errors.endTime?.message} {...register('endTime')} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>Buat Sesi</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(operator)/sesi/page.tsx`

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { sessionsApi } from '@/lib/api/sessions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatDateTime } from '@/lib/utils/format'
import type { ExamSession } from '@/types/exam'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Confirm } from '@/components/ui/Confirm'
import { useToast } from '@/hooks/use-toast'

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'error' | 'info' | 'neutral'> = {
  SCHEDULED: 'info', ACTIVE: 'success', PAUSED: 'warning',
  COMPLETED: 'neutral', CANCELLED: 'error',
}

export default function SesiPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activateTarget, setActivateTarget] = useState<ExamSession | null>(null)
  const [actioning, setActioning] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sessionsApi.list({ limit: 50 })
      setSessions(res.data)
    } catch (e) { setError(parseErrorMessage(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleActivate = async () => {
    if (!activateTarget) return
    setActioning(true)
    try {
      await sessionsApi.activate(activateTarget.id)
      success(`Sesi "${activateTarget.title}" diaktifkan!`)
      setActivateTarget(null)
      void load()
    } catch (e) { toastError(parseErrorMessage(e)) }
    finally { setActioning(false) }
  }

  const handlePause = async (id: string) => {
    try { await sessionsApi.pause(id); success('Sesi dijeda'); void load() }
    catch (e) { toastError(parseErrorMessage(e)) }
  }

  const handleComplete = async (id: string) => {
    try { await sessionsApi.complete(id); success('Sesi diselesaikan'); void load() }
    catch (e) { toastError(parseErrorMessage(e)) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sesi Ujian</h1>
          <p className="text-sm text-base-content/60">{sessions.length} sesi</p>
        </div>
        <Button size="sm" onClick={() => router.push('/operator/sesi/create')}>+ Buat Sesi</Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Table
        data={sessions}
        keyExtractor={s => s.id}
        loading={loading}
        emptyText="Belum ada sesi"
        zebra
        columns={[
          {
            key: 'title', header: 'Judul',
            render: s => (
              <div>
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-base-content/50">{s.examPackage?.title}</p>
              </div>
            ),
          },
          {
            key: 'time', header: 'Waktu',
            render: s => (
              <div className="text-xs text-base-content/70 space-y-0.5">
                <p>▶ {formatDateTime(s.startTime)}</p>
                <p>■ {formatDateTime(s.endTime)}</p>
              </div>
            ),
          },
          {
            key: 'status', header: 'Status', className: 'w-28',
            render: s => <Badge variant={STATUS_VARIANT[s.status] ?? 'neutral'} size="sm">{s.status}</Badge>,
          },
          {
            key: 'students', header: 'Peserta', className: 'w-20 text-center',
            render: s => <span className="font-mono text-sm">{s.studentCount ?? 0}</span>,
          },
          {
            key: 'actions', header: '', className: 'w-52',
            render: s => (
              <div className="flex gap-1 flex-wrap justify-end">
                {s.status === 'SCHEDULED' && (
                  <Button size="xs" variant="success" onClick={() => setActivateTarget(s)}>▶ Aktifkan</Button>
                )}
                {s.status === 'ACTIVE' && (
                  <Button size="xs" variant="warning" onClick={() => void handlePause(s.id)}>⏸ Jeda</Button>
                )}
                {(s.status === 'ACTIVE' || s.status === 'PAUSED') && (
                  <Button size="xs" variant="error" onClick={() => void handleComplete(s.id)}>■ Selesai</Button>
                )}
                <Button size="xs" variant="ghost" onClick={() => router.push(`/operator/sesi/${s.id}/edit`)}>Edit</Button>
              </div>
            ),
          },
        ]}
      />

      <Confirm
        open={!!activateTarget}
        onCancel={() => setActivateTarget(null)}
        onConfirm={handleActivate}
        title="Aktifkan Sesi?"
        message={`Sesi "${activateTarget?.title}" akan diaktifkan. Peserta bisa mulai download soal.`}
        confirmLabel="Aktifkan"
        loading={actioning}
      />
    </div>
  )
}

```

---

### File: `src/app/(operator)/sesi/[id]/edit/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sessionsApi } from '@/lib/api/sessions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { createSessionSchema, type CreateSessionInput } from '@/schemas/exam.schema'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'

export default function EditSesiPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
  })

  useEffect(() => {
    sessionsApi.getById(id)
      .then(s => reset({
        title: s.title,
        examPackageId: s.examPackageId,
        roomId: s.roomId ?? undefined,
        startTime: s.startTime.slice(0, 16),
        endTime: s.endTime.slice(0, 16),
      }))
      .catch(e => setLoadError(parseErrorMessage(e)))
  }, [id, reset])

  const onSubmit = async (data: CreateSessionInput) => {
    setServerError(null)
    try {
      await sessionsApi.update(id, data)
      success('Sesi berhasil diperbarui!')
      router.push('/operator/sesi')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  if (loadError) return <Alert variant="error">{loadError}</Alert>

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Edit Sesi</h1>
      </div>
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Judul Sesi" error={errors.title?.message} {...register('title')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Waktu Mulai" type="datetime-local" error={errors.startTime?.message} {...register('startTime')} />
            <Input label="Waktu Selesai" type="datetime-local" error={errors.endTime?.message} {...register('endTime')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>Simpan</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(operator)/sesi/[id]/monitoring/page.tsx`

```typescript
'use client'
import { useParams, useRouter } from 'next/navigation'
import { LiveMonitor } from '@/components/monitoring/LiveMonitor'
import { Button } from '@/components/ui/Button'

export default function SesiMonitoringPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <div>
          <h1 className="text-2xl font-bold">Live Monitoring</h1>
          <p className="text-sm text-base-content/60 font-mono">Session: {sessionId}</p>
        </div>
      </div>
      <LiveMonitor sessionId={sessionId} />
    </div>
  )
}

```

---

### File: `src/app/(pengawas)/dashboard/page.tsx`

```typescript
'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function PengawasDashboard() {
  const router = useRouter()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Pengawas</h1>
      <Card>
        <p className="text-sm text-base-content/60 mb-4">
          Pantau peserta ujian secara real-time melalui halaman monitoring.
        </p>
        <Button onClick={() => router.push('/pengawas/monitoring/live')}>
          Lihat Sesi Aktif →
        </Button>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(pengawas)/layout.tsx`

```typescript
import { MainLayout } from '@/components/layout/MainLayout'

const PENGAWAS_NAV = [
  { href: '/pengawas/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/pengawas/monitoring/live', label: 'Live Monitor', icon: 'monitor' },
]

export default function PengawasLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={PENGAWAS_NAV} role="SUPERVISOR">{children}</MainLayout>
}

```

---

### File: `src/app/(pengawas)/monitoring/live/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sessionsApi } from '@/lib/api/sessions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamSession } from '@/types/exam'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { formatDateTime } from '@/lib/utils/format'

export default function LiveSessionListPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    sessionsApi.list({ limit: 50 })
      .then(res => setSessions(res.data.filter(s => s.status === 'ACTIVE' || s.status === 'PAUSED')))
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading fullscreen text="Memuat sesi aktif..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sesi Aktif</h1>
        <p className="text-sm text-base-content/60">Pilih sesi untuk mulai monitoring</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-4xl mb-3">🔍</span>
          <p className="font-medium">Tidak ada sesi aktif saat ini</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map(session => (
            <Card
              key={session.id}
              bordered
              className="cursor-pointer hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm">{session.title}</h3>
                  <Badge variant={session.status === 'ACTIVE' ? 'success' : 'warning'} size="xs">
                    {session.status === 'ACTIVE' ? '🟢 Aktif' : '⏸ Jeda'}
                  </Badge>
                </div>
                <p className="text-xs text-base-content/60">
                  {session.examPackage?.title ?? '—'}
                </p>
                <div className="text-xs text-base-content/50 space-y-0.5">
                  <p>Mulai: {formatDateTime(session.startTime)}</p>
                  <p>Selesai: {formatDateTime(session.endTime)}</p>
                  {session.studentCount !== undefined && (
                    <p>{session.studentCount} peserta</p>
                  )}
                </div>
                <button
                  className="btn btn-sm btn-primary w-full mt-2"
                  onClick={() => router.push(`/pengawas/monitoring/${session.id}`)}
                >
                  Monitor Sesi →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/app/(pengawas)/monitoring/[sessionId]/page.tsx`

```typescript
'use client'
import { useParams } from 'next/navigation'
import { LiveMonitor } from '@/components/monitoring/LiveMonitor'

export default function MonitoringSessionPage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Live Monitoring</h1>
        <p className="text-sm text-base-content/60 font-mono">Session: {sessionId}</p>
      </div>
      <LiveMonitor sessionId={sessionId} />
    </div>
  )
}

```

---

### File: `src/app/(siswa)/dashboard/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { submissionsApi } from '@/lib/api/submissions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatDateTime } from '@/lib/utils/format'
import type { ExamAttempt } from '@/types/exam'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { useAuthStore } from '@/stores/auth.store'

const STATUS_LABEL: Record<string, { label: string; variant: 'primary' | 'success' | 'error' | 'warning' }> = {
  IN_PROGRESS: { label: 'Sedang Berlangsung', variant: 'warning' },
  SUBMITTED: { label: 'Selesai', variant: 'success' },
  TIMED_OUT: { label: 'Waktu Habis', variant: 'error' },
  ABANDONED: { label: 'Dibatalkan', variant: 'error' },
}

export default function SiswaDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    submissionsApi.getAttempts()
      .then(setAttempts)
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading text="Memuat data..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Selamat Datang, {user?.username ?? 'Siswa'}</h1>
        <p className="text-sm text-base-content/60">Riwayat ujian dan akses cepat</p>
      </div>

      <Button onClick={() => router.push('/siswa/ujian/download')} className="w-full sm:w-auto">
        + Mulai Ujian Baru
      </Button>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-3">
        <h2 className="font-semibold">Riwayat Ujian</h2>
        {attempts.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center text-base-content/40">
            <span className="text-4xl mb-2">📋</span>
            <p>Belum ada riwayat ujian.</p>
          </div>
        ) : (
          attempts.map(attempt => {
            const cfg = STATUS_LABEL[attempt.status]
            return (
              <Card key={attempt.id} compact bordered className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium font-mono">{attempt.id.slice(0, 8)}...</p>
                  <p className="text-xs text-base-content/50">{formatDateTime(attempt.startedAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cfg?.variant ?? 'neutral'} size="xs">{cfg?.label}</Badge>
                  {attempt.status === 'SUBMITTED' && attempt.gradingStatus === 'PUBLISHED' && (
                    <Button size="xs" variant="ghost"
                      onClick={() => router.push(`/siswa/ujian/${attempt.sessionId}/result`)}>
                      Lihat Nilai
                    </Button>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

```

---

### File: `src/app/(siswa)/layout.tsx`

```typescript
import { MainLayout } from '@/components/layout/MainLayout'

const SISWA_NAV = [
  { href: '/siswa/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/siswa/ujian', label: 'Ujian Saya', icon: 'book-open' },
  { href: '/siswa/profile', label: 'Profil', icon: 'user' },
]

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={SISWA_NAV} role="STUDENT">{children}</MainLayout>
}

```

---

### File: `src/app/(siswa)/profile/page.tsx`

```typescript
'use client'
import { useAuthStore } from '@/stores/auth.store'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function ProfilePage() {
  const { user } = useAuthStore()
  if (!user) return null
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Profil Saya</h1>
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="avatar placeholder">
            <div className="w-16 rounded-full bg-primary text-primary-content">
              <span className="text-xl">{user.username[0]?.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <p className="font-bold text-lg">{user.username}</p>
            <p className="text-sm text-base-content/60">{user.email}</p>
            <Badge variant="primary" size="xs" className="mt-1">{user.role}</Badge>
          </div>
        </div>
        <div className="divider" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/60">ID</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Status</span>
            <Badge variant={user.isActive ? 'success' : 'error'} size="xs">
              {user.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(siswa)/ujian/download/page.tsx`

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { startExam } from '@/lib/exam/controller'
import { useExamStore } from '@/stores/exam.store'
import { parseErrorMessage } from '@/lib/utils/error'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

const schema = z.object({
  tokenCode: z.string().min(4, 'Kode token wajib diisi'),
})
type Form = z.infer<typeof schema>

export default function DownloadPage() {
  const router = useRouter()
  const { setPackage } = useExamStore()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'idle' | 'downloading' | 'decrypting'>('idle')

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ tokenCode }: Form) => {
    setError(null)
    try {
      setStep('downloading')
      const { decryptedPackage, attemptId } = await startExam(tokenCode)
      setStep('decrypting')

      // Simpan ke exam store
      setPackage(decryptedPackage, {
        id: attemptId,
        sessionId: decryptedPackage.sessionId,
        userId: '',
        idempotencyKey: '',
        deviceFingerprint: null,
        startedAt: new Date().toISOString(),
        submittedAt: null,
        status: 'IN_PROGRESS',
        packageHash: decryptedPackage.packageHash,
        totalScore: null,
        maxScore: null,
        gradingStatus: 'PENDING',
        gradingCompletedAt: null,
      })

      router.replace(`/siswa/ujian/${decryptedPackage.sessionId}`)
    } catch (e) {
      setError(parseErrorMessage(e))
      setStep('idle')
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Mulai Ujian</h1>
        <p className="mt-1 text-sm text-base-content/60">Masukkan kode token yang diberikan pengawas</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          {step !== 'idle' && (
            <Alert variant="info">
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                {step === 'downloading' ? 'Mengunduh paket soal...' : 'Mendekripsi soal...'}
              </div>
            </Alert>
          )}

          <Input
            label="Kode Token"
            placeholder="Contoh: ABC123"
            error={errors.tokenCode?.message}
            disabled={step !== 'idle'}
            className="text-center text-lg tracking-widest font-mono uppercase"
            {...register('tokenCode', { setValueAs: v => String(v).toUpperCase() })}
          />

          <Button type="submit" wide className="w-full" loading={step !== 'idle'}>
            Download & Mulai
          </Button>
        </form>
      </Card>

      <Alert variant="warning">
        Pastikan browser Anda mendukung Web Crypto API dan tersedia minimal 2 GB ruang penyimpanan.
      </Alert>
    </div>
  )
}

```

---

### File: `src/app/(siswa)/ujian/page.tsx`

```typescript
'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

export default function UjianPage() {
  const router = useRouter()
  return (
    <div className="mx-auto max-w-lg space-y-4 pt-8">
      <Card>
        <h1 className="text-xl font-bold mb-2">Ujian Saya</h1>
        <p className="text-sm text-base-content/60 mb-4">
          Untuk mengikuti ujian, masukkan kode token yang diberikan oleh pengawas.
        </p>
        <Button className="w-full" onClick={() => router.push('/siswa/ujian/download')}>
          Masukkan Token Ujian
        </Button>
      </Card>
      <Alert variant="info">
        Pastikan Anda sudah mendapatkan kode token dari pengawas sebelum memulai ujian.
      </Alert>
    </div>
  )
}

```

---

### File: `src/app/(siswa)/ujian/[sessionId]/page.tsx`

```typescript
'use client'
import { useEffect, lazy, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useExamStore, selectCurrentQuestion, selectTotalQuestions } from '@/stores/exam.store'
import { useAnswerStore } from '@/stores/answer.store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useTimer } from '@/hooks/use-timer'
import { useToast } from '@/hooks/use-toast'
import { submitExam } from '@/lib/exam/controller'
import { validateAnswers } from '@/lib/exam/validator'
import { ExamTimer } from '@/components/exam/ExamTimer'
import { QuestionNavigation } from '@/components/exam/QuestionNavigation'
import { AutoSaveIndicator } from '@/components/exam/AutoSaveIndicator'
import { ActivityLogger } from '@/components/exam/ActivityLogger'
import { ProgressBar } from '@/components/exam/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Confirm } from '@/components/ui/Confirm'
import { Loading } from '@/components/ui/Loading'
import { getAnswersByAttempt } from '@/lib/db/queries'
import { useState } from 'react'
import type { AnswerValue } from '@/types/answer'
import type { ExamQuestion } from '@/types/question'

// Lazy load per tipe soal
const MultipleChoice = lazy(() => import('@/components/exam/question-types/MultipleChoice').then(m => ({ default: m.MultipleChoice })))
const MultipleChoiceComplex = lazy(() => import('@/components/exam/question-types/MultipleChoiceComplex').then(m => ({ default: m.MultipleChoiceComplex })))
const TrueFalse = lazy(() => import('@/components/exam/question-types/TrueFalse').then(m => ({ default: m.TrueFalse })))
const ShortAnswer = lazy(() => import('@/components/exam/question-types/ShortAnswer').then(m => ({ default: m.ShortAnswer })))
const Essay = lazy(() => import('@/components/exam/question-types/Essay').then(m => ({ default: m.Essay })))
const Matching = lazy(() => import('@/components/exam/question-types/Matching').then(m => ({ default: m.Matching })))

function QuestionRenderer({ question }: { question: ExamQuestion }) {
  const { answers } = useAnswerStore()
  const params = useParams()
  const sessionId = params.sessionId as string
  const { activeAttempt } = useExamStore()
  const { saveAnswer } = useAutoSave({ attemptId: activeAttempt?.id ?? '', sessionId })

  const val = answers[question.id]

  const handleChange = (v: AnswerValue) => saveAnswer(question.id, v)

  return (
    <Suspense fallback={<Loading size="sm" />}>
      {question.type === 'MULTIPLE_CHOICE' && (
        <MultipleChoice
          options={question.options as never}
          value={val as string | undefined}
          onChange={handleChange}
        />
      )}
      {question.type === 'COMPLEX_MULTIPLE_CHOICE' && (
        <MultipleChoiceComplex
          options={question.options as never}
          value={val as string[] | undefined}
          onChange={handleChange}
        />
      )}
      {question.type === 'TRUE_FALSE' && (
        <TrueFalse value={val as string | undefined} onChange={handleChange} />
      )}
      {question.type === 'SHORT_ANSWER' && (
        <ShortAnswer value={val as string | undefined} onChange={handleChange} />
      )}
      {question.type === 'ESSAY' && (
        <Essay value={val as string | undefined} onChange={handleChange} />
      )}
      {question.type === 'MATCHING' && (
        <Matching
          options={question.options as never}
          value={val as Record<string, string> | undefined}
          onChange={handleChange}
        />
      )}
    </Suspense>
  )
}

export default function ExamPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string
  const { success, error: toastError } = useToast()

  const examStore = useExamStore()
  const { answers } = useAnswerStore()
  const currentQuestion = selectCurrentQuestion(examStore)
  const totalQuestions = selectTotalQuestions(examStore)
  const answeredCount = Object.keys(answers).length
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const attempt = examStore.activeAttempt
  const pkg = examStore.activePackage

  // Redirect jika tidak ada attempt aktif
  useEffect(() => {
    if (!attempt || !pkg) {
      router.replace('/siswa/ujian/download')
    }
  }, [attempt, pkg, router])

  // Hydrate jawaban dari IndexedDB saat page load
  useEffect(() => {
    if (!attempt) return
    getAnswersByAttempt(attempt.id).then(localAnswers => {
      if (localAnswers.length > 0) {
        useAnswerStore.getState().hydrateFromLocal(
          localAnswers.map(a => ({ questionId: a.questionId, answer: a.answer, mediaUrls: a.mediaUrls }))
        )
      }
    })
  }, [attempt])

  // Timer
  useTimer({
    durationSeconds: (pkg?.settings.duration ?? 0) * 60,
    startedAt: attempt ? new Date(attempt.startedAt).getTime() : Date.now(),
    onExpire: handleSubmit,
  })

  async function handleSubmit() {
    if (!attempt) return
    setIsSubmitting(true)
    try {
      await submitExam(attempt.id)
      examStore.markSubmitted()
      success('Ujian berhasil dikumpulkan!')
      router.replace(`/siswa/ujian/${sessionId}/result`)
    } catch (e) {
      toastError('Gagal mengumpulkan ujian. Mencoba ulang...')
      setIsSubmitting(false)
    }
  }

  if (!attempt || !pkg || !currentQuestion) {
    return <Loading fullscreen text="Memuat ujian..." />
  }

  const warnings = validateAnswers(pkg, answers)
  const unansweredCount = warnings.length

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* Activity logger (invisible) */}
      <ActivityLogger attemptId={attempt.id} sessionId={sessionId} />

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-base-300 bg-base-100 px-4 py-2">
        <div className="flex items-center gap-4">
          <ExamTimer />
          <div className="hidden sm:block">
            <AutoSaveIndicator />
          </div>
        </div>
        <div className="text-sm font-medium">
          Soal {examStore.currentQuestionIndex + 1} / {totalQuestions}
        </div>
        <Button
          variant="error"
          size="sm"
          onClick={() => setShowSubmitConfirm(true)}
          disabled={isSubmitting}
        >
          Kumpulkan
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Question navigation */}
        <div className="hidden w-56 shrink-0 overflow-y-auto border-r border-base-300 md:block">
          <div className="p-3">
            <ProgressBar answered={answeredCount} total={totalQuestions} />
          </div>
          <QuestionNavigation />
        </div>

        {/* Main — Question content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {/* Question header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary badge-outline">
                  Soal {examStore.currentQuestionIndex + 1}
                </span>
                <span className="text-xs text-base-content/50">{currentQuestion.points} poin</span>
              </div>
              <span className="badge badge-ghost badge-sm">{currentQuestion.type.replace(/_/g, ' ')}</span>
            </div>

            {/* Question content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-base leading-relaxed">{currentQuestion.content.text}</p>
              {currentQuestion.content.images?.map((src, i) => (
                <img key={i} src={src} alt={`Gambar ${i + 1}`} className="max-h-64 rounded-box object-contain" />
              ))}
            </div>

            {/* Answer input */}
            <div className="rounded-box bg-base-200/50 p-4">
              <QuestionRenderer question={currentQuestion} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between border-t border-base-300 bg-base-100 px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={examStore.prevQuestion}
          disabled={examStore.currentQuestionIndex === 0}
        >
          ← Sebelumnya
        </Button>

        {/* Mobile: soal navigator */}
        <div className="flex gap-1 md:hidden overflow-x-auto max-w-[60vw] py-1">
          {examStore.questionOrder.slice(
            Math.max(0, examStore.currentQuestionIndex - 2),
            examStore.currentQuestionIndex + 3,
          ).map((id, relIdx) => {
            const absIdx = Math.max(0, examStore.currentQuestionIndex - 2) + relIdx
            const isCurr = absIdx === examStore.currentQuestionIndex
            return (
              <button
                key={id}
                onClick={() => examStore.goToQuestion(absIdx)}
                className={`btn btn-xs btn-square font-mono ${isCurr ? 'btn-primary' : 'btn-ghost'}`}
              >
                {absIdx + 1}
              </button>
            )
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={examStore.nextQuestion}
          disabled={examStore.currentQuestionIndex === totalQuestions - 1}
        >
          Berikutnya →
        </Button>
      </div>

      {/* Submit confirm */}
      <Confirm
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirm={handleSubmit}
        title="Kumpulkan Ujian?"
        message={unansweredCount > 0
          ? `Masih ada ${unansweredCount} soal yang belum dijawab. Yakin ingin mengumpulkan?`
          : 'Semua soal sudah dijawab. Kumpulkan sekarang?'}
        variant={unansweredCount > 0 ? 'warning' : 'primary'}
        confirmLabel="Ya, Kumpulkan"
        loading={isSubmitting}
      />
    </div>
  )
}

```

---

### File: `src/app/(siswa)/ujian/[sessionId]/result/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useExamStore } from '@/stores/exam.store'
import { submissionsApi } from '@/lib/api/submissions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatDateTime } from '@/lib/utils/format'
import type { ExamResult } from '@/types/exam'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const GRADING_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu',
  AUTO_GRADED: 'Sudah Dinilai',
  MANUAL_REQUIRED: 'Menunggu Guru',
  COMPLETED: 'Selesai Dinilai',
  PUBLISHED: 'Nilai Dipublikasikan',
}

export default function ResultPage() {
  const params = useParams()
  const { activeAttempt, clearExam } = useExamStore()
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const attemptId = activeAttempt?.id ?? (params.sessionId as string)

  useEffect(() => {
    if (!attemptId) return
    submissionsApi.getResult(attemptId)
      .then(setResult)
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [attemptId])

  useEffect(() => {
    // Bersihkan exam state setelah result dimuat
    return () => { clearExam() }
  }, [clearExam])

  if (loading) return <Loading fullscreen text="Memuat hasil ujian..." />
  if (error) return (
    <div className="mx-auto max-w-md pt-16">
      <Alert variant="error">{error}</Alert>
    </div>
  )
  if (!result) return null

  const pct = result.percentage
  const scoreColor = pct >= 75 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-error'

  return (
    <div className="mx-auto max-w-lg space-y-6 pt-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{result.sessionTitle}</h1>
        <p className="text-sm text-base-content/60">Dikumpulkan: {formatDateTime(result.submittedAt)}</p>
        <Badge
          variant={result.gradingStatus === 'PUBLISHED' ? 'success' : 'warning'}
          size="sm"
        >
          {GRADING_STATUS_LABEL[result.gradingStatus]}
        </Badge>
      </div>

      {result.gradingStatus === 'PUBLISHED' ? (
        <>
          {/* Score card */}
          <Card className="text-center">
            <div className={`text-6xl font-bold tabular-nums ${scoreColor}`}>
              {Math.round(pct)}
            </div>
            <p className="text-base-content/60 mt-1">Nilai (%)</p>
            <p className="mt-2 text-sm">
              {result.totalScore} / {result.maxScore} poin
            </p>
          </Card>

          {/* Breakdown */}
          {result.answers && result.answers.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-3">Rincian Jawaban</h3>
              <div className="space-y-2">
                {result.answers.map((a, i) => (
                  <div key={a.questionId} className="flex items-center justify-between text-sm">
                    <span className="text-base-content/60">Soal {i + 1}</span>
                    <div className="flex items-center gap-2">
                      {a.feedback && <span className="text-xs text-base-content/50 italic">{a.feedback}</span>}
                      <span className={a.score === a.maxScore ? 'text-success font-medium' : 'text-base-content'}>
                        {a.score ?? '-'}/{a.maxScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Alert variant="info" title="Nilai belum tersedia">
          {result.gradingStatus === 'MANUAL_REQUIRED'
            ? 'Ujian Anda mengandung soal esai yang perlu dinilai manual oleh guru.'
            : 'Nilai sedang diproses. Silakan cek kembali nanti.'}
        </Alert>
      )}
    </div>
  )
}

```

---

### File: `src/app/(siswa)/ujian/[sessionId]/review/page.tsx`

```typescript
'use client'
import { useExamStore, selectTotalQuestions } from '@/stores/exam.store'
import { useAnswerStore } from '@/stores/answer.store'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/exam/ProgressBar'

export default function ReviewPage() {
  const router = useRouter()
  const examStore = useExamStore()
  const { answers } = useAnswerStore()
  const total = selectTotalQuestions(examStore)
  const answered = Object.keys(answers).length

  if (!examStore.activePackage) {
    router.replace('/siswa/ujian/download')
    return null
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Review Jawaban</h1>
        <Button size="sm" onClick={() => router.back()}>← Kembali ke Ujian</Button>
      </div>

      <ProgressBar answered={answered} total={total} />

      <div className="space-y-3">
        {examStore.activePackage.questions.map((q, idx) => {
          const ans = answers[q.id]
          const hasAnswer = ans !== undefined && ans !== '' &&
            !(Array.isArray(ans) && ans.length === 0)
          return (
            <Card
              key={q.id}
              compact
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { examStore.goToQuestion(idx); router.back() }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-base-content/50">#{idx + 1}</span>
                    <Badge variant={hasAnswer ? 'success' : 'warning'} size="xs">
                      {hasAnswer ? 'Dijawab' : 'Belum'}
                    </Badge>
                    <Badge variant="neutral" size="xs">
                      {q.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm line-clamp-2">{q.content.text}</p>
                </div>
                <span className="text-xs text-base-content/40 shrink-0">{q.points}pt</span>
              </div>
            </Card>
          )
        })}
      </div>

      {answered < total && (
        <div className="alert alert-warning text-sm">
          <span>⚠</span>
          <span>{total - answered} soal belum dijawab. Pastikan semua sudah terisi sebelum mengumpulkan.</span>
        </div>
      )}

      <Button variant="error" className="w-full" onClick={() => router.back()}>
        Kembali & Kumpulkan
      </Button>
    </div>
  )
}

```

---

### File: `src/app/(superadmin)/audit-logs/page.tsx`

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { apiGet } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatDateTime } from '@/lib/utils/format'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

interface AuditLog {
  id: string; action: string; entityType: string; entityId: string
  userId: string | null; ipAddress: string | null; createdAt: string
  user?: { username: string }
}

const ACTION_VARIANT: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  login: 'success', logout: 'info', start_exam: 'info',
  submit_exam: 'success', grade_answer: 'warning', publish_result: 'success',
  delete: 'error', lock_device: 'error',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = search ? `?search=${search}&limit=100` : '?limit=100'
      const res = await apiGet<{ data: AuditLog[] }>(`audit-logs${params}`)
      setLogs(res.data)
    } catch (e) { setError(parseErrorMessage(e)) }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { void load() }, [load])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <Input placeholder="Cari aksi, entity..." value={search} onChange={e => setSearch(e.target.value)} inputSize="sm" className="max-w-sm" />
      {error && <Alert variant="error">{error}</Alert>}
      <Table
        data={logs}
        keyExtractor={l => l.id}
        loading={loading}
        emptyText="Tidak ada log"
        compact
        columns={[
          { key: 'time', header: 'Waktu', className: 'w-36', render: l => <span className="text-xs font-mono">{formatDateTime(l.createdAt)}</span> },
          { key: 'user', header: 'Pengguna', className: 'w-32', render: l => <span className="text-sm">{l.user?.username ?? l.userId?.slice(0, 8) ?? 'System'}</span> },
          { key: 'action', header: 'Aksi', className: 'w-36', render: l => <Badge variant={ACTION_VARIANT[l.action] ?? 'neutral'} size="xs">{l.action}</Badge> },
          { key: 'entity', header: 'Entity', render: l => <span className="text-xs text-base-content/60">{l.entityType} · <code>{l.entityId.slice(0, 8)}</code></span> },
          { key: 'ip', header: 'IP', className: 'w-28', render: l => <code className="text-xs text-base-content/40">{l.ipAddress ?? '—'}</code> },
        ]}
      />
    </div>
  )
}

```

---

### File: `src/app/(superadmin)/dashboard/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { analyticsApi } from '@/lib/api/analytics.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { DashboardStats } from '@/components/analytics/DashboardStats'
import { Alert } from '@/components/ui/Alert'

export default function SuperadminDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    analyticsApi.getDashboard()
      .then(setStats)
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Sekolah', value: stats ? String(stats.totalTenants ?? 0) : '—', icon: '🏫', variant: 'primary' as const },
    { label: 'Total Pengguna', value: stats ? String(stats.totalUsers ?? 0) : '—', icon: '👥' },
    { label: 'Sesi Aktif', value: stats ? String(stats.activeSessions ?? 0) : '—', icon: '📋', variant: 'success' as const },
    { label: 'Ujian Hari Ini', value: stats ? String(stats.examsToday ?? 0) : '—', icon: '📅' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Superadmin</h1>
      {error && <Alert variant="warning">{error}</Alert>}
      <DashboardStats stats={statCards} loading={loading} />
    </div>
  )
}

```

---

### File: `src/app/(superadmin)/layout.tsx`

```typescript
import { MainLayout } from '@/components/layout/MainLayout'

const SA_NAV = [
  { href: '/superadmin/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/superadmin/schools', label: 'Sekolah', icon: 'home' },
  { href: '/superadmin/users', label: 'Pengguna', icon: 'users' },
  { href: '/superadmin/audit-logs', label: 'Audit Log', icon: 'shield' },
  { href: '/superadmin/settings', label: 'Pengaturan', icon: 'settings' },
]

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={SA_NAV} role="SUPERADMIN">{children}</MainLayout>
}

```

---

### File: `src/app/(superadmin)/schools/create/page.tsx`

```typescript
'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { apiPost } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface SchoolForm { name: string; code: string; subdomain: string }

export default function CreateSchoolPage() {
  const router = useRouter()
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SchoolForm>()

  const onSubmit = async (data: SchoolForm) => {
    setServerError(null)
    try {
      await apiPost('tenants', data)
      success('Sekolah berhasil ditambahkan!')
      router.push('/superadmin/schools')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Tambah Sekolah</h1>
      </div>
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nama Sekolah" placeholder="SMKN 1 Jakarta" error={errors.name?.message} {...register('name', { required: 'Wajib diisi' })} />
          <Input label="Kode" placeholder="smkn1jkt" error={errors.code?.message} {...register('code', { required: 'Wajib diisi', pattern: { value: /^[a-z0-9]+$/, message: 'Huruf kecil dan angka saja' } })} />
          <Input label="Subdomain" placeholder="smkn1" error={errors.subdomain?.message}
            {...register('subdomain', { required: 'Wajib diisi', pattern: { value: /^[a-z0-9-]+$/, message: 'Huruf kecil, angka, dan tanda hubung saja' } })}
          />
          <Alert variant="info" className="text-xs">Subdomain akan menjadi: <code>{'{subdomain}'}.exam.app</code></Alert>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>Simpan</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(superadmin)/schools/page.tsx`

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost, apiPatch } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useToast } from '@/hooks/use-toast'

interface Tenant {
  id: string; name: string; code: string; subdomain: string; isActive: boolean; createdAt: string
}

export default function SchoolsPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setTenants(await apiGet<Tenant[]>('tenants')) }
    catch (e) { toastError(parseErrorMessage(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const toggleActive = async (t: Tenant) => {
    try {
      await apiPatch(`tenants/${t.id}`, { isActive: !t.isActive })
      success(`${t.name} ${t.isActive ? 'dinonaktifkan' : 'diaktifkan'}`)
      void load()
    } catch (e) { toastError(parseErrorMessage(e)) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Sekolah</h1>
        <Button size="sm" onClick={() => router.push('/superadmin/schools/create')}>+ Tambah Sekolah</Button>
      </div>

      <Table
        data={tenants}
        keyExtractor={t => t.id}
        loading={loading}
        emptyText="Belum ada sekolah"
        zebra
        columns={[
          {
            key: 'name', header: 'Sekolah',
            render: t => (
              <div>
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-base-content/50 font-mono">{t.subdomain}.exam.app</p>
              </div>
            ),
          },
          { key: 'code', header: 'Kode', className: 'w-20', render: t => <code className="text-xs">{t.code}</code> },
          {
            key: 'status', header: 'Status', className: 'w-24',
            render: t => <Badge variant={t.isActive ? 'success' : 'error'} size="sm">{t.isActive ? 'Aktif' : 'Nonaktif'}</Badge>,
          },
          {
            key: 'actions', header: '', className: 'w-40',
            render: t => (
              <div className="flex gap-1 justify-end">
                <Button size="xs" variant="ghost" onClick={() => router.push(`/superadmin/schools/${t.id}/edit`)}>Edit</Button>
                <Button size="xs" variant={t.isActive ? 'error' : 'success'} outline onClick={() => void toggleActive(t)}>
                  {t.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

```

---

### File: `src/app/(superadmin)/schools/[id]/edit/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { apiGet, apiPatch } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/use-toast'

interface Tenant {
  id: string; name: string; code: string; subdomain: string; isActive: boolean
}
interface SchoolEditForm { name: string; code: string; subdomain: string }

export default function EditSchoolPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tenant, setTenant] = useState<Tenant | null>(null)

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } =
    useForm<SchoolEditForm>()

  const subdomain = watch('subdomain')

  useEffect(() => {
    apiGet<Tenant>(`tenants/${id}`)
      .then(t => {
        setTenant(t)
        reset({ name: t.name, code: t.code, subdomain: t.subdomain })
      })
      .catch(e => setLoadError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (data: SchoolEditForm) => {
    setServerError(null)
    try {
      await apiPatch(`tenants/${id}`, data)
      success('Data sekolah berhasil diperbarui!')
      router.push('/superadmin/schools')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  if (loading) return <Loading fullscreen text="Memuat data sekolah..." />
  if (loadError) return (
    <div className="mx-auto max-w-md pt-8">
      <Alert variant="error">{loadError}</Alert>
      <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Kembali</Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Sekolah</h1>
          {tenant && (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-base-content/60 font-mono">{tenant.subdomain}.exam.app</p>
              <Badge variant={tenant.isActive ? 'success' : 'error'} size="xs">
                {tenant.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Alert variant="warning" title="Perhatian">
        Mengubah subdomain akan mempengaruhi URL akses semua pengguna di sekolah ini.
        Pastikan sudah memberitahu administrator sekolah sebelum mengubah.
      </Alert>

      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Sekolah"
            placeholder="SMKN 1 Jakarta"
            error={errors.name?.message}
            {...register('name', { required: 'Nama sekolah wajib diisi' })}
          />
          <Input
            label="Kode"
            placeholder="smkn1jkt"
            error={errors.code?.message}
            hint="Huruf kecil dan angka saja, tidak bisa diubah setelah digunakan"
            {...register('code', {
              required: 'Kode wajib diisi',
              pattern: { value: /^[a-z0-9]+$/, message: 'Huruf kecil dan angka saja' },
            })}
          />
          <div>
            <Input
              label="Subdomain"
              placeholder="smkn1"
              error={errors.subdomain?.message}
              {...register('subdomain', {
                required: 'Subdomain wajib diisi',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Huruf kecil, angka, dan tanda hubung saja',
                },
              })}
            />
            {subdomain && (
              <p className="text-xs text-base-content/50 mt-1 ml-1">
                Preview URL: <code className="bg-base-200 px-1 rounded">{subdomain}.exam.app</code>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" loading={isSubmitting} disabled={!isDirty}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(superadmin)/settings/page.tsx`

```typescript
'use client'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
      <Alert variant="info">
        Pengaturan sistem dikelola melalui environment variables di server. Hubungi administrator teknis untuk mengubah konfigurasi.
      </Alert>
      <Card bordered>
        <div className="space-y-3 text-sm">
          {[
            ['Versi Aplikasi', 'v1.0.0'],
            ['Mode', process.env.NODE_ENV ?? 'production'],
            ['Enkripsi', 'AES-256-GCM'],
            ['Auth', 'JWT (15m) + Refresh (7d)'],
            ['Rate Limit', 'STRICT: 5/60s · MODERATE: 30/60s'],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between border-b border-base-200 pb-2 last:border-0">
              <span className="text-base-content/60">{key}</span>
              <code className="text-xs bg-base-200 px-2 py-0.5 rounded">{val}</code>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

```

---

### File: `src/app/(superadmin)/users/page.tsx`

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost, apiPatch } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { User } from '@/types/user'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils/format'

const ROLE_VARIANT: Record<string, 'primary' | 'secondary' | 'accent' | 'info' | 'warning' | 'success'> = {
  SUPERADMIN: 'primary', ADMIN: 'secondary', TEACHER: 'accent',
  OPERATOR: 'info', SUPERVISOR: 'warning', STUDENT: 'success',
}

export default function UsersPage() {
  const { success, error: toastError } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (role) params.set('role', role)
      params.set('limit', '50')
      const res = await apiGet<{ data: User[] }>(`users?${params}`)
      setUsers(res.data)
    } catch (e) { toastError(parseErrorMessage(e)) }
    finally { setLoading(false) }
  }, [search, role])

  useEffect(() => { void load() }, [load])

  const toggleActive = async (u: User) => {
    try {
      await apiPatch(`users/${u.id}`, { isActive: !u.isActive })
      success(`${u.username} ${u.isActive ? 'dinonaktifkan' : 'diaktifkan'}`)
      void load()
    } catch (e) { toastError(parseErrorMessage(e)) }
  }

  const ROLES = [
    { value: '', label: 'Semua Role' },
    ...['SUPERADMIN', 'ADMIN', 'TEACHER', 'OPERATOR', 'SUPERVISOR', 'STUDENT'].map(r => ({ value: r, label: r })),
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <Input placeholder="Cari username/email..." value={search} onChange={e => setSearch(e.target.value)} inputSize="sm" />
        </div>
        <div className="w-36">
          <Select options={ROLES} value={role} onChange={e => setRole(e.target.value)} />
        </div>
      </div>

      <Table
        data={users}
        keyExtractor={u => u.id}
        loading={loading}
        emptyText="Tidak ada pengguna"
        zebra
        columns={[
          {
            key: 'user', header: 'Pengguna',
            render: u => (
              <div>
                <p className="font-medium text-sm">{u.username}</p>
                <p className="text-xs text-base-content/50">{u.email}</p>
              </div>
            ),
          },
          { key: 'role', header: 'Role', className: 'w-28', render: u => <Badge variant={ROLE_VARIANT[u.role] ?? 'neutral'} size="sm">{u.role}</Badge> },
          { key: 'status', header: 'Status', className: 'w-24', render: u => <Badge variant={u.isActive ? 'success' : 'error'} size="xs">{u.isActive ? 'Aktif' : 'Nonaktif'}</Badge> },
          { key: 'created', header: 'Bergabung', className: 'w-32', render: u => <span className="text-xs text-base-content/60">{formatDate(u.createdAt)}</span> },
          {
            key: 'actions', header: '', className: 'w-32',
            render: u => (
              <Button size="xs" variant={u.isActive ? 'error' : 'success'} outline onClick={() => void toggleActive(u)}>
                {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
            ),
          },
        ]}
      />
    </div>
  )
}

```

---

### File: `src/components/analytics/DashboardStats.tsx`

```typescript
import { Card } from '@/components/ui/Card'
import { clsx } from 'clsx'

interface StatCard {
  label: string
  value: string | number
  delta?: string
  icon?: string
  variant?: 'primary' | 'success' | 'warning' | 'error'
}

interface DashboardStatsProps {
  stats: StatCard[]
  loading?: boolean
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <Card key={i} compact>
          <div className="flex items-start justify-between">
            <div>
              {loading
                ? <div className="h-8 w-16 animate-pulse rounded bg-base-300" />
                : <p className={clsx('text-3xl font-bold tabular-nums', s.variant && `text-${s.variant}`)}>{s.value}</p>
              }
              <p className="mt-1 text-xs text-base-content/60">{s.label}</p>
              {s.delta && <p className="mt-0.5 text-xs text-success">{s.delta}</p>}
            </div>
            {s.icon && <span className="text-2xl opacity-60">{s.icon}</span>}
          </div>
        </Card>
      ))}
    </div>
  )
}

```

---

### File: `src/components/analytics/ExamStatistics.tsx`

```typescript
'use client'
import { Bar } from 'react-chartjs-2' // NOTE: sudah ada chart.js di package.json
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js'
import { useUiStore } from '@/stores/ui.store'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ExamStatisticsProps {
  labels: string[]
  scores: number[]
  title?: string
}

export function ExamStatistics({ labels, scores, title = 'Distribusi Nilai' }: ExamStatisticsProps) {
  const { theme } = useUiStore()
  const textColor = theme === 'dark' ? '#d1d5db' : '#374151'

  const data = {
    labels,
    datasets: [{
      label: 'Jumlah Siswa',
      data: scores,
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  return (
    <div>
      <h3 className="mb-3 font-semibold text-sm">{title}</h3>
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { ticks: { color: textColor, precision: 0 }, beginAtZero: true },
          },
        }}
      />
    </div>
  )
}

```

---

### File: `src/components/analytics/ItemAnalysisChart.tsx`

```typescript
'use client'
import { Bar } from 'react-chartjs-2'
import { useUiStore } from '@/stores/ui.store'

interface ItemData {
  questionId: string
  label: string
  difficulty: number  // 0–1 (proporsi yang salah)
  discrimination: number  // -1 to 1
}

interface ItemAnalysisChartProps {
  items: ItemData[]
}

export function ItemAnalysisChart({ items }: ItemAnalysisChartProps) {
  const { theme } = useUiStore()
  const tc = theme === 'dark' ? '#d1d5db' : '#374151'

  const data = {
    labels: items.map(i => i.label),
    datasets: [
      {
        label: 'Tingkat Kesulitan',
        data: items.map(i => +(i.difficulty * 100).toFixed(1)),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: 'Daya Pembeda',
        data: items.map(i => +(i.discrimination * 100).toFixed(1)),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  }

  return (
    <div>
      <h3 className="mb-3 font-semibold text-sm">Analisis Butir Soal</h3>
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top', labels: { color: tc, font: { size: 11 } } },
          },
          scales: {
            x: { ticks: { color: tc, font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: tc }, beginAtZero: true, max: 100, title: { display: true, text: '%', color: tc } },
          },
        }}
      />
    </div>
  )
}

```

---

### File: `src/components/analytics/StudentProgress.tsx`

```typescript
import { clsx } from 'clsx'
import { Badge } from '@/components/ui/Badge'

interface StudentProgressData {
  userId: string
  username: string
  totalExams: number
  avgScore: number
  lastExamAt: string | null
  trend: 'up' | 'down' | 'stable'
}

interface StudentProgressProps {
  students: StudentProgressData[]
}

export function StudentProgress({ students }: StudentProgressProps) {
  const TREND_ICON = { up: '↑', down: '↓', stable: '→' }
  const TREND_CLASS = { up: 'text-success', down: 'text-error', stable: 'text-base-content/40' }

  return (
    <div className="space-y-2">
      {students.map(s => (
        <div key={s.userId} className="flex items-center justify-between gap-3 rounded-box bg-base-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="avatar placeholder">
              <div className="w-7 rounded-full bg-primary text-primary-content">
                <span className="text-xs">{s.username[0]?.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{s.username}</p>
              <p className="text-xs text-base-content/50">{s.totalExams} ujian</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className={clsx('text-sm font-bold tabular-nums', s.avgScore >= 75 ? 'text-success' : s.avgScore >= 50 ? 'text-warning' : 'text-error')}>
                {s.avgScore.toFixed(1)}
              </p>
              <p className="text-xs text-base-content/40">rata-rata</p>
            </div>
            <span className={clsx('text-lg font-bold', TREND_CLASS[s.trend])}>
              {TREND_ICON[s.trend]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

```

---

### File: `src/components/auth/DeviceLockWarning.tsx`

```typescript
'use client'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export function DeviceLockWarning() {
  const router = useRouter()
  return (
    <div className="mt-4 space-y-4">
      <Alert variant="error" title="Perangkat Dikunci">
        Perangkat ini telah dikunci oleh administrator. Silakan hubungi pengawas atau operator
        untuk membuka kunci perangkat Anda.
      </Alert>
      <div className="rounded-box bg-base-200 p-4 text-sm space-y-2">
        <p className="font-medium">Langkah yang bisa dilakukan:</p>
        <ol className="list-decimal list-inside space-y-1 text-base-content/70">
          <li>Hubungi operator atau pengawas ujian</li>
          <li>Berikan informasi username Anda</li>
          <li>Tunggu konfirmasi unlock dari admin</li>
          <li>Coba login kembali</li>
        </ol>
      </div>
      <Button variant="ghost" className="w-full" onClick={() => router.refresh()}>
        Coba Login Lagi
      </Button>
    </div>
  )
}

```

---

### File: `src/components/auth/LoginForm.tsx`

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form' // NOTE: tambahkan react-hook-form ke package.json
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/schemas/auth.schema'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { generateDeviceFingerprint } from '@/lib/crypto/checksum'
import { parseErrorMessage } from '@/lib/utils/error'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useDeviceWarnings } from '@/hooks/use-device-warnings'
import { DeviceLockWarning } from './DeviceLockWarning'

const ROLE_DASHBOARD: Record<string, string> = {
  SUPERADMIN: '/superadmin/dashboard',
  ADMIN: '/superadmin/dashboard',
  TEACHER: '/guru/dashboard',
  OPERATOR: '/operator/dashboard',
  SUPERVISOR: '/pengawas/dashboard',
  STUDENT: '/siswa/dashboard',
}

export function LoginForm() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { warnings, isOldBrowser } = useDeviceWarnings()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    try {
      const fingerprint = await generateDeviceFingerprint()
      const { user, accessToken } = await authApi.login({ ...data, fingerprint })
      setAuth(user, accessToken)
      router.replace(ROLE_DASHBOARD[user.role] ?? '/')
    } catch (e) {
      const msg = parseErrorMessage(e)
      // Cek apakah device locked
      if (msg.toLowerCase().includes('device') && msg.toLowerCase().includes('lock')) {
        setServerError('__DEVICE_LOCKED__')
      } else {
        setServerError(msg)
      }
    }
  }

  if (serverError === '__DEVICE_LOCKED__') return <DeviceLockWarning />

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
      {/* Device warnings */}
      {warnings.map((w, i) => (
        <Alert key={i} variant="warning">{w}</Alert>
      ))}

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Input
        label="Username"
        placeholder="Masukkan username"
        autoComplete="username"
        autoFocus
        error={errors.username?.message}
        disabled={isOldBrowser}
        {...register('username')}
      />

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium">Password</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan password"
            autoComplete="current-password"
            className={`input input-bordered w-full pr-12 ${errors.password ? 'input-error' : ''}`}
            disabled={isOldBrowser}
            {...register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>
        {errors.password && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.password.message}</span>
          </label>
        )}
      </div>

      <Button
        type="submit"
        wide
        loading={isSubmitting}
        disabled={isOldBrowser}
        className="mt-2 w-full"
      >
        Masuk
      </Button>

      {isOldBrowser && (
        <p className="text-center text-xs text-error">
          Browser tidak didukung. Gunakan Chrome 80+ atau Firefox 90+.
        </p>
      )}
    </form>
  )
}

```

---

### File: `src/components/exam/ActivityLogger.tsx`

```typescript
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

```

---

### File: `src/components/exam/AutoSaveIndicator.tsx`

```typescript
'use client'
import { clsx } from 'clsx'
import { useSyncStatus } from '@/hooks/use-sync-status'

export function AutoSaveIndicator() {
  const { isSyncing, lastSyncAt, lastError, pendingCount } = useSyncStatus()

  const lastSyncFormatted = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {isSyncing ? (
        <>
          <span className="loading loading-spinner loading-xs text-warning" />
          <span className="text-warning">Menyimpan...</span>
        </>
      ) : lastError ? (
        <>
          <span className="h-2 w-2 rounded-full bg-error" />
          <span className="text-error">Gagal simpan</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
          <span className="text-warning">{pendingCount} belum tersimpan</span>
        </>
      ) : lastSyncFormatted ? (
        <>
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-base-content/50">Tersimpan {lastSyncFormatted}</span>
        </>
      ) : (
        <>
          <span className="h-2 w-2 rounded-full bg-base-300" />
          <span className="text-base-content/40">Auto-save aktif</span>
        </>
      )}
    </div>
  )
}

```

---

### File: `src/components/exam/ExamInstructions.tsx`

```typescript
import type { ExamPackageSettings } from '@/types/exam'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { formatDuration } from '@/lib/exam/timer'

interface ExamInstructionsProps {
  title: string
  settings: ExamPackageSettings
  questionCount: number
  totalPoints: number
  onStart: () => void
  loading?: boolean
}

export function ExamInstructions({ title, settings, questionCount, totalPoints, onStart, loading }: ExamInstructionsProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Soal', value: questionCount },
            { label: 'Durasi', value: formatDuration(settings.duration * 60) },
            { label: 'Total Poin', value: totalPoints },
            { label: 'Maks. Percobaan', value: settings.maxAttempts },
          ].map(item => (
            <div key={item.label} className="rounded-box bg-base-200 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{item.value}</p>
              <p className="text-xs text-base-content/60">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Alert variant="warning" title="Perhatian">
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
          <li>Pastikan koneksi internet stabil sebelum mulai</li>
          <li>Jangan tutup tab atau browser selama ujian berlangsung</li>
          <li>Jawaban tersimpan otomatis setiap ada perubahan</li>
          {settings.shuffleQuestions && <li>Urutan soal diacak secara otomatis</li>}
          {settings.shuffleOptions && <li>Urutan pilihan jawaban diacak</li>}
        </ul>
      </Alert>

      <Button wide className="w-full" onClick={onStart} loading={loading}>
        Mulai Ujian
      </Button>
    </div>
  )
}

```

---

### File: `src/components/exam/ExamTimer.tsx`

```typescript
'use client'
import { clsx } from 'clsx'
import { selectFormattedTime, selectIsWarning, selectProgressPercent } from '@/stores/timer.store'
import { useTimerStore } from '@/stores/timer.store'

interface ExamTimerProps {
  onExpire?: () => void
  className?: string
}

export function ExamTimer({ className }: ExamTimerProps) {
  const store = useTimerStore()
  const formatted = selectFormattedTime(store)
  const isWarning = selectIsWarning(store)
  const progress = selectProgressPercent(store)

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      {/* Radial progress */}
      <div
        className={clsx(
          'radial-progress text-sm font-mono font-bold transition-colors',
          store.isExpired ? 'text-error' : isWarning ? 'text-warning animate-pulse' : 'text-primary',
        )}
        style={{ '--value': progress, '--size': '3.5rem', '--thickness': '4px' } as React.CSSProperties}
        role="progressbar"
        aria-label={`Sisa waktu: ${formatted}`}
      >
        <span className="text-xs">{formatted}</span>
      </div>

      <div className="hidden sm:block">
        <p className="text-xs text-base-content/50">Sisa Waktu</p>
        <p className={clsx(
          'font-mono font-bold tabular-nums',
          store.isExpired ? 'text-error' : isWarning ? 'text-warning' : 'text-base-content',
        )}>
          {formatted}
        </p>
      </div>
    </div>
  )
}

```

---

### File: `src/components/exam/MediaPlayer.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { getMediaUrl } from '@/lib/media/player'
import { parseErrorMessage } from '@/lib/utils/error'
import { Loading } from '@/components/ui/Loading'

interface MediaPlayerProps {
  objectKey: string
  type?: 'audio' | 'video' | 'image'
  className?: string
  autoPlay?: boolean
}

export function MediaPlayer({ objectKey, type = 'audio', className, autoPlay }: MediaPlayerProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMediaUrl(objectKey)
      .then(setUrl)
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [objectKey])

  if (loading) return <Loading size="xs" />
  if (error) return <p className="text-xs text-error">Gagal memuat media: {error}</p>
  if (!url) return null

  if (type === 'image') return (
    <img src={url} alt="Media soal" className={className ?? 'max-h-64 rounded-box object-contain'} />
  )
  if (type === 'video') return (
    <video src={url} controls autoPlay={autoPlay} className={className ?? 'w-full max-h-48 rounded-box'} />
  )
  return (
    <audio src={url} controls autoPlay={autoPlay} className={className ?? 'w-full h-10'} />
  )
}

```

---

### File: `src/components/exam/MediaRecorder.tsx`

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useMediaRecorder } from '@/hooks/use-media-recorder'
import { saveMediaBlob } from '@/lib/db/queries'
import { uploadInChunks } from '@/lib/media/chunked-upload'
import { useToast } from '@/hooks/use-toast'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatDuration } from '@/lib/exam/timer'
import { clsx } from 'clsx'
import type { ID } from '@/types/common'
import type { RecordingResult } from '@/types/media'

interface ExamMediaRecorderProps {
  questionId: ID
  attemptId: ID
  sessionId: ID
  mode?: 'audio' | 'video'
  onUploaded?: (objectKey: string) => void
  disabled?: boolean
}

export function ExamMediaRecorder({
  questionId, attemptId, sessionId, mode = 'audio', onUploaded, disabled,
}: ExamMediaRecorderProps) {
  const { success, error: toastError } = useToast()
  const [elapsed, setElapsed] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [savedBlob, setSavedBlob] = useState<Blob | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  const MAX_SEC = Number(process.env.NEXT_PUBLIC_MAX_RECORDING_DURATION ?? 300)

  const { isRecording, error, start, stop } = useMediaRecorder({
    mimeType: mode === 'audio' ? 'audio/webm;codecs=opus' : 'video/webm;codecs=vp9,opus',
    maxDurationMs: MAX_SEC * 1000,
    onStop: async (result: RecordingResult) => {
      setSavedBlob(result.blob)
      setBlobUrl(URL.createObjectURL(result.blob))
      // Simpan ke IndexedDB dulu (offline-first)
      await saveMediaBlob({
        questionId, attemptId, sessionId,
        mimeType: result.mimeType,
        blob: result.blob,
        duration: result.duration,
        size: result.size,
        recordedAt: Date.now(),
        uploaded: false,
      })
      // Langsung coba upload jika online
      if (navigator.onLine) void handleUpload(result.blob)
    },
  })

  // Timer
  useEffect(() => {
    if (!isRecording) { setElapsed(0); return }
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [isRecording])

  const handleUpload = async (blob: Blob) => {
    setUploading(true)
    setUploadPct(0)
    try {
      const key = await uploadInChunks(blob, {
        questionId, attemptId,
        onProgress: setUploadPct,
      })
      success('Rekaman berhasil diunggah')
      onUploaded?.(key)
    } catch (e) {
      toastError(`Upload gagal: ${parseErrorMessage(e)}. Akan dicoba ulang saat online.`)
    } finally {
      setUploading(false)
    }
  }

  const pct = Math.round((elapsed / MAX_SEC) * 100)
  const isWarning = elapsed >= MAX_SEC * 0.8

  return (
    <div className="space-y-3">
      {error && (
        <div className="alert alert-error text-sm">
          <span>⚠ {error}</span>
        </div>
      )}

      {/* Recording UI */}
      <div className="flex items-center gap-4 rounded-box border border-base-300 bg-base-200 p-4">
        {/* Status dot */}
        <div className={clsx(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl',
          isRecording ? 'bg-error/10' : 'bg-base-300',
        )}>
          {isRecording
            ? <span className="animate-pulse">🔴</span>
            : mode === 'audio' ? '🎙' : '🎥'}
        </div>

        <div className="flex-1 min-w-0">
          {isRecording ? (
            <>
              <p className={clsx('text-sm font-medium', isWarning && 'text-warning')}>
                Merekam... {formatDuration(elapsed)} / {formatDuration(MAX_SEC)}
              </p>
              <progress
                className={clsx('progress w-full mt-1', isWarning ? 'progress-warning' : 'progress-error')}
                value={elapsed}
                max={MAX_SEC}
              />
            </>
          ) : uploading ? (
            <>
              <p className="text-sm font-medium text-primary">Mengunggah rekaman... {uploadPct}%</p>
              <progress className="progress progress-primary w-full mt-1" value={uploadPct} max={100} />
            </>
          ) : savedBlob ? (
            <p className="text-sm text-success font-medium">✓ Rekaman tersimpan</p>
          ) : (
            <p className="text-sm text-base-content/60">
              {mode === 'audio' ? 'Rekam jawaban audio' : 'Rekam jawaban video'} · Maks {formatDuration(MAX_SEC)}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 shrink-0">
          {isRecording ? (
            <button onClick={stop} className="btn btn-error btn-sm gap-1">
              <span>■</span> Stop
            </button>
          ) : (
            <button
              onClick={() => void start()}
              disabled={disabled || uploading}
              className="btn btn-primary btn-sm gap-1"
            >
              {mode === 'audio' ? '🎙' : '🎥'} Rekam
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      {blobUrl && !isRecording && (
        <div className="rounded-box border border-base-300 bg-base-100 p-3">
          <p className="text-xs text-base-content/50 mb-2">Preview rekaman:</p>
          {mode === 'audio'
            ? <audio src={blobUrl} controls className="w-full h-10" />
            : <video src={blobUrl} controls className="w-full max-h-48 rounded" />
          }
          {!uploading && navigator.onLine && (
            <button
              className="btn btn-xs btn-outline btn-primary mt-2"
              onClick={() => savedBlob && void handleUpload(savedBlob)}
            >
              🔄 Upload Ulang
            </button>
          )}
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/components/exam/ProgressBar.tsx`

```typescript
interface ProgressBarProps {
  answered: number
  total: number
  className?: string
}

export function ProgressBar({ answered, total, className }: { answered: number; total: number; className?: string }) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0
  return (
    <div className={className}>
      <div className="flex justify-between text-xs text-base-content/60 mb-1">
        <span>{answered}/{total} soal dijawab</span>
        <span>{pct}%</span>
      </div>
      <progress className="progress progress-primary w-full" value={answered} max={total} />
    </div>
  )
}

```

---

### File: `src/components/exam/QuestionNavigation.tsx`

```typescript
'use client'
import { clsx } from 'clsx'
import { useExamStore } from '@/stores/exam.store'
import { useAnswerStore } from '@/stores/answer.store'

export function QuestionNavigation() {
  const { activePackage, questionOrder, currentQuestionIndex, goToQuestion } = useExamStore()
  const { answers, } = useAnswerStore()

  if (!activePackage) return null

  return (
    <div className="flex flex-wrap gap-1.5 p-3">
      {questionOrder.map((id, idx) => {
        const isAnswered = answers[id] !== undefined
        const isCurrent = idx === currentQuestionIndex
        return (
          <button
            key={id}
            onClick={() => goToQuestion(idx)}
            className={clsx(
              'btn btn-square btn-xs font-mono text-xs',
              isCurrent && 'btn-primary',
              !isCurrent && isAnswered && 'btn-success btn-outline',
              !isCurrent && !isAnswered && 'btn-ghost border border-base-300',
            )}
            aria-label={`Soal ${idx + 1}${isAnswered ? ' (sudah dijawab)' : ''}`}
          >
            {idx + 1}
          </button>
        )
      })}
    </div>
  )
}

```

---

### File: `src/components/exam/question-types/Essay.tsx`

```typescript
'use client'
import { useRef } from 'react'

interface EssayProps {
  value?: string
  onChange: (val: string) => void
  disabled?: boolean
  minRows?: number
  maxLength?: number
}

export function Essay({ value = '', onChange, disabled, minRows = 6, maxLength = 5000 }: EssayProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Auto-resize
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > maxLength) return
    onChange(e.target.value)
    // Auto-resize
    const el = ref.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }

  return (
    <div className="form-control">
      <textarea
        ref={ref}
        className="textarea textarea-bordered w-full resize-none leading-relaxed"
        rows={minRows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Tuliskan jawaban Anda di sini..."
        style={{ minHeight: `${minRows * 1.75}rem` }}
      />
      <label className="label">
        <span className="label-text-alt text-base-content/40">
          {value.length}/{maxLength} karakter
        </span>
        {value.length > maxLength * 0.9 && (
          <span className="label-text-alt text-warning">Mendekati batas</span>
        )}
      </label>
    </div>
  )
}

```

---

### File: `src/components/exam/question-types/Matching.tsx`

```typescript
'use client'
import { clsx } from 'clsx'
import type { MatchingOption } from '@/types/question'

interface MatchingProps {
  options: MatchingOption
  value?: Record<string, string>
  onChange: (val: Record<string, string>) => void
  disabled?: boolean
}

export function Matching({ options, value = {}, onChange, disabled }: MatchingProps) {
  const handleSelect = (leftKey: string, rightKey: string) => {
    const current = value[leftKey]
    // Toggle: klik ulang rightKey yang sama = hapus pilihan
    const next = { ...value, [leftKey]: current === rightKey ? '' : rightKey }
    onChange(next)
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th>Pernyataan</th>
            {options.right.map(r => (
              <th key={r.key} className="text-center">{r.key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {options.left.map(l => (
            <tr key={l.key} className="hover">
              <td className="text-sm">{l.text}</td>
              {options.right.map(r => (
                <td key={r.key} className="text-center">
                  <input
                    type="radio"
                    name={`match-${l.key}`}
                    className="radio radio-primary radio-sm"
                    checked={value[l.key] === r.key}
                    onChange={() => !disabled && handleSelect(l.key, r.key)}
                    disabled={disabled}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            {options.right.map(r => (
              <td key={r.key} className="text-center text-xs text-base-content/60">{r.text}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

```

---

### File: `src/components/exam/question-types/MultipleChoice.tsx`

```typescript
'use client'
import { clsx } from 'clsx'
import type { MultipleChoiceOption } from '@/types/question'

interface MultipleChoiceProps {
  options: MultipleChoiceOption[]
  value?: string
  onChange: (key: string) => void
  disabled?: boolean
}

export function MultipleChoice({ options, value, onChange, disabled }: MultipleChoiceProps) {
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const selected = value === opt.key
        return (
          <label
            key={opt.key}
            className={clsx(
              'flex cursor-pointer items-start gap-3 rounded-box border p-3 transition-colors',
              selected
                ? 'border-primary bg-primary/5'
                : 'border-base-300 hover:border-primary/40 hover:bg-base-200/50',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <input
              type="radio"
              name="mc-answer"
              className="radio radio-primary mt-0.5 shrink-0"
              checked={selected}
              onChange={() => !disabled && onChange(opt.key)}
              disabled={disabled}
            />
            <div className="flex items-start gap-2">
              <span className={clsx(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase',
                selected ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/60',
              )}>
                {opt.key}
              </span>
              <span className="text-sm leading-relaxed">{opt.text}</span>
            </div>
          </label>
        )
      })}
    </div>
  )
}

```

---

### File: `src/components/exam/question-types/MultipleChoiceComplex.tsx`

```typescript
'use client'
import { clsx } from 'clsx'
import type { MultipleChoiceOption } from '@/types/question'

interface MultipleChoiceComplexProps {
  options: MultipleChoiceOption[]
  value?: string[]
  onChange: (keys: string[]) => void
  disabled?: boolean
}

export function MultipleChoiceComplex({ options, value = [], onChange, disabled }: MultipleChoiceComplexProps) {
  const toggle = (key: string) => {
    const next = value.includes(key) ? value.filter(k => k !== key) : [...value, key]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-base-content/50 mb-3">Pilih satu atau lebih jawaban yang benar</p>
      {options.map(opt => {
        const checked = value.includes(opt.key)
        return (
          <label
            key={opt.key}
            className={clsx(
              'flex cursor-pointer items-start gap-3 rounded-box border p-3 transition-colors',
              checked ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/40 hover:bg-base-200/50',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <input
              type="checkbox"
              className="checkbox checkbox-primary mt-0.5 shrink-0"
              checked={checked}
              onChange={() => !disabled && toggle(opt.key)}
              disabled={disabled}
            />
            <div className="flex items-start gap-2">
              <span className={clsx(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase',
                checked ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/60',
              )}>
                {opt.key}
              </span>
              <span className="text-sm leading-relaxed">{opt.text}</span>
            </div>
          </label>
        )
      })}
    </div>
  )
}

```

---

### File: `src/components/exam/question-types/ShortAnswer.tsx`

```typescript
'use client'

interface ShortAnswerProps {
  value?: string
  onChange: (val: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ShortAnswer({ value = '', onChange, disabled, placeholder = 'Ketik jawaban singkat...' }: ShortAnswerProps) {
  return (
    <div className="form-control">
      <input
        type="text"
        className="input input-bordered w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={500}
      />
      <label className="label">
        <span className="label-text-alt text-base-content/40">{value.length}/500 karakter</span>
      </label>
    </div>
  )
}

```

---

### File: `src/components/exam/question-types/TrueFalse.tsx`

```typescript
'use client'
import { clsx } from 'clsx'

interface TrueFalseProps {
  value?: string
  onChange: (val: 'true' | 'false') => void
  disabled?: boolean
}

export function TrueFalse({ value, onChange, disabled }: TrueFalseProps) {
  return (
    <div className="flex gap-4">
      {(['true', 'false'] as const).map(opt => {
        const selected = value === opt
        const label = opt === 'true' ? 'Benar' : 'Salah'
        const emoji = opt === 'true' ? '✓' : '✕'
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !disabled && onChange(opt)}
            disabled={disabled}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-box border-2 py-4 text-sm font-semibold transition-all',
              selected && opt === 'true' && 'border-success bg-success/10 text-success',
              selected && opt === 'false' && 'border-error bg-error/10 text-error',
              !selected && 'border-base-300 hover:border-base-content/30',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <span className="text-xl">{emoji}</span>
            {label}
          </button>
        )
      })}
    </div>
  )
}

```

---

### File: `src/components/grading/EssaySimilarityBadge.tsx`

```typescript
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'

export function EssaySimilarityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const variant = pct >= 80 ? 'error' : pct >= 50 ? 'warning' : 'success'
  const label = pct >= 80 ? 'Sangat Mirip' : pct >= 50 ? 'Mirip' : 'Unik'

  return (
    <Tooltip tip={`Kemiripan dengan jawaban lain: ${pct}%`}>
      <Badge variant={variant} size="xs" outline>
        {label} {pct}%
      </Badge>
    </Tooltip>
  )
}

```

---

### File: `src/components/grading/GradingRubric.tsx`

```typescript
import { Card } from '@/components/ui/Card'

interface RubricLevel {
  score: number
  label: string
  description: string
}

interface GradingRubricProps {
  maxScore: number
}

// Rubrik otomatis berdasarkan maxScore
function generateRubric(maxScore: number): RubricLevel[] {
  return [
    { score: maxScore, label: 'Sempurna', description: 'Jawaban lengkap, tepat, dan menunjukkan pemahaman mendalam.' },
    { score: Math.round(maxScore * 0.75), label: 'Baik', description: 'Jawaban sebagian besar benar dengan sedikit kekurangan.' },
    { score: Math.round(maxScore * 0.5), label: 'Cukup', description: 'Jawaban menunjukkan pemahaman dasar namun banyak yang kurang.' },
    { score: Math.round(maxScore * 0.25), label: 'Kurang', description: 'Jawaban tidak relevan atau sangat tidak lengkap.' },
    { score: 0, label: 'Tidak Ada', description: 'Tidak ada jawaban atau jawaban tidak bisa dinilai.' },
  ]
}

export function GradingRubric({ maxScore }: GradingRubricProps) {
  const rubric = generateRubric(maxScore)
  return (
    <Card compact>
      <h3 className="font-semibold text-sm mb-3">Panduan Penilaian</h3>
      <div className="space-y-2">
        {rubric.map(level => (
          <div key={level.score} className="flex items-start gap-3 text-sm">
            <span className="w-8 shrink-0 font-mono font-bold text-primary">{level.score}</span>
            <div>
              <span className="font-medium">{level.label}</span>
              <span className="text-base-content/50"> — {level.description}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

```

---

### File: `src/components/grading/ManualGradingCard.tsx`

```typescript
'use client'
import { useState } from 'react'
import { gradingApi } from '@/lib/api/grading.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { useToast } from '@/hooks/use-toast'
import type { ManualGradingItem } from '@/types/answer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EssaySimilarityBadge } from './EssaySimilarityBadge'

interface ManualGradingCardProps {
  item: ManualGradingItem
  onGraded: () => void
}

export function ManualGradingCard({ item, onGraded }: ManualGradingCardProps) {
  const { success, error: toastError } = useToast()
  const [score, setScore] = useState<number>(0)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (score < 0 || score > item.maxScore) {
      toastError(`Nilai harus antara 0–${item.maxScore}`)
      return
    }
    setSubmitting(true)
    try {
      await gradingApi.gradeAnswer({ answerId: item.answerId, score, feedback: feedback.trim() || undefined })
      success(`Jawaban ${item.studentName} berhasil dinilai`)
      onGraded()
    } catch (e) {
      toastError(parseErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  const answerText = typeof item.answerValue === 'string' ? item.answerValue : JSON.stringify(item.answerValue)

  return (
    <Card bordered className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="avatar placeholder">
            <div className="w-8 rounded-full bg-primary text-primary-content">
              <span className="text-xs">{item.studentName[0]?.toUpperCase()}</span>
            </div>
          </div>
          <span className="font-medium text-sm">{item.studentName}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.similarityScore !== undefined && (
            <EssaySimilarityBadge score={item.similarityScore} />
          )}
          <Badge variant="warning" size="sm">Perlu Dinilai</Badge>
          <span className="text-xs text-base-content/50">Max: {item.maxScore} poin</span>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-box bg-base-200 p-3">
        <p className="text-xs font-medium text-base-content/50 mb-1">Pertanyaan</p>
        <p className="text-sm leading-relaxed">{item.questionContent}</p>
      </div>

      {/* Answer */}
      <div>
        <p className="text-xs font-medium text-base-content/50 mb-1">Jawaban Siswa</p>
        <div className="rounded-box border border-base-300 bg-base-100 p-3 min-h-[4rem]">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{answerText || <span className="italic text-base-content/30">Tidak ada jawaban</span>}</p>
        </div>
        {item.mediaUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.mediaUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="btn btn-xs btn-outline gap-1">
                📎 Media {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Score input */}
      <div className="flex items-end gap-3">
        <div className="form-control flex-1">
          <label className="label">
            <span className="label-text font-medium">Nilai (0 – {item.maxScore})</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={item.maxScore}
              step={0.5}
              value={score}
              onChange={e => setScore(Number(e.target.value))}
              className="range range-primary flex-1"
              disabled={submitting}
            />
            <input
              type="number"
              min={0}
              max={item.maxScore}
              step={0.5}
              value={score}
              onChange={e => setScore(Math.min(item.maxScore, Math.max(0, Number(e.target.value))))}
              className="input input-bordered input-sm w-20 text-center font-mono font-bold"
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Komentar / Feedback <span className="text-base-content/40">(opsional)</span></span>
        </label>
        <textarea
          className="textarea textarea-bordered resize-none"
          rows={2}
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Berikan komentar untuk siswa..."
          disabled={submitting}
        />
      </div>

      <Button onClick={handleSubmit} loading={submitting} className="w-full">
        Simpan Nilai
      </Button>
    </Card>
  )
}

```

---

### File: `src/components/layout/Footer.tsx`

```typescript
export function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-200 px-6 py-3">
      <p className="text-center text-xs text-base-content/50">
        © {new Date().getFullYear()} Sistem Ujian · Offline-First · v1.0
      </p>
    </footer>
  )
}

```

---

### File: `src/components/layout/Header.tsx`

```typescript
'use client'
import { useAuth } from '@/hooks/use-auth'
import { useUiStore } from '@/stores/ui.store'
import { useSyncStatus } from '@/hooks/use-sync-status'
import { clsx } from 'clsx'

export function Header() {
  const { user, logout } = useAuth()
  const { toggleSidebar, theme, setTheme } = useUiStore()
  const { isOnline, pendingCount } = useSyncStatus()

  return (
    <header className="flex h-16 items-center justify-between border-b border-base-300 bg-base-100 px-4">
      {/* Hamburger */}
      <button className="btn btn-ghost btn-sm btn-square" onClick={toggleSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {/* Online/offline indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className={clsx(
            'h-2 w-2 rounded-full',
            isOnline ? 'bg-success' : 'bg-error animate-pulse',
          )} />
          <span className="hidden text-base-content/60 sm:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Pending sync count */}
        {pendingCount > 0 && (
          <div className="badge badge-warning badge-sm gap-1">
            <span className="loading loading-spinner loading-xs" />
            {pendingCount} pending
          </div>
        )}

        {/* Theme toggle */}
        <button
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title="Toggle tema"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* User menu */}
        {user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
              <div className="avatar placeholder">
                <div className="w-7 rounded-full bg-primary text-primary-content">
                  <span className="text-xs">{user.username[0]?.toUpperCase()}</span>
                </div>
              </div>
              <span className="hidden text-sm sm:inline">{user.username}</span>
            </div>
            <ul tabIndex={0} className="menu dropdown-content z-50 mt-2 w-48 rounded-box bg-base-100 p-2 shadow-lg border border-base-300">
              <li className="menu-title text-xs">{user.email}</li>
              <li><a href="/siswa/profile">Profil Saya</a></li>
              <li><button onClick={logout} className="text-error">Keluar</button></li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}

```

---

### File: `src/components/layout/MainLayout.tsx`

```typescript
'use client'
import { useAuth } from '@/hooks/use-auth'
import { Loading } from '@/components/ui/Loading'
import { ToastContainer } from '@/components/ui/Toast'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import type { UserRole } from '@/types/common'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface MainLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  role: UserRole
}

export function MainLayout({ children, navItems, role }: MainLayoutProps) {
  const { isLoading } = useAuth()

  if (isLoading) return <Loading fullscreen text="Memuat sesi..." />

  return (
    <div className="flex h-screen overflow-hidden bg-base-100">
      {/* Sidebar */}
      <Sidebar navItems={navItems} role={role} />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </div>

      <ToastContainer />
    </div>
  )
}

```

---

### File: `src/components/layout/Sidebar.tsx`

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { useUiStore } from '@/stores/ui.store'
import type { UserRole } from '@/types/common'

interface NavItem {
  href: string
  label: string
  icon: string
}

const ICONS: Record<string, string> = {
  grid: '⊞', 'file-text': '📄', 'book-open': '📖', 'check-circle': '✅',
  'bar-chart': '📊', home: '🏠', calendar: '📅', users: '👥',
  monitor: '🖥', user: '👤', shield: '🛡', settings: '⚙',
}

interface SidebarProps {
  navItems: NavItem[]
  role: UserRole
}

export function Sidebar({ navItems, role }: SidebarProps) {
  const pathname = usePathname()
  const { isSidebarOpen } = useUiStore()

  return (
    <aside className={clsx(
      'flex h-full flex-col bg-base-200 transition-all duration-200',
      isSidebarOpen ? 'w-60' : 'w-16',
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-base-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content font-bold text-sm shrink-0">
          U
        </div>
        {isSidebarOpen && (
          <span className="font-semibold text-sm truncate">Sistem Ujian</span>
        )}
      </div>

      {/* Role badge */}
      {isSidebarOpen && (
        <div className="px-4 py-2">
          <span className="badge badge-primary badge-sm">{role}</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-base-content/70 hover:bg-base-300 hover:text-base-content',
              )}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <span className="text-lg shrink-0">{ICONS[item.icon] ?? '•'}</span>
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

```

---

### File: `src/components/madrasah/ArabicKeyboard.tsx`

```typescript
'use client'
import { useState, useCallback } from 'react'
import { clsx } from 'clsx'

// Baris layout keyboard Arabic (layout standar)
const ROWS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
]

const DIACRITICS = [
  { label: 'فَ', value: '\u064E', title: 'Fathah' },
  { label: 'فِ', value: '\u0650', title: 'Kasrah' },
  { label: 'فُ', value: '\u064F', title: 'Dammah' },
  { label: 'فً', value: '\u064B', title: 'Tanwin Fathah' },
  { label: 'فٍ', value: '\u064D', title: 'Tanwin Kasrah' },
  { label: 'فٌ', value: '\u064C', title: 'Tanwin Dammah' },
  { label: 'فْ', value: '\u0652', title: 'Sukun' },
  { label: 'فّ', value: '\u0651', title: 'Syaddah' },
  { label: 'فَّ', value: '\u0651\u064E', title: 'Syaddah + Fathah' },
]

const SPECIAL = [
  { label: 'بِسْمِ', value: 'بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ', title: 'Basmalah' },
  { label: 'ﷲ', value: 'الله', title: 'Allah' },
  { label: 'صلى', value: 'ﷺ', title: 'Shalawat' },
  { label: 'وسلم', value: 'عليه السلام', title: 'Salam' },
]

interface ArabicKeyboardProps {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
  placeholder?: string
  rows?: number
  showDiacritics?: boolean
  showSpecial?: boolean
}

export function ArabicKeyboard({
  value,
  onChange,
  disabled,
  placeholder = 'اكتب هنا...',
  rows = 4,
  showDiacritics = true,
  showSpecial = true,
}: ArabicKeyboardProps) {
  const [cursorPos, setCursorPos] = useState<number | null>(null)

  const insertAtCursor = useCallback((char: string) => {
    const pos = cursorPos ?? value.length
    const next = value.slice(0, pos) + char + value.slice(pos)
    onChange(next)
    setCursorPos(pos + char.length)
  }, [cursorPos, value, onChange])

  const handleBackspace = () => {
    if (value.length === 0) return
    const pos = cursorPos ?? value.length
    if (pos === 0) return
    // Handle combined chars (diacritics attached to letter)
    const next = value.slice(0, pos - 1) + value.slice(pos)
    onChange(next)
    setCursorPos(Math.max(0, pos - 1))
  }

  const handleClear = () => { onChange(''); setCursorPos(0) }

  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPos(e.currentTarget.selectionStart)
  }

  return (
    <div className="space-y-3 rounded-box border border-base-300 bg-base-100 p-3">
      {/* Text area */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onSelect={handleTextareaSelect}
        onClick={handleTextareaSelect}
        onKeyUp={handleTextareaSelect}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        dir="rtl"
        className="textarea textarea-bordered w-full resize-none text-right leading-loose arabic-text"
        style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", fontSize: '1.2rem' }}
      />

      {/* Special phrases */}
      {showSpecial && (
        <div className="flex flex-wrap gap-1.5">
          {SPECIAL.map(s => (
            <button
              key={s.value}
              type="button"
              title={s.title}
              onClick={() => insertAtCursor(s.value)}
              disabled={disabled}
              className="btn btn-xs btn-outline arabic-keyboard-key"
              dir="rtl"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Diacritics */}
      {showDiacritics && (
        <div className="flex flex-wrap gap-1">
          {DIACRITICS.map(d => (
            <button
              key={d.value}
              type="button"
              title={d.title}
              onClick={() => insertAtCursor(d.value)}
              disabled={disabled}
              className="btn btn-xs btn-ghost border border-base-300 arabic-keyboard-key font-bold"
              dir="rtl"
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* Main keyboard rows */}
      <div className="space-y-1" dir="rtl">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-0.5 justify-center flex-wrap">
            {row.map(ch => (
              <button
                key={ch}
                type="button"
                onClick={() => insertAtCursor(ch)}
                disabled={disabled}
                className="btn btn-xs btn-ghost border border-base-200 arabic-keyboard-key min-w-[2.2rem]"
              >
                {ch}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => insertAtCursor(' ')}
            disabled={disabled}
            className="btn btn-xs btn-ghost border border-base-300 px-6"
          >
            مسافة
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleBackspace}
            disabled={disabled || value.length === 0}
            className="btn btn-xs btn-ghost border border-base-300"
            title="Hapus satu karakter"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || value.length === 0}
            className="btn btn-xs btn-error btn-outline"
            title="Hapus semua"
          >
            Hapus Semua
          </button>
        </div>
      </div>

      <p className="text-right text-xs text-base-content/40">{value.length} karakter</p>
    </div>
  )
}

```

---

### File: `src/components/madrasah/HafalanRecorder.tsx`

```typescript
'use client'
import { useState, useEffect, useRef } from 'react'
import { useMediaRecorder } from '@/hooks/use-media-recorder'
import { saveMediaBlob } from '@/lib/db/queries'
import { uploadInChunks } from '@/lib/media/chunked-upload'
import { useToast } from '@/hooks/use-toast'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatDuration } from '@/lib/exam/timer'
import { clsx } from 'clsx'
import type { ID } from '@/types/common'

interface HafalanSection {
  id: string
  label: string          // misal: "Surah Al-Fatihah"
  arabicText?: string    // teks referensi jika ada
  maxDurationSec?: number
}

interface HafalanRecorderProps {
  questionId: ID
  attemptId: ID
  sessionId: ID
  sections?: HafalanSection[]   // jika ada beberapa bagian hafalan
  maxDurationSec?: number
  onUploaded?: (objectKey: string, sectionId?: string) => void
  disabled?: boolean
}

export function HafalanRecorder({
  questionId,
  attemptId,
  sessionId,
  sections,
  maxDurationSec = 180,
  onUploaded,
  disabled,
}: HafalanRecorderProps) {
  const { success, error: toastError } = useToast()
  const [elapsed, setElapsed] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [recordings, setRecordings] = useState<Record<string, { blob: Blob; url: string; uploaded: boolean }>>({})
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(sections?.[0]?.id)
  const activeSection = sections?.find(s => s.id === activeSectionId)
  const effectiveMax = activeSection?.maxDurationSec ?? maxDurationSec

  const { isRecording, error, start, stop } = useMediaRecorder({
    mimeType: 'audio/webm;codecs=opus',
    maxDurationMs: effectiveMax * 1000,
    onStop: async (result) => {
      const url = URL.createObjectURL(result.blob)
      const key = activeSectionId ?? 'default'
      setRecordings(prev => ({ ...prev, [key]: { blob: result.blob, url, uploaded: false } }))

      await saveMediaBlob({
        questionId, attemptId, sessionId,
        mimeType: result.mimeType,
        blob: result.blob,
        duration: result.duration,
        size: result.size,
        recordedAt: Date.now(),
        uploaded: false,
      })

      if (navigator.onLine) {
        await handleUpload(result.blob, key)
      }
    },
  })

  useEffect(() => {
    if (!isRecording) { setElapsed(0); return }
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [isRecording])

  const handleUpload = async (blob: Blob, sectionKey: string) => {
    setUploading(true)
    setUploadPct(0)
    try {
      const objectKey = await uploadInChunks(blob, {
        questionId: `${questionId}_${sectionKey}`,
        attemptId,
        onProgress: setUploadPct,
      })
      setRecordings(prev => ({
        ...prev,
        [sectionKey]: { ...prev[sectionKey]!, uploaded: true },
      }))
      success('Rekaman hafalan berhasil diunggah')
      onUploaded?.(objectKey, sectionKey)
    } catch (e) {
      toastError(parseErrorMessage(e))
    } finally {
      setUploading(false)
    }
  }

  const pct = Math.round((elapsed / effectiveMax) * 100)
  const isWarning = elapsed >= effectiveMax * 0.8

  return (
    <div className="space-y-4 rounded-box border border-base-300 bg-base-100 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎙</span>
        <h3 className="font-semibold text-sm">Rekaman Hafalan</h3>
      </div>

      {/* Section tabs jika ada beberapa bagian */}
      {sections && sections.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {sections.map(s => {
            const rec = recordings[s.id]
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSectionId(s.id)}
                disabled={isRecording}
                className={clsx(
                  'btn btn-xs gap-1',
                  activeSectionId === s.id ? 'btn-primary' : 'btn-ghost border border-base-300',
                )}
              >
                {rec?.uploaded ? '✓' : rec ? '⏸' : '○'}
                {s.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Teks referensi Arabic jika ada */}
      {activeSection?.arabicText && (
        <div className="rounded-box bg-base-200 p-3">
          <p className="text-xs text-base-content/50 mb-1">Teks Referensi:</p>
          <p
            className="arabic-text text-right leading-loose"
            dir="rtl"
            style={{ fontFamily: "'Amiri', serif", fontSize: '1.1rem' }}
          >
            {activeSection.arabicText}
          </p>
        </div>
      )}

      {/* Recorder UI */}
      <div className={clsx(
        'flex items-center gap-4 rounded-box p-3',
        isRecording ? 'bg-error/5 border border-error/30' : 'bg-base-200',
      )}>
        <div className={clsx(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl',
          isRecording ? 'bg-error/20 animate-pulse' : 'bg-base-300',
        )}>
          {isRecording ? '🔴' : '🎙'}
        </div>

        <div className="flex-1 min-w-0">
          {isRecording ? (
            <>
              <p className={clsx('text-sm font-medium', isWarning && 'text-warning')}>
                Merekam... {formatDuration(elapsed)} / {formatDuration(effectiveMax)}
              </p>
              <progress
                className={clsx('progress w-full h-2 mt-1', isWarning ? 'progress-warning' : 'progress-error')}
                value={elapsed}
                max={effectiveMax}
              />
            </>
          ) : uploading ? (
            <>
              <p className="text-sm text-primary font-medium">Mengunggah... {uploadPct}%</p>
              <progress className="progress progress-primary w-full h-2 mt-1" value={uploadPct} max={100} />
            </>
          ) : recordings[activeSectionId ?? 'default']?.uploaded ? (
            <p className="text-sm font-medium text-success">✓ Hafalan berhasil direkam & diunggah</p>
          ) : recordings[activeSectionId ?? 'default'] ? (
            <p className="text-sm text-warning font-medium">Rekaman tersimpan lokal, belum diunggah</p>
          ) : (
            <p className="text-sm text-base-content/60">
              {activeSection ? `Rekam hafalan: ${activeSection.label}` : 'Rekam hafalan Anda'}
              · Maks {formatDuration(effectiveMax)}
            </p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {isRecording ? (
            <button onClick={stop} className="btn btn-error btn-sm">■ Stop</button>
          ) : (
            <button
              onClick={() => void start()}
              disabled={disabled || uploading}
              className="btn btn-primary btn-sm"
            >
              🎙 Rekam
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-error">⚠ {error}</p>}

      {/* Playback per section */}
      {Object.entries(recordings).map(([key, rec]) => (
        <div key={key} className="rounded-box border border-base-300 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-base-content/60">
              {sections?.find(s => s.id === key)?.label ?? 'Rekaman'}{' '}
              {rec.uploaded && <span className="text-success">✓ Terunggah</span>}
            </p>
            {!rec.uploaded && navigator.onLine && !uploading && (
              <button
                className="btn btn-xs btn-outline btn-primary"
                onClick={() => void handleUpload(rec.blob, key)}
              >
                🔄 Upload
              </button>
            )}
          </div>
          <audio src={rec.url} controls className="w-full h-8" />
        </div>
      ))}

      {/* Progress summary jika banyak sections */}
      {sections && sections.length > 1 && (
        <div className="text-xs text-base-content/50 text-right">
          {Object.values(recordings).filter(r => r.uploaded).length} / {sections.length} bagian selesai
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/components/madrasah/QuranDisplay.tsx`

```typescript
'use client'
import { useState } from 'react'
import { clsx } from 'clsx'

interface Ayah {
  number: number    // nomor ayat dalam surah
  text: string      // teks Arab
  translation?: string
}

interface QuranDisplayProps {
  surahName: string
  surahNumber?: number
  ayahs: Ayah[]
  showTranslation?: boolean
  showBismillah?: boolean  // tampilkan basmalah di awal
  highlightAyahs?: number[]  // nomor ayat yang di-highlight (untuk soal)
  mode?: 'read' | 'question'  // 'question' = ada interaksi
  onAyahClick?: (ayah: Ayah) => void
  className?: string
}

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'

export function QuranDisplay({
  surahName,
  surahNumber,
  ayahs,
  showTranslation = false,
  showBismillah = true,
  highlightAyahs = [],
  mode = 'read',
  onAyahClick,
  className,
}: QuranDisplayProps) {
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null)
  const [showTrans, setShowTrans] = useState(showTranslation)

  const handleAyahClick = (ayah: Ayah) => {
    if (mode !== 'question') return
    setSelectedAyah(n => n === ayah.number ? null : ayah.number)
    onAyahClick?.(ayah)
  }

  return (
    <div className={clsx('rounded-box border border-base-300 bg-base-100', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-base-200 px-4 py-3">
        <div>
          <h3 className="font-semibold text-sm">{surahName}</h3>
          {surahNumber && <p className="text-xs text-base-content/50">QS. {surahNumber}</p>}
        </div>
        <div className="flex items-center gap-2">
          {ayahs.some(a => a.translation) && (
            <button
              type="button"
              onClick={() => setShowTrans(v => !v)}
              className={clsx('btn btn-xs', showTrans ? 'btn-primary' : 'btn-ghost border border-base-300')}
            >
              {showTrans ? '🇮🇩 Terjemah' : 'Terjemah'}
            </button>
          )}
          <span className="text-xs text-base-content/40">{ayahs.length} ayat</span>
        </div>
      </div>

      {/* Bismillah */}
      {showBismillah && surahNumber !== 1 && surahNumber !== 9 && (
        <div className="px-4 py-4 border-b border-base-200">
          <p
            className="text-center quran-text"
            dir="rtl"
            style={{ fontFamily: "'Scheherazade New', 'Amiri', serif", fontSize: '1.4rem', lineHeight: 2.8 }}
          >
            {BISMILLAH}
          </p>
        </div>
      )}

      {/* Ayahs */}
      <div className="divide-y divide-base-200">
        {ayahs.map(ayah => {
          const isHighlighted = highlightAyahs.includes(ayah.number)
          const isSelected = selectedAyah === ayah.number

          return (
            <div
              key={ayah.number}
              onClick={() => handleAyahClick(ayah)}
              className={clsx(
                'px-4 py-4 transition-colors',
                mode === 'question' && 'cursor-pointer hover:bg-base-200',
                isHighlighted && 'bg-warning/10 border-l-4 border-warning',
                isSelected && 'bg-primary/5 border-l-4 border-primary',
              )}
            >
              {/* Arabic text */}
              <p
                className="text-right leading-loose"
                dir="rtl"
                style={{
                  fontFamily: "'Scheherazade New', 'Amiri', serif",
                  fontSize: '1.35rem',
                  lineHeight: 2.5,
                }}
              >
                {ayah.text}
                {/* Nomor ayat dalam lingkaran */}
                <span
                  className="inline-flex items-center justify-center mr-2 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold"
                  style={{ fontFamily: 'system-ui', fontSize: '0.65rem' }}
                >
                  {ayah.number}
                </span>
              </p>

              {/* Terjemahan */}
              {showTrans && ayah.translation && (
                <p className="mt-2 text-sm text-base-content/70 leading-relaxed border-t border-base-200 pt-2">
                  <span className="text-xs font-medium text-base-content/40 mr-1">({ayah.number})</span>
                  {ayah.translation}
                </p>
              )}

              {/* Highlight indicator */}
              {isHighlighted && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="badge badge-warning badge-xs">Ayat Kunci</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer untuk mode question */}
      {mode === 'question' && (
        <div className="border-t border-base-200 px-4 py-2 text-xs text-base-content/40 text-center">
          Klik ayat untuk memilih
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/components/madrasah/TajwidMarker.tsx`

```typescript
'use client'
import { useState, useCallback } from 'react'
import { clsx } from 'clsx'

// Kategori tajwid dengan warna standar internasional
const TAJWID_RULES = [
  { id: 'ghunnah', label: 'Ghunnah', color: '#10b981', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', desc: 'Dengung 2 harakat' },
  { id: 'idgham_bighunnah', label: "Idgham Bighunnah", color: '#3b82f6', bgColor: 'bg-blue-100', textColor: 'text-blue-800', desc: 'Memasukkan dengan dengung' },
  { id: 'idgham_bilaghunnah', label: "Idgham Bilaghunnah", color: '#6366f1', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', desc: 'Memasukkan tanpa dengung' },
  { id: 'ikhfa', label: 'Ikhfa', color: '#f59e0b', bgColor: 'bg-amber-100', textColor: 'text-amber-800', desc: 'Samar 10-15 harakat' },
  { id: 'izhar', label: 'Izhar', color: '#ef4444', bgColor: 'bg-red-100', textColor: 'text-red-800', desc: 'Jelas tanpa dengung' },
  { id: 'iqlab', label: 'Iqlab', color: '#8b5cf6', bgColor: 'bg-violet-100', textColor: 'text-violet-800', desc: 'Menukar ke mim' },
  { id: 'mad_thobii', label: "Mad Thabi'i", color: '#06b6d4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', desc: 'Panjang 2 harakat' },
  { id: 'mad_wajib', label: 'Mad Wajib', color: '#f97316', bgColor: 'bg-orange-100', textColor: 'text-orange-800', desc: 'Panjang 4-5 harakat' },
  { id: 'qalqalah', label: 'Qalqalah', color: '#ec4899', bgColor: 'bg-pink-100', textColor: 'text-pink-800', desc: 'Memantul' },
] as const

type RuleId = typeof TAJWID_RULES[number]['id']

interface MarkedWord {
  word: string
  ruleId: RuleId | null
  index: number
}

interface TajwidMarkerProps {
  text: string       // teks Arab yang akan ditandai
  readOnly?: boolean // mode tampilan saja (tidak bisa ditandai)
  initialMarks?: Record<number, RuleId>  // tanda awal (untuk edit)
  onMarksChange?: (marks: Record<number, RuleId>) => void
  showLegend?: boolean
}

export function TajwidMarker({
  text,
  readOnly = false,
  initialMarks = {},
  onMarksChange,
  showLegend = true,
}: TajwidMarkerProps) {
  const [activeRule, setActiveRule] = useState<RuleId | null>(null)
  const [marks, setMarks] = useState<Record<number, RuleId>>(initialMarks)

  // Split teks menjadi kata-kata (spasi sebagai pemisah, rtl)
  const words: MarkedWord[] = text.split(/\s+/).map((word, i) => ({
    word,
    ruleId: marks[i] ?? null,
    index: i,
  }))

  const handleWordClick = useCallback((idx: number) => {
    if (readOnly || !activeRule) return

    setMarks(prev => {
      const next = { ...prev }
      // Toggle: klik ulang rule yang sama = hapus tanda
      if (next[idx] === activeRule) {
        delete next[idx]
      } else {
        next[idx] = activeRule
      }
      onMarksChange?.(next)
      return next
    })
  }, [readOnly, activeRule, onMarksChange])

  const clearAll = () => {
    setMarks({})
    onMarksChange?.({})
  }

  const getRuleConfig = (ruleId: RuleId | null) =>
    TAJWID_RULES.find(r => r.id === ruleId)

  const markedCount = Object.keys(marks).length

  return (
    <div className="space-y-4">
      {/* Tool palette */}
      {!readOnly && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-base-content/60">Pilih hukum tajwid, lalu klik kata:</p>
            <div className="flex items-center gap-2">
              {markedCount > 0 && (
                <span className="badge badge-primary badge-xs">{markedCount} ditandai</span>
              )}
              {markedCount > 0 && (
                <button type="button" onClick={clearAll} className="btn btn-xs btn-ghost text-error">
                  Hapus Semua
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TAJWID_RULES.map(rule => (
              <button
                key={rule.id}
                type="button"
                onClick={() => setActiveRule(r => r === rule.id ? null : rule.id)}
                title={rule.desc}
                className={clsx(
                  'btn btn-xs gap-1 border-2 transition-all',
                  activeRule === rule.id
                    ? 'border-current shadow-sm scale-105'
                    : 'border-transparent',
                  rule.bgColor,
                  rule.textColor,
                )}
              >
                {rule.label}
              </button>
            ))}
          </div>
          {activeRule && (
            <p className="text-xs text-base-content/50">
              Mode: <span className="font-medium">{getRuleConfig(activeRule)?.label}</span>
              {' '}— {getRuleConfig(activeRule)?.desc}
              <button type="button" onClick={() => setActiveRule(null)} className="ml-2 text-error">× Batal</button>
            </p>
          )}
        </div>
      )}

      {/* Arabic text with markers */}
      <div
        className="rounded-box border border-base-300 bg-base-50 p-4 text-right leading-loose"
        dir="rtl"
        style={{ fontFamily: "'Scheherazade New', 'Amiri', serif", fontSize: '1.3rem', lineHeight: 3 }}
      >
        {words.map((w, i) => {
          const rule = getRuleConfig(w.ruleId)
          return (
            <span key={i}>
              <span
                onClick={() => handleWordClick(w.index)}
                title={rule?.label}
                className={clsx(
                  'inline-block rounded px-1 mx-0.5 transition-all',
                  !readOnly && activeRule && !w.ruleId && 'cursor-pointer hover:bg-base-200',
                  !readOnly && activeRule && w.ruleId && 'cursor-pointer',
                  rule && `${rule.bgColor} ${rule.textColor}`,
                  !readOnly && w.ruleId && 'ring-1 ring-current',
                )}
                style={rule ? { borderBottom: `2px solid ${rule.color}` } : {}}
              >
                {w.word}
              </span>
              {' '}
            </span>
          )
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {TAJWID_RULES.map(rule => {
            const count = Object.values(marks).filter(v => v === rule.id).length
            return (
              <div key={rule.id} className={clsx('flex items-center gap-2 rounded-box px-2 py-1.5 text-xs', rule.bgColor, rule.textColor)}>
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: rule.color }}
                />
                <span className="flex-1 font-medium truncate">{rule.label}</span>
                {count > 0 && (
                  <span className="font-bold opacity-70">{count}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {!readOnly && markedCount > 0 && (
        <div className="rounded-box bg-base-200 p-3 text-xs space-y-1">
          <p className="font-medium">Ringkasan Penandaan:</p>
          {TAJWID_RULES.filter(r => Object.values(marks).includes(r.id)).map(rule => {
            const count = Object.values(marks).filter(v => v === rule.id).length
            return (
              <div key={rule.id} className="flex items-center justify-between">
                <span className={clsx(rule.textColor, 'font-medium')}>{rule.label}</span>
                <span>{count} kata</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/components/monitoring/ActivityLogViewer.tsx`

```typescript
import { clsx } from 'clsx'
import type { ActivitySummary, LiveActivityEvent } from '@/types/activity'
import { formatDateTime } from '@/lib/utils/format'

const EVENT_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  tab_blur: { label: 'Keluar Tab', icon: '👁', className: 'text-warning' },
  tab_focus: { label: 'Kembali ke Tab', icon: '✓', className: 'text-success' },
  copy_paste: { label: 'Copy-Paste', icon: '📋', className: 'text-error' },
  idle: { label: 'Idle', icon: '💤', className: 'text-base-content/40' },
  resume: { label: 'Resume', icon: '▶', className: 'text-info' },
  screen_capture_attempt: { label: 'Screenshot', icon: '📸', className: 'text-error font-bold' },
}

interface ActivityLogViewerProps {
  logs: LiveActivityEvent[]
  username?: string
}

export function ActivityLogViewer({ logs, username }: ActivityLogViewerProps) {
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-2">
      {username && <h3 className="text-sm font-semibold">Log Aktivitas: {username}</h3>}
      {sorted.length === 0 ? (
        <p className="text-xs text-base-content/40 py-4 text-center">Belum ada aktivitas tercatat</p>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {sorted.map((log, i) => {
            const cfg = EVENT_CONFIG[log.type] ?? { label: log.type, icon: '•', className: '' }
            return (
              <div key={i} className="flex items-start gap-2 text-xs py-1 border-b border-base-200 last:border-0">
                <span>{cfg.icon}</span>
                <div className="flex-1">
                  <span className={clsx('font-medium', cfg.className)}>{cfg.label}</span>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <span className="text-base-content/40 ml-1">
                      {log.metadata.preview ? `"${String(log.metadata.preview).slice(0, 40)}"` : ''}
                    </span>
                  )}
                </div>
                <span className="text-base-content/30 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

```

---

### File: `src/components/monitoring/LiveMonitor.tsx`

```typescript
'use client'
import { useEffect, useState, useRef } from 'react'
import { io, type Socket } from 'socket.io-client' // NOTE: tambahkan socket.io-client ke package.json
import { useAuthStore } from '@/stores/auth.store'
import { monitoringApi } from '@/lib/api/monitoring.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { StudentProgressCard } from './StudentProgressCard'
import { ActivityLogViewer } from './ActivityLogViewer'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Loading } from '@/components/ui/Loading'
import type { ActivitySummary, LiveActivityEvent } from '@/types/activity'
import type { ID } from '@/types/common'

type StudentStatus = ActivitySummary & {
  answered: number
  total: number
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'OFFLINE'
}

interface LiveMonitorProps {
  sessionId: ID
}

export function LiveMonitor({ sessionId }: LiveMonitorProps) {
  const { accessToken } = useAuthStore()
  const [students, setStudents] = useState<StudentStatus[]>([])
  const [activityLogs, setActivityLogs] = useState<Record<ID, LiveActivityEvent[]>>({})
  const [selectedStudent, setSelectedStudent] = useState<StudentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  // Load initial data
  useEffect(() => {
    monitoringApi.getSessionStatus(sessionId)
      .then(data => setStudents((data as any).students ?? []))
      .catch(e => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [sessionId])

  // Socket.IO real-time
  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:3001'
    const socket = io(`${WS_URL}/monitoring`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join-session', { sessionId })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('student-update', (data: StudentStatus) => {
      setStudents(prev => {
        const idx = prev.findIndex(s => s.userId === data.userId)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...prev[idx]!, ...data }
          return next
        }
        return [...prev, data]
      })
    })

    socket.on('activity-log', (log: LiveActivityEvent) => {
      setActivityLogs(prev => ({
        ...prev,
        [log.userId]: [log, ...(prev[log.userId] ?? [])].slice(0, 50),
      }))
    })

    socketRef.current = socket
    return () => { socket.disconnect() }
  }, [sessionId, accessToken])

  const activeCount = students.filter(s => s.status === 'IN_PROGRESS').length
  const submittedCount = students.filter(s => s.status === 'SUBMITTED').length
  const alertCount = students.filter(s => s.tabBlurCount >= 3 || s.copyPasteCount >= 2).length

  if (loading) return <Loading text="Memuat data monitoring..." />

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-success' : 'bg-error animate-pulse'}`} />
          <span className="text-base-content/60">{connected ? 'Terhubung' : 'Terputus'}</span>
        </div>
        <Badge variant="success" size="sm">🟢 {activeCount} mengerjakan</Badge>
        <Badge variant="primary" size="sm">✓ {submittedCount} selesai</Badge>
        {alertCount > 0 && <Badge variant="warning" size="sm">⚠ {alertCount} perlu perhatian</Badge>}
        <span className="ml-auto text-xs text-base-content/40">{students.length} peserta total</span>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Student grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {students.map(s => (
          <StudentProgressCard
            key={s.userId}
            summary={s}
            onSelect={() => setSelectedStudent(s)}
          />
        ))}
        {students.length === 0 && (
          <div className="col-span-full text-center py-12 text-base-content/40">
            Belum ada peserta yang aktif
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`Detail: ${selectedStudent?.username}`}
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Tab Blur', value: selectedStudent.tabBlurCount, alert: selectedStudent.tabBlurCount >= 3 },
                { label: 'Copy-Paste', value: selectedStudent.copyPasteCount, alert: selectedStudent.copyPasteCount >= 2 },
                { label: 'Total Event', value: selectedStudent.totalEvents, alert: false },
              ].map(stat => (
                <div key={stat.label} className={`rounded-box p-3 ${stat.alert ? 'bg-warning/10 border border-warning' : 'bg-base-200'}`}>
                  <p className={`text-2xl font-bold ${stat.alert ? 'text-warning' : ''}`}>{stat.value}</p>
                  <p className="text-xs text-base-content/60">{stat.label}</p>
                </div>
              ))}
            </div>
            <ActivityLogViewer
              logs={activityLogs[selectedStudent.userId] ?? []}
              username={selectedStudent.username}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

```

---

### File: `src/components/monitoring/StudentProgressCard.tsx`

```typescript
import { clsx } from 'clsx'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import type { ActivitySummary } from '@/types/activity'
import { formatRelative } from '@/lib/utils/format'

interface StudentProgressCardProps {
  summary: ActivitySummary & {
    answered: number
    total: number
    status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'OFFLINE'
  }
  onSelect?: () => void
}

const STATUS_CONFIG = {
  IN_PROGRESS: { label: 'Mengerjakan', variant: 'success' as const },
  SUBMITTED: { label: 'Selesai', variant: 'primary' as const },
  TIMED_OUT: { label: 'Waktu Habis', variant: 'error' as const },
  OFFLINE: { label: 'Offline', variant: 'warning' as const },
}

export function StudentProgressCard({ summary, onSelect }: StudentProgressCardProps) {
  const { label, variant } = STATUS_CONFIG[summary.status]
  const pct = summary.total > 0 ? Math.round((summary.answered / summary.total) * 100) : 0
  const hasAlert = summary.tabBlurCount >= 3 || summary.copyPasteCount >= 2

  return (
    <div
      className={clsx(
        'card card-compact bg-base-100 border transition-all cursor-pointer hover:shadow-md',
        hasAlert ? 'border-warning' : 'border-base-300',
      )}
      onClick={onSelect}
    >
      <div className="card-body gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="avatar placeholder">
              <div className="w-7 rounded-full bg-primary text-primary-content">
                <span className="text-xs">{summary.username[0]?.toUpperCase()}</span>
              </div>
            </div>
            <span className="text-sm font-medium truncate max-w-[120px]">{summary.username}</span>
          </div>
          <Badge variant={variant} size="xs">{label}</Badge>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-base-content/50 mb-0.5">
            <span>{summary.answered}/{summary.total}</span>
            <span>{pct}%</span>
          </div>
          <progress className="progress progress-primary w-full h-1.5" value={summary.answered} max={summary.total} />
        </div>

        {/* Activity flags */}
        {hasAlert && (
          <div className="flex gap-1 flex-wrap">
            {summary.tabBlurCount >= 3 && (
              <Tooltip tip={`Keluar tab ${summary.tabBlurCount}x`}>
                <span className="badge badge-warning badge-xs gap-0.5">⚠ {summary.tabBlurCount}x blur</span>
              </Tooltip>
            )}
            {summary.copyPasteCount >= 2 && (
              <Tooltip tip={`Copy-paste ${summary.copyPasteCount}x`}>
                <span className="badge badge-error badge-xs gap-0.5">📋 {summary.copyPasteCount}x paste</span>
              </Tooltip>
            )}
          </div>
        )}

        {summary.lastEventAt && (
          <p className="text-xs text-base-content/40">
            Aktivitas terakhir: {formatRelative(summary.lastEventAt)}
          </p>
        )}
      </div>
    </div>
  )
}

```

---

### File: `src/components/questions/MatchingEditor.tsx`

```typescript
'use client'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import type { MatchingOption } from '@/types/question'

export function MatchingEditor() {
  const { watch, setValue } = useFormContext()
  const options: MatchingOption = watch('options') ?? { left: [], right: [] }
  const correctAnswer: Record<string, string> = watch('correctAnswer') ?? {}

  const addPair = () => {
    const idx = options.left.length
    const leftKey = String.fromCharCode(65 + idx) // A, B, C...
    const rightKey = String(idx + 1)               // 1, 2, 3...
    setValue('options', {
      left: [...options.left, { key: leftKey, text: '' }],
      right: [...options.right, { key: rightKey, text: '' }],
    })
  }

  const removePair = (idx: number) => {
    const lKey = options.left[idx]?.key
    const rKey = options.right[idx]?.key
    setValue('options', {
      left: options.left.filter((_, i) => i !== idx),
      right: options.right.filter((_, i) => i !== idx),
    })
    if (lKey) {
      const { [lKey]: _, ...rest } = correctAnswer
      setValue('correctAnswer', rest)
    }
  }

  const setMatch = (leftKey: string, rightKey: string) => {
    setValue('correctAnswer', { ...correctAnswer, [leftKey]: rightKey })
  }

  return (
    <div className="space-y-3">
      <label className="label">
        <span className="label-text font-medium">Pasangan Menjodohkan</span>
        <span className="label-text-alt text-base-content/40">Atur pasangan jawaban yang benar</span>
      </label>
      {options.left.map((l, idx) => {
        const r = options.right[idx]
        return (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={l.text}
              onChange={e => {
                const next = [...options.left]
                next[idx] = { ...l, text: e.target.value }
                setValue('options', { ...options, left: next })
              }}
              placeholder={`Kiri ${l.key}`}
              className="input input-bordered input-sm flex-1"
            />
            {/* Select pasangan kanan */}
            <select
              className="select select-bordered select-sm w-32"
              value={correctAnswer[l.key] ?? ''}
              onChange={e => setMatch(l.key, e.target.value)}
            >
              <option value="">— Pasangan</option>
              {options.right.map(rv => (
                <option key={rv.key} value={rv.key}>{rv.key}. {rv.text.slice(0, 20)}</option>
              ))}
            </select>
            {r && (
              <input
                value={r.text}
                onChange={e => {
                  const next = [...options.right]
                  next[idx] = { ...r, text: e.target.value }
                  setValue('options', { ...options, right: next })
                }}
                placeholder={`Kanan ${r.key}`}
                className="input input-bordered input-sm flex-1"
              />
            )}
            <button
              type="button"
              onClick={() => removePair(idx)}
              className="btn btn-sm btn-square btn-ghost text-error"
              disabled={options.left.length <= 2}
            >✕</button>
          </div>
        )
      })}
      {options.left.length < 8 && (
        <Button type="button" size="xs" variant="ghost" onClick={addPair}>+ Tambah Baris</Button>
      )}
    </div>
  )
}

```

---

### File: `src/components/questions/MediaUpload.tsx`

```typescript
'use client'
import { useRef, useState } from 'react'
import { uploadImage } from '@/lib/media/upload'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatBytes } from '@/lib/utils/format'
import { Alert } from '@/components/ui/Alert'

interface MediaUploadProps {
  value?: string[]       // object keys MinIO
  onChange: (keys: string[]) => void
  accept?: string
  maxFiles?: number
  label?: string
}

export function MediaUpload({ value = [], onChange, accept = 'image/*', maxFiles = 3, label = 'Upload Gambar' }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const uploaded: string[] = []
      const newPreviews: string[] = []
      for (const file of Array.from(files).slice(0, maxFiles - value.length)) {
        const key = await uploadImage(file)
        uploaded.push(key)
        newPreviews.push(URL.createObjectURL(file))
      }
      onChange([...value, ...uploaded])
      setPreviews(prev => [...prev, ...newPreviews])
    } catch (e) {
      setError(parseErrorMessage(e))
    } finally {
      setUploading(false)
    }
  }

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
        <span className="label-text-alt text-base-content/40">{value.length}/{maxFiles} file</span>
      </label>

      {error && <Alert variant="error" className="text-xs">{error}</Alert>}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt="" className="h-20 w-20 rounded-box object-cover border border-base-300" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="btn btn-xs btn-circle btn-error absolute -right-1 -top-1"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {value.length < maxFiles && (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-box border-2 border-dashed border-base-300 p-4 hover:border-primary/50 hover:bg-base-200/50 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); void handleFiles(e.dataTransfer.files) }}
        >
          {uploading
            ? <><span className="loading loading-spinner loading-sm text-primary" /><p className="mt-2 text-xs text-base-content/60">Mengupload...</p></>
            : <><span className="text-2xl">📁</span><p className="mt-1 text-xs text-base-content/60">Klik atau drop file di sini</p></>
          }
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="hidden"
        onChange={e => void handleFiles(e.target.files)}
      />
    </div>
  )
}

```

---

### File: `src/components/questions/OptionsEditor.tsx`

```typescript
'use client'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import type { MultipleChoiceOption } from '@/types/question'

const DEFAULT_KEYS = ['a', 'b', 'c', 'd', 'e']

interface OptionsEditorProps {
  fieldName: string   // 'options'
  correctAnswerField?: string
  multi?: boolean     // COMPLEX_MULTIPLE_CHOICE
}

export function OptionsEditor({ fieldName, correctAnswerField = 'correctAnswer', multi = false }: OptionsEditorProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const options: MultipleChoiceOption[] = watch(fieldName) ?? []
  const correctAnswer: string | string[] = watch(correctAnswerField) ?? (multi ? [] : '')

  const addOption = () => {
    const key = DEFAULT_KEYS[options.length] ?? String.fromCharCode(97 + options.length)
    setValue(fieldName, [...options, { key, text: '' }])
  }

  const removeOption = (idx: number) => {
    const removed = options[idx]!.key
    const next = options.filter((_, i) => i !== idx)
    setValue(fieldName, next)
    // Hapus dari correctAnswer jika ada
    if (multi) {
      setValue(correctAnswerField, (correctAnswer as string[]).filter(k => k !== removed))
    } else if (correctAnswer === removed) {
      setValue(correctAnswerField, '')
    }
  }

  const toggleCorrect = (key: string) => {
    if (multi) {
      const arr = correctAnswer as string[]
      setValue(correctAnswerField, arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key])
    } else {
      setValue(correctAnswerField, key)
    }
  }

  return (
    <div className="space-y-2">
      <label className="label">
        <span className="label-text font-medium">Pilihan Jawaban</span>
        <span className="label-text-alt text-base-content/40">
          {multi ? 'Klik ✓ untuk pilih jawaban benar (bisa lebih dari satu)' : 'Klik ✓ untuk pilih jawaban benar'}
        </span>
      </label>
      {options.map((opt, idx) => {
        const isCorrect = multi
          ? (correctAnswer as string[]).includes(opt.key)
          : correctAnswer === opt.key
        return (
          <div key={idx} className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-base-300 text-xs font-bold uppercase">
              {opt.key}
            </span>
            <input
              {...register(`${fieldName}.${idx}.text`)}
              placeholder={`Pilihan ${opt.key.toUpperCase()}`}
              className="input input-bordered input-sm flex-1"
            />
            <button
              type="button"
              title="Tandai sebagai jawaban benar"
              onClick={() => toggleCorrect(opt.key)}
              className={`btn btn-sm btn-square ${isCorrect ? 'btn-success' : 'btn-ghost border border-base-300'}`}
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => removeOption(idx)}
              className="btn btn-sm btn-square btn-ghost text-error"
              disabled={options.length <= 2}
            >
              ✕
            </button>
          </div>
        )
      })}
      {options.length < 6 && (
        <Button type="button" size="xs" variant="ghost" onClick={addOption} className="mt-1">
          + Tambah Pilihan
        </Button>
      )}
    </div>
  )
}

```

---

### File: `src/components/questions/QuestionEditor.tsx`

```typescript
'use client'
import { useEffect } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { QuestionType } from '@/types/common'
import { OptionsEditor } from './OptionsEditor'
import { MatchingEditor } from './MatchingEditor'
import { MediaUpload } from './MediaUpload'
import { TagSelector } from './TagSelector'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const QUESTION_TYPES: Array<{ value: QuestionType; label: string }> = [
  { value: 'MULTIPLE_CHOICE', label: 'Pilihan Ganda' },
  { value: 'COMPLEX_MULTIPLE_CHOICE', label: 'Pilihan Ganda Kompleks' },
  { value: 'TRUE_FALSE', label: 'Benar/Salah' },
  { value: 'MATCHING', label: 'Menjodohkan' },
  { value: 'SHORT_ANSWER', label: 'Jawaban Singkat' },
  { value: 'ESSAY', label: 'Esai' },
]

interface QuestionEditorProps {
  subjects: Array<{ value: string; label: string }>
}

export function QuestionEditor({ subjects }: QuestionEditorProps) {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext()
  const qType: QuestionType = watch('type')

  // Init options saat tipe berubah
  useEffect(() => {
    if (qType === 'MULTIPLE_CHOICE' || qType === 'COMPLEX_MULTIPLE_CHOICE') {
      setValue('options', [
        { key: 'a', text: '' }, { key: 'b', text: '' },
        { key: 'c', text: '' }, { key: 'd', text: '' },
      ])
      setValue('correctAnswer', qType === 'COMPLEX_MULTIPLE_CHOICE' ? [] : '')
    } else if (qType === 'TRUE_FALSE') {
      setValue('options', null)
      setValue('correctAnswer', '')
    } else if (qType === 'MATCHING') {
      setValue('options', {
        left: [{ key: 'A', text: '' }, { key: 'B', text: '' }],
        right: [{ key: '1', text: '' }, { key: '2', text: '' }],
      })
      setValue('correctAnswer', {})
    } else {
      setValue('options', null)
      setValue('correctAnswer', '')
    }
  }, [qType, setValue])

  return (
    <div className="space-y-5">
      {/* Mata pelajaran + Tipe */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="subjectId"
          render={({ field, fieldState }) => (
            <Select
              label="Mata Pelajaran"
              options={subjects}
              placeholder="Pilih mata pelajaran"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="type"
          render={({ field, fieldState }) => (
            <Select
              label="Tipe Soal"
              options={QUESTION_TYPES}
              placeholder="Pilih tipe"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
      </div>

      {/* Konten soal */}
      <div className="form-control">
        <label className="label"><span className="label-text font-medium">Teks Soal</span></label>
        <textarea
          {...register('content.text')}
          rows={4}
          placeholder="Tulis pertanyaan di sini..."
          className={`textarea textarea-bordered resize-none leading-relaxed ${errors.content ? 'textarea-error' : ''}`}
        />
        {errors['content.text' as keyof typeof errors] && (
          <label className="label">
            <span className="label-text-alt text-error">Teks soal wajib diisi</span>
          </label>
        )}
      </div>

      {/* Media upload untuk soal */}
      <Controller
        control={control}
        name="content.images"
        render={({ field }) => (
          <MediaUpload
            value={field.value ?? []}
            onChange={field.onChange}
            label="Gambar Soal (opsional)"
            maxFiles={3}
          />
        )}
      />

      {/* Input jawaban sesuai tipe */}
      {(qType === 'MULTIPLE_CHOICE' || qType === 'COMPLEX_MULTIPLE_CHOICE') && (
        <OptionsEditor fieldName="options" multi={qType === 'COMPLEX_MULTIPLE_CHOICE'} />
      )}

      {qType === 'TRUE_FALSE' && (
        <div className="form-control">
          <label className="label"><span className="label-text font-medium">Jawaban Benar</span></label>
          <div className="flex gap-3">
            {['true', 'false'].map(v => {
              const curr = watch('correctAnswer')
              return (
                <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-box border-2 px-4 py-2 ${curr === v ? 'border-primary bg-primary/5' : 'border-base-300'}`}>
                  <input
                    type="radio"
                    className="radio radio-primary radio-sm"
                    {...register('correctAnswer')}
                    value={v}
                    checked={curr === v}
                    onChange={() => setValue('correctAnswer', v)}
                  />
                  {v === 'true' ? 'Benar' : 'Salah'}
                </label>
              )
            })}
          </div>
        </div>
      )}

      {qType === 'MATCHING' && <MatchingEditor />}

      {(qType === 'SHORT_ANSWER' || qType === 'ESSAY') && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Kunci Jawaban / Jawaban Model</span>
            <span className="label-text-alt text-base-content/40">Dienkripsi sebelum disimpan</span>
          </label>
          <textarea
            {...register('correctAnswer')}
            rows={3}
            placeholder={qType === 'SHORT_ANSWER' ? 'Kata kunci jawaban...' : 'Jawaban model untuk referensi guru...'}
            className="textarea textarea-bordered resize-none"
          />
        </div>
      )}

      {/* Poin & Kesulitan */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Poin"
          type="number"
          inputSize="sm"
          {...register('points', { valueAsNumber: true })}
          error={(errors.points as any)?.message}
        />
        <div className="form-control">
          <label className="label"><span className="label-text font-medium">Tingkat Kesulitan</span></label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => {
              const curr = watch('difficulty')
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setValue('difficulty', n)}
                  className={`btn btn-sm btn-square ${curr >= n ? 'btn-warning' : 'btn-ghost border border-base-300'}`}
                >
                  ★
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="label"><span className="label-text font-medium">Tag</span></label>
        <Controller
          control={control}
          name="tagIds"
          render={({ field }) => (
            <TagSelector selected={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>
    </div>
  )
}

```

---

### File: `src/components/questions/TagSelector.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { questionsApi } from '@/lib/api/questions.api'
import type { QuestionTag } from '@/types/question'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'

interface TagSelectorProps {
  selected: string[]   // tagIds
  onChange: (ids: string[]) => void
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<QuestionTag[]>([])
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    questionsApi.listTags().then(setTags).catch(() => {})
  }, [])

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  const createTag = async () => {
    if (!search.trim()) return
    setCreating(true)
    try {
      const tag = await questionsApi.createTag(search.trim())
      setTags(prev => [...prev, tag])
      onChange([...selected, tag.id])
      setSearch('')
    } finally {
      setCreating(false)
    }
  }

  const filtered = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-2">
      <Input
        placeholder="Cari atau buat tag..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        inputSize="sm"
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); void createTag() }
        }}
      />
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {filtered.map(tag => {
          const active = selected.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={`badge cursor-pointer transition-colors ${active ? 'badge-primary' : 'badge-ghost border border-base-300 hover:badge-primary'}`}
            >
              {tag.name}
            </button>
          )
        })}
        {search && !filtered.some(t => t.name === search) && (
          <button
            type="button"
            onClick={() => void createTag()}
            disabled={creating}
            className="badge badge-outline badge-accent cursor-pointer"
          >
            + Buat "{search}"
          </button>
        )}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-base-content/50">{selected.length} tag dipilih</p>
      )}
    </div>
  )
}

```

---

### File: `src/components/sync/ChecksumValidator.tsx`

```typescript
'use client'
import { useState } from 'react'
import { validatePackageHash } from '@/lib/crypto/checksum'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

interface ChecksumValidatorProps {
  encryptedData: string
  expectedHash: string
}

export function ChecksumValidator({ encryptedData, expectedHash }: ChecksumValidatorProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'mismatch'>('idle')

  const check = async () => {
    setStatus('checking')
    try {
      await validatePackageHash(encryptedData, expectedHash)
      setStatus('ok')
    } catch {
      setStatus('mismatch')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button size="xs" variant="ghost" onClick={check} loading={status === 'checking'}>
          Verifikasi Integritas
        </Button>
        {status === 'ok' && <span className="text-success text-xs">✓ Integritas OK</span>}
        {status === 'mismatch' && <span className="text-error text-xs">✕ Hash tidak cocok</span>}
      </div>
      {status === 'mismatch' && (
        <Alert variant="error" title="Integritas Gagal">
          Paket soal mungkin korup. Silakan download ulang.
        </Alert>
      )}
    </div>
  )
}

```

---

### File: `src/components/sync/DownloadProgress.tsx`

```typescript
interface DownloadProgressProps {
  step: 'idle' | 'downloading' | 'decrypting' | 'ready'
  progress?: number // 0–100, opsional
}

const STEP_LABELS: Record<DownloadProgressProps['step'], string> = {
  idle: 'Siap mengunduh',
  downloading: 'Mengunduh paket soal...',
  decrypting: 'Mendekripsi soal...',
  ready: 'Siap!',
}

export function DownloadProgress({ step, progress }: DownloadProgressProps) {
  const steps: Array<DownloadProgressProps['step']> = ['downloading', 'decrypting', 'ready']
  const currentIdx = steps.indexOf(step)

  return (
    <div className="space-y-3">
      <ul className="steps steps-vertical text-sm">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`step ${i < currentIdx ? 'step-success' : i === currentIdx ? 'step-primary' : ''}`}
          >
            {STEP_LABELS[s]}
          </li>
        ))}
      </ul>
      {progress !== undefined && (
        <progress className="progress progress-primary w-full" value={progress} max={100} />
      )}
    </div>
  )
}

```

---

### File: `src/components/sync/SyncStatus.tsx`

```typescript
'use client'
import { clsx } from 'clsx'
import { useSyncStatus } from '@/hooks/use-sync-status'
import { Tooltip } from '@/components/ui/Tooltip'

export function SyncStatus() {
  const { isOnline, isSyncing, pendingCount, failedCount, lastSyncAt, canSync } = useSyncStatus()

  const lastSync = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString('id-ID')
    : null

  return (
    <Tooltip tip={lastSync ? `Terakhir sync: ${lastSync}` : 'Belum pernah sync'}>
      <div className={clsx(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors',
        isSyncing && 'bg-warning/10 text-warning',
        !isSyncing && failedCount > 0 && 'bg-error/10 text-error',
        !isSyncing && failedCount === 0 && pendingCount > 0 && 'bg-warning/10 text-warning',
        !isSyncing && failedCount === 0 && pendingCount === 0 && 'bg-success/10 text-success',
      )}>
        {isSyncing
          ? <><span className="loading loading-spinner loading-xs" /> Syncing...</>
          : failedCount > 0
            ? <><span>✕</span> {failedCount} gagal</>
            : pendingCount > 0
              ? <><span className="animate-pulse">●</span> {pendingCount} pending</>
              : <><span>✓</span> Tersimpan</>
        }
      </div>
    </Tooltip>
  )
}

```

---

### File: `src/components/sync/UploadQueue.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { getPendingSyncItems } from '@/lib/db/queries'
import type { LocalSyncItem } from '@/types/sync'
import { Badge } from '@/components/ui/Badge'
import { formatRelative } from '@/lib/utils/format'

export function UploadQueue() {
  const [items, setItems] = useState<LocalSyncItem[]>([])

  useEffect(() => {
    const load = () => getPendingSyncItems().then(setItems)
    void load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  if (items.length === 0) return (
    <div className="text-center text-sm text-base-content/40 py-6">
      Tidak ada item pending di antrian
    </div>
  )

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-base-content/60">{items.length} item menunggu dikirim</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-2 rounded-box bg-base-200 px-3 py-2 text-xs">
          <div>
            <span className="font-mono font-medium">{item.type}</span>
            <span className="text-base-content/40 ml-2">{item.retryCount > 0 ? `retry #${item.retryCount}` : 'baru'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {item.lastError && (
              <Badge variant="error" size="xs">Error</Badge>
            )}
            <Badge
              variant={item.status === 'PENDING' ? 'warning' : item.status === 'FAILED' ? 'error' : 'success'}
              size="xs"
            >
              {item.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

```

---

### File: `src/components/ui/Alert.tsx`

```typescript
import { clsx } from 'clsx'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const ICONS: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
}

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div role="alert" className={clsx('alert', `alert-${variant}`, className)}>
      <span>{ICONS[variant]}</span>
      <div>
        {title && <h3 className="font-bold">{title}</h3>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}

```

---

### File: `src/components/ui/Badge.tsx`

```typescript
import { clsx } from 'clsx'

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'xs' | 'sm' | 'md' | 'lg'
  outline?: boolean
  className?: string
}

export function Badge({ children, variant = 'neutral', size, outline, className }: BadgeProps) {
  return (
    <span className={clsx(
      'badge',
      `badge-${variant}`,
      size && `badge-${size}`,
      outline && 'badge-outline',
      className,
    )}>
      {children}
    </span>
  )
}

```

---

### File: `src/components/ui/Button.tsx`

```typescript
'use client'
import { forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'error' | 'warning' | 'success'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  wide?: boolean
  outline?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, wide, outline, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'btn',
        variant && `btn-${variant}`,
        size !== 'md' && `btn-${size}`,
        wide && 'btn-wide',
        outline && 'btn-outline',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="loading loading-spinner loading-sm" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

```

---

### File: `src/components/ui/Card.tsx`

```typescript
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  compact?: boolean
  bordered?: boolean
}

export function Card({ children, className, compact, bordered }: CardProps) {
  return (
    <div className={clsx('card bg-base-100 shadow-sm', compact && 'card-compact', bordered && 'border border-base-300', className)}>
      <div className="card-body">{children}</div>
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={clsx('card-title', className)}>{children}</h2>
}

```

---

### File: `src/components/ui/Confirm.tsx`

```typescript
'use client'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'error' | 'warning' | 'primary'
  loading?: boolean
}

export function Confirm({
  open, onConfirm, onCancel, title = 'Konfirmasi',
  message, confirmLabel = 'Ya', cancelLabel = 'Batal',
  variant = 'primary', loading,
}: ConfirmProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <p className="mb-6 text-base-content/80">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

```

---

### File: `src/components/ui/Input.tsx`

```typescript
'use client'
import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  inputSize?: 'xs' | 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, inputSize = 'md', className, ...rest }, ref) => (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'input input-bordered w-full',
          inputSize !== 'md' && `input-${inputSize}`,
          error && 'input-error',
          className,
        )}
        {...rest}
      />
      {(error || hint) && (
        <label className="label">
          <span className={clsx('label-text-alt', error ? 'text-error' : 'text-base-content/60')}>
            {error ?? hint}
          </span>
        </label>
      )}
    </div>
  ),
)
Input.displayName = 'Input'

```

---

### File: `src/components/ui/Loading.tsx`

```typescript
import { clsx } from 'clsx'

interface LoadingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  type?: 'spinner' | 'dots' | 'ring' | 'bars'
  fullscreen?: boolean
  text?: string
}

export function Loading({ size = 'md', type = 'spinner', fullscreen, text }: LoadingProps) {
  const el = (
    <div className="flex flex-col items-center justify-center gap-3">
      <span className={clsx('loading', `loading-${type}`, `loading-${size}`, 'text-primary')} />
      {text && <p className="text-sm text-base-content/60">{text}</p>}
    </div>
  )
  if (fullscreen) return (
    <div className="flex min-h-screen items-center justify-center">{el}</div>
  )
  return el
}

```

---

### File: `src/components/ui/Modal.tsx`

```typescript
'use client'
import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
}

export function Modal({ open, onClose, title, children, size = 'md', closeOnBackdrop = true }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) ref.current?.showModal()
    else ref.current?.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onClose}
      onClick={closeOnBackdrop ? (e) => { if (e.target === ref.current) onClose() } : undefined}
    >
      <div className={clsx(
        'modal-box',
        size === 'sm' && 'max-w-sm',
        size === 'lg' && 'max-w-3xl',
        size === 'xl' && 'max-w-5xl',
      )}>
        {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
        <button className="btn btn-ghost btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>✕</button>
        {children}
      </div>
    </dialog>
  )
}

```

---

### File: `src/components/ui/Select.tsx`

```typescript
'use client'
import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...rest }, ref) => (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <select
        ref={ref}
        className={clsx('select select-bordered w-full', error && 'select-error', className)}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  ),
)
Select.displayName = 'Select'

```

---

### File: `src/components/ui/Spinner.tsx`

```typescript
import { clsx } from 'clsx'

export function Spinner({ className }: { className?: string }) {
  return <span className={clsx('loading loading-spinner', className)} />
}

```

---

### File: `src/components/ui/Table.tsx`

```typescript
import { clsx } from 'clsx'

interface Column<T> {
  key: string
  header: string
  render: (row: T, idx: number) => React.ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T, idx: number) => string
  loading?: boolean
  emptyText?: string
  className?: string
  zebra?: boolean
  compact?: boolean
}

export function Table<T>({
  columns, data, keyExtractor, loading, emptyText = 'Tidak ada data', className, zebra, compact,
}: TableProps<T>) {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className={clsx('table w-full', zebra && 'table-zebra', compact && 'table-compact')}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.className}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="py-8 text-center">
              <span className="loading loading-spinner loading-md" />
            </td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-8 text-center text-base-content/50">{emptyText}</td></tr>
          ) : (
            data.map((row, idx) => (
              <tr key={keyExtractor(row, idx)} className="hover">
                {columns.map(col => (
                  <td key={col.key} className={col.className}>{col.render(row, idx)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

```

---

### File: `src/components/ui/Tabs.tsx`

```typescript
'use client'
import { clsx } from 'clsx'

interface Tab {
  key: string
  label: string
  badge?: number
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
  variant?: 'boxed' | 'lifted' | 'bordered'
  className?: string
}

export function Tabs({ tabs, active, onChange, variant = 'bordered', className }: TabsProps) {
  return (
    <div role="tablist" className={clsx('tabs', `tabs-${variant}`, className)}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          role="tab"
          className={clsx('tab gap-2', active === tab.key && 'tab-active')}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className="badge badge-sm badge-primary">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  )
}

```

---

### File: `src/components/ui/Toast.tsx`

```typescript
'use client'
import { clsx } from 'clsx'
import { useUiStore } from '@/stores/ui.store'

const VARIANT_CLASS: Record<string, string> = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
}

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore()
  if (toasts.length === 0) return null

  return (
    <div className="toast toast-end toast-bottom z-50">
      {toasts.map(t => (
        <div
          key={t.id}
          role="alert"
          className={clsx('alert shadow-lg cursor-pointer animate-fade-in', VARIANT_CLASS[t.variant])}
          onClick={() => removeToast(t.id)}
        >
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

```

---

### File: `src/components/ui/Tooltip.tsx`

```typescript
import { clsx } from 'clsx'

interface TooltipProps {
  tip: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ tip, children, position = 'top', className }: TooltipProps) {
  return (
    <div className={clsx('tooltip', `tooltip-${position}`, className)} data-tip={tip}>
      {children}
    </div>
  )
}

```

---

### File: `src/hooks/use-auth.ts`

```typescript
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

```

---

### File: `src/hooks/use-auto-save.ts`

```typescript
'use client'
import { useCallback, useRef } from 'react'
import { useAnswerStore } from '@/stores/answer.store'
import { saveAnswerToLocal } from '@/lib/exam/auto-save'
import type { AnswerValue } from '@/types/answer'
import type { ID } from '@/types/common'

const DEBOUNCE_MS = 1500

// Utility debounce inline agar tidak circular import
function debounce<T extends (...args: Parameters<T>) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { fn(...args); timer = null }, delay)
  }
}

interface UseAutoSaveParams {
  attemptId: ID
  sessionId: ID
}

export function useAutoSave({ attemptId, sessionId }: UseAutoSaveParams) {
  const { setAnswer } = useAnswerStore()
  const isSavingRef = useRef(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (questionId: ID, answer: AnswerValue) => {
      if (isSavingRef.current) return
      isSavingRef.current = true
      try {
        await saveAnswerToLocal({ questionId, attemptId, sessionId, answer })
      } finally {
        isSavingRef.current = false
      }
    }, DEBOUNCE_MS),
    [attemptId, sessionId],
  )

  const saveAnswer = useCallback((questionId: ID, answer: AnswerValue) => {
    setAnswer(questionId, answer)   // optimistic update UI
    debouncedSave(questionId, answer)
  }, [setAnswer, debouncedSave])

  return { saveAnswer, isSaving: isSavingRef.current }
}

```

---

### File: `src/hooks/use-device-warnings.ts`

```typescript
'use client'
import { useState, useEffect } from 'react'

interface DeviceWarnings {
  isStorageLow: boolean
  isOldBrowser: boolean
  warnings: string[]
}

const MIN_STORAGE_MB = Number(process.env.NEXT_PUBLIC_MIN_STORAGE_MB ?? 2048)

export function useDeviceWarnings(): DeviceWarnings {
  const [warnings, setWarnings] = useState<string[]>([])
  const [isStorageLow, setStorageLow] = useState(false)
  const [isOldBrowser, setOldBrowser] = useState(false)

  useEffect(() => {
    const w: string[] = []

    if (!window.crypto?.subtle) {
      w.push('Browser tidak mendukung Web Crypto API. Gunakan Chrome 80+ atau Firefox 90+.')
      setOldBrowser(true)
      setWarnings([...w])
      return
    }

    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(({ available }) => {
        if (available !== undefined && available < MIN_STORAGE_MB * 1024 * 1024) {
          const mb = Math.round(available / 1024 / 1024)
          const msg = `Penyimpanan tersedia hanya ${mb} MB. Harap kosongkan ruang minimal ${MIN_STORAGE_MB} MB.`
          w.push(msg)
          setStorageLow(true)
          setWarnings([...w])
        }
      })
    }

    setWarnings(w)
  }, [])

  return { isStorageLow, isOldBrowser, warnings }
}

```

---

### File: `src/hooks/use-exam.ts`

```typescript
'use client'
import { useExamStore, selectCurrentQuestion, selectTotalQuestions } from '@/stores/exam.store'
import { useAnswerStore, selectAnsweredCount } from '@/stores/answer.store'

export function useExam() {
  const exam = useExamStore()
  const answers = useAnswerStore()

  const currentQuestion = selectCurrentQuestion(exam)
  const totalQuestions = selectTotalQuestions(exam)
  const answeredCount = selectAnsweredCount(answers)

  return {
    ...exam,
    currentQuestion,
    totalQuestions,
    answeredCount,
    progressPercent: totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0,
  }
}

```

---

### File: `src/hooks/use-media-recorder.ts`

```typescript
'use client'
import { useState, useRef, useCallback } from 'react'
import type { RecordingResult } from '@/types/media'

interface UseMediaRecorderOptions {
  mimeType?: string
  maxDurationMs?: number
  onStop?: (result: RecordingResult) => void
}

export function useMediaRecorder(opts: UseMediaRecorderOptions = {}) {
  const {
    mimeType = 'audio/webm;codecs=opus',
    maxDurationMs = Number(process.env.NEXT_PUBLIC_MAX_RECORDING_DURATION ?? 300) * 1000,
    onStop,
  } = opts

  const [isRecording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onStopRef = useRef(onStop)
  onStopRef.current = onStop

  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    recorderRef.current?.stop()
  }, [])

  const start = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
        onStopRef.current?.({ blob, mimeType, duration, size: blob.size })
        setRecording(false)
      }

      recorder.start(1000)
      recorderRef.current = recorder
      startTimeRef.current = Date.now()
      setRecording(true)

      timeoutRef.current = setTimeout(() => stop(), maxDurationMs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengakses mikrofon')
    }
  }, [mimeType, maxDurationMs, stop])

  return { isRecording, error, start, stop }
}

```

---

### File: `src/hooks/use-online-status.ts`

```typescript
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

```

---

### File: `src/hooks/use-powersync.ts`

```typescript
'use client'
import { useCallback } from 'react'
import { useSyncStore } from '@/stores/sync.store'
import { getPendingSyncItems, updateSyncItemStatus, incrementRetry } from '@/lib/db/queries'
import { syncApi } from '@/lib/api/sync.api'
import type { ID } from '@/types/common'

const MAX_BATCH = 20

export function usePowerSync(attemptId: ID) {
  const sync = useSyncStore()

  const flush = useCallback(async () => {
    if (sync.isSyncing) return
    const items = await getPendingSyncItems()
    if (items.length === 0) return

    sync.setSyncing(true)
    const batch = items.slice(0, MAX_BATCH)

    try {
      await syncApi.pushBatch({
        batch: batch.map(item => ({
          type: item.type,
          attemptId,
          idempotencyKey: item.idempotencyKey,
          payload: item.payload,
        })),
      })
      await Promise.all(
        batch.map(item =>
          item.id !== undefined ? updateSyncItemStatus(item.id, 'COMPLETED') : Promise.resolve(),
        ),
      )
      sync.setLastSync()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync error'
      await Promise.all(
        batch.map(item =>
          item.id !== undefined ? incrementRetry(item.id, msg) : Promise.resolve(),
        ),
      )
      sync.setError(msg)
    } finally {
      sync.setSyncing(false)
      const remaining = await getPendingSyncItems()
      sync.setPending(remaining.length)
    }
  }, [attemptId, sync])

  return { flush }
}

```

---

### File: `src/hooks/use-sync-status.ts`

```typescript
'use client'
import { useSyncStore } from '@/stores/sync.store'
import { useOnlineStatus } from './use-online-status'

export function useSyncStatus() {
  const sync = useSyncStore()
  const isOnline = useOnlineStatus()

  return {
    ...sync,
    isOnline,
    canSync: isOnline && !sync.isSyncing && sync.pendingCount > 0,
  }
}

```

---

### File: `src/hooks/use-timer.ts`

```typescript
'use client'
import { useEffect, useRef } from 'react'
import { useTimerStore, selectFormattedTime, selectIsWarning } from '@/stores/timer.store'

interface UseTimerParams {
  durationSeconds: number
  startedAt: number   // Date.now() dari attempt.startedAt
  onExpire?: () => void
}

export function useTimer({ durationSeconds, startedAt, onExpire }: UseTimerParams) {
  const store = useTimerStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000)
    store.start(durationSeconds, elapsed)

    intervalRef.current = setInterval(() => {
      const { isRunning, isExpired } = useTimerStore.getState()
      if (!isRunning || isExpired) {
        clearInterval(intervalRef.current!)
        return
      }
      useTimerStore.getState().tick()
      if (useTimerStore.getState().isExpired) onExpireRef.current?.()
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds, startedAt])

  return {
    remainingSeconds: store.remainingSeconds,
    formatted: selectFormattedTime(store),
    isWarning: selectIsWarning(store),
    isExpired: store.isExpired,
  }
}

```

---

### File: `src/hooks/use-toast.ts`

```typescript
'use client'
import { useCallback } from 'react'
import { useUiStore } from '@/stores/ui.store'
import type { ToastVariant } from '@/stores/ui.store'

const DEFAULT_DURATION = 4000

export function useToast() {
  const { addToast, removeToast } = useUiStore()

  const toast = useCallback((msg: string, variant: ToastVariant = 'info', duration = DEFAULT_DURATION) => {
    const id = addToast({ message: msg, variant, duration })
    if (duration > 0) setTimeout(() => removeToast(id), duration)
    return id
  }, [addToast, removeToast])

  return {
    toast,
    success: (msg: string) => toast(msg, 'success'),
    error: (msg: string) => toast(msg, 'error'),
    warning: (msg: string) => toast(msg, 'warning'),
    info: (msg: string) => toast(msg, 'info'),
  }
}

```

---

### File: `src/lib/api/analytics.api.ts`

```typescript
import { apiGet } from './client'
import type { ID } from '@/types/common'

export const analyticsApi = {
  getDashboard: () =>
    apiGet<Record<string, unknown>>('analytics/dashboard'),

  getSessionStats: (sessionId: ID) =>
    apiGet<Record<string, unknown>>(`analytics/sessions/${sessionId}`),

  getPackageStats: (packageId: ID) =>
    apiGet<Record<string, unknown>>(`analytics/packages/${packageId}`),
}

```

---

### File: `src/lib/api/auth.api.ts`

```typescript
import { apiPost } from './client'
import type { AuthUser } from '@/types/user'

export interface LoginPayload {
  username: string
  password: string
  fingerprint: string
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Login gagal')
      }
      return res.json() as Promise<LoginResponse>
    }),

  logout: () =>
    fetch('/api/auth/logout', { method: 'POST' }).then(() => undefined),

  refresh: () =>
    fetch('/api/auth/refresh', { method: 'POST' }).then(async (res) => {
      if (!res.ok) throw new Error('Token expired')
      return res.json() as Promise<{ accessToken: string }>
    }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiPost<void>('auth/change-password', payload),

  me: () => apiPost<AuthUser>('auth/me', {}),
}

```

---

### File: `src/lib/api/client.ts`

```typescript
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

```

---

### File: `src/lib/api/exam-packages.api.ts`

```typescript
import { apiGet, apiPost, apiPatch } from './client'
import type { ExamPackage } from '@/types/exam'
import type { ID } from '@/types/common'
import type { PaginatedApiResponse, BaseQueryParams } from '@/types/api'

export interface CreatePackagePayload {
  title: string
  description?: string
  subjectId?: ID
  settings: ExamPackage['settings']
  questionIds?: Array<{ questionId: ID; order: number; points?: number }>
}

export const examPackagesApi = {
  list: (params?: BaseQueryParams) =>
    apiGet<PaginatedApiResponse<ExamPackage>>('exam-packages', {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getById: (id: ID) => apiGet<ExamPackage>(`exam-packages/${id}`),

  create: (payload: CreatePackagePayload) =>
    apiPost<ExamPackage>('exam-packages', payload),

  update: (id: ID, payload: Partial<CreatePackagePayload>) =>
    apiPatch<ExamPackage>(`exam-packages/${id}`, payload),

  addQuestions: (id: ID, questions: CreatePackagePayload['questionIds']) =>
    apiPost<void>(`exam-packages/${id}/questions`, { questions }),

  publish: (id: ID) => apiPost<ExamPackage>(`exam-packages/${id}/publish`, {}),

  getItemAnalysis: (id: ID) =>
    apiGet<Record<string, unknown>>(`exam-packages/${id}/item-analysis`),
}

```

---

### File: `src/lib/api/grading.api.ts`

```typescript
import { apiGet, apiPost } from './client'
import type { GradeAnswerPayload, ManualGradingItem } from '@/types/answer'
import type { ExamAttempt } from '@/types/exam'
import type { GradingStatus, ID } from '@/types/common'
import type { PaginatedApiResponse, BaseQueryParams } from '@/types/api'

export interface GradingQueryParams extends BaseQueryParams {
  status?: GradingStatus
  sessionId?: ID
}

export interface PublishResultPayload {
  attemptId: ID
}

export const gradingApi = {
  listPending: (params?: GradingQueryParams) =>
    apiGet<PaginatedApiResponse<ManualGradingItem>>('grading', {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  gradeAnswer: (payload: GradeAnswerPayload) =>
    apiPost<void>('grading/answer', payload),

  completeGrading: (attemptId: ID) =>
    apiPost<ExamAttempt>('grading/complete', { attemptId }),

  publishResult: (payload: PublishResultPayload) =>
    apiPost<ExamAttempt>('grading/publish', payload),
}

```

---

### File: `src/lib/api/media.api.ts`

```typescript
import { apiGet } from './client'
import type { MediaUploadResponse, PresignedUrlResponse } from '@/types/media'

export const mediaApi = {
  upload: (formData: FormData) =>
    fetch('/api/media', { method: 'POST', body: formData })
      .then(async (r) => {
        if (!r.ok) throw new Error('Upload gagal')
        return r.json() as Promise<MediaUploadResponse>
      }),

  getPresignedUrl: (objectKey: string) =>
    apiGet<PresignedUrlResponse>(`media/presigned?key=${encodeURIComponent(objectKey)}`),

  uploadChunk: (formData: FormData) =>
    fetch('/api/sync', { method: 'POST', body: formData })
      .then(async (r) => {
        if (!r.ok) throw new Error('Chunk upload gagal')
        return r.json() as Promise<{ objectKey?: string }>
      }),
}

```

---

### File: `src/lib/api/monitoring.api.ts`

```typescript
import { apiGet } from './client'
import type { ActivitySummary } from '@/types/activity'
import type { ID } from '@/types/common'

export const monitoringApi = {
  getSessionStatus: (sessionId: ID) =>
    apiGet<Record<string, unknown>>(`monitoring/sessions/${sessionId}`),

  getActivitySummaries: (sessionId: ID) =>
    apiGet<ActivitySummary[]>(`monitoring/sessions/${sessionId}/activities`),

  getAttemptLogs: (attemptId: ID) =>
    apiGet<ActivitySummary>(`monitoring/attempts/${attemptId}/logs`),
}

```

---

### File: `src/lib/api/questions.api.ts`

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type { Question, QuestionTag } from '@/types/question'
import type { QuestionType, QuestionStatus, ID } from '@/types/common'
import type { PaginatedApiResponse, BaseQueryParams } from '@/types/api'

export interface QuestionQueryParams extends BaseQueryParams {
  subjectId?: ID
  type?: QuestionType
  status?: QuestionStatus
  tagIds?: ID[]
  difficulty?: number
}

export interface CreateQuestionPayload {
  subjectId: ID
  type: QuestionType
  content: Question['content']
  options?: Question['options']
  correctAnswer: unknown
  points?: number
  difficulty?: number
  tagIds?: ID[]
}

export const questionsApi = {
  list: (params?: QuestionQueryParams) =>
    apiGet<PaginatedApiResponse<Question>>('questions', {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getById: (id: ID) => apiGet<Question>(`questions/${id}`),

  create: (payload: CreateQuestionPayload) =>
    apiPost<Question>('questions', payload),

  update: (id: ID, payload: Partial<CreateQuestionPayload>) =>
    apiPatch<Question>(`questions/${id}`, payload),

  approve: (id: ID) => apiPost<Question>(`questions/${id}/approve`, {}),

  delete: (id: ID) => apiDelete<void>(`questions/${id}`),

  importBulk: (formData: FormData) =>
    apiPost<{ imported: number; failed: number }>('questions/import', formData),

  listTags: () => apiGet<QuestionTag[]>('question-tags'),

  createTag: (name: string) => apiPost<QuestionTag>('question-tags', { name }),
}

```

---

### File: `src/lib/api/sessions.api.ts`

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type { ExamSession, SessionStudent } from '@/types/exam'
import type { ID } from '@/types/common'
import type { PaginatedApiResponse, BaseQueryParams } from '@/types/api'

export interface CreateSessionPayload {
  examPackageId: ID
  roomId?: ID
  title: string
  startTime: string
  endTime: string
}

export const sessionsApi = {
  list: (params?: BaseQueryParams) =>
    apiGet<PaginatedApiResponse<ExamSession>>('sessions', {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getById: (id: ID) => apiGet<ExamSession>(`sessions/${id}`),

  create: (payload: CreateSessionPayload) =>
    apiPost<ExamSession>('sessions', payload),

  update: (id: ID, payload: Partial<CreateSessionPayload>) =>
    apiPatch<ExamSession>(`sessions/${id}`, payload),

  activate: (id: ID) => apiPost<ExamSession>(`sessions/${id}/activate`, {}),

  pause: (id: ID) => apiPost<ExamSession>(`sessions/${id}/pause`, {}),

  complete: (id: ID) => apiPost<ExamSession>(`sessions/${id}/complete`, {}),

  assignStudents: (id: ID, payload: { userIds: ID[] }) =>
    apiPost<SessionStudent[]>(`sessions/${id}/students`, payload),

  getStudents: (id: ID) => apiGet<SessionStudent[]>(`sessions/${id}/students`),

  removeStudent: (sessionId: ID, userId: ID) =>
    apiDelete<void>(`sessions/${sessionId}/students/${userId}`),
}

```

---

### File: `src/lib/api/submissions.api.ts`

```typescript
import { apiGet, apiPost } from './client'
import type { ExamAttempt, ExamResult, EncryptedExamPackage } from '@/types/exam'
import type { SubmitAnswerPayload } from '@/types/answer'
import type { ID } from '@/types/common'

export interface StartAttemptPayload {
  tokenCode: string
  idempotencyKey: string
  deviceFingerprint: string
}

export interface StartAttemptResponse {
  attempt: ExamAttempt
  encryptedPackage: EncryptedExamPackage
  sessionKey: string
}

export interface SubmitExamPayload {
  attemptId: ID
  idempotencyKey: string
}

export const submissionsApi = {
  startAttempt: (payload: StartAttemptPayload) =>
    apiPost<StartAttemptResponse>('student/download', payload),

  submitAnswer: (payload: SubmitAnswerPayload) =>
    apiPost<void>('student/answers', payload),

  submitExam: (payload: SubmitExamPayload) =>
    apiPost<ExamAttempt>('student/submit', payload),

  getResult: (attemptId: ID) =>
    apiGet<ExamResult>(`student/result/${attemptId}`),

  getAttempts: () => apiGet<ExamAttempt[]>('student/attempts'),
}

```

---

### File: `src/lib/api/sync.api.ts`

```typescript
import { apiGet, apiPost } from './client'
import type { PowerSyncBatch } from '@/types/sync'
import type { ID } from '@/types/common'

export const syncApi = {
  pushBatch: (batch: PowerSyncBatch) =>
    apiPost<{ processed: number; failed: number }>('sync', batch),

  getStatus: (attemptId: ID) =>
    apiGet<{ pending: number; failed: number; lastProcessed: string | null }>(
      `sync/status/${attemptId}`,
    ),

  powersyncPush: (batch: PowerSyncBatch) =>
    apiPost<void>('powersync/data', batch),
}

```

---

### File: `src/lib/crypto/aes-gcm.ts`

```typescript
/**
 * AES-256-GCM via Web Crypto API.
 * Key hanya hidup di memori (CryptoKey object) — tidak pernah dieksport ke string
 * kecuali untuk transport saat key-exchange awal.
 */

const ALGO = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12   // bytes — rekomendasi NIST untuk GCM

// ── Key generation & import ───────────────────────────────────────────────────

/**
 * Generate CryptoKey baru (hanya untuk testing / key-exchange).
 * Di production, key diterima dari server dalam paket download.
 */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGO, length: KEY_LENGTH },
    true,    // extractable — hanya untuk initial export ke server
    ['encrypt', 'decrypt'],
  )
}

/**
 * Import raw key dari bytes (diterima dari server dalam paket download).
 * Setelah diimport, CryptoKey tidak bisa dieksport kembali (extractable: false).
 */
export async function importKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: ALGO, length: KEY_LENGTH },
    false,   // non-extractable — tidak bisa keluar dari memori
    ['decrypt'],
  )
}

/**
 * Import key dari base64 string (format transport dari server).
 */
export async function importKeyFromBase64(b64: string): Promise<CryptoKey> {
  const raw = base64ToBuffer(b64)
  return importKey(raw)
}

// ── Encrypt ───────────────────────────────────────────────────────────────────

export interface EncryptResult {
  ciphertext: ArrayBuffer
  iv: Uint8Array
}

export async function encrypt(key: CryptoKey, plaintext: string): Promise<EncryptResult> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded)
  return { ciphertext, iv }
}

export async function encryptToBase64(
  key: CryptoKey,
  plaintext: string,
): Promise<{ ciphertext: string; iv: string }> {
  const { ciphertext, iv } = await encrypt(key, plaintext)
  return { ciphertext: bufferToBase64(ciphertext), iv: bufferToBase64(iv) }
}

// ── Decrypt ───────────────────────────────────────────────────────────────────

export async function decrypt(
  key: CryptoKey,
  ciphertext: ArrayBuffer,
  iv: Uint8Array,
): Promise<string> {
  const plain = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext)
  return new TextDecoder().decode(plain)
}

export async function decryptFromBase64(
  key: CryptoKey,
  ciphertextB64: string,
  ivB64: string,
): Promise<string> {
  const ciphertext = base64ToBuffer(ciphertextB64)
  const iv = new Uint8Array(base64ToBuffer(ivB64))
  return decrypt(key, ciphertext, iv)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function bufferToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str)
}

export function base64ToBuffer(b64: string): ArrayBuffer {
  const str = atob(b64)
  const buf = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i)
  return buf.buffer
}

```

---

### File: `src/lib/crypto/checksum.ts`

```typescript
/**
 * SHA-256 checksum via Web Crypto API.
 * Digunakan untuk validasi integritas paket ujian setelah download.
 */

import { bufferToBase64 } from './aes-gcm'

export async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function sha256Base64(data: string | ArrayBuffer): Promise<string> {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return bufferToBase64(hash)
}

/**
 * Validasi hash paket ujian yang didownload vs hash yang diterima dari server.
 * Melempar Error jika tidak cocok.
 */
export async function validatePackageHash(
  encryptedData: string,
  expectedHash: string,
): Promise<void> {
  const actual = await sha256Hex(encryptedData)
  if (actual !== expectedHash) {
    throw new Error(`Package hash mismatch. Expected: ${expectedHash}, got: ${actual}`)
  }
}

/**
 * Fingerprint device — SHA-256 dari kombinasi browser properties.
 * Digunakan oleh DeviceGuard untuk verifikasi perangkat.
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency?.toString() ?? '',
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform ?? '',
  ].join('|')

  return sha256Hex(components)
}

```

---

### File: `src/lib/crypto/key-manager.ts`

```typescript
/**
 * Key manager — menyimpan CryptoKey di memori selama sesi aktif.
 * Key TIDAK pernah keluar dari object ini ke localStorage/IndexedDB/Zustand persist.
 *
 * Lifecycle:
 *   1. Server kirim rawKey (base64) dalam response download paket.
 *   2. importKeyFromBase64() → CryptoKey (non-extractable).
 *   3. Key disimpan di Map ini; dipakai decrypt paket & jawaban.
 *   4. clearKey() dipanggil saat tab ditutup / logout / submit selesai.
 */

import { importKeyFromBase64 } from './aes-gcm'

type SessionId = string

const _keys = new Map<SessionId, CryptoKey>()

export const keyManager = {
  /**
   * Set key untuk session tertentu dari base64 string (dari server).
   */
  async set(sessionId: SessionId, rawKeyB64: string): Promise<void> {
    const key = await importKeyFromBase64(rawKeyB64)
    _keys.set(sessionId, key)
  },

  /**
   * Ambil key untuk session. Throws jika tidak ada (sesi tidak valid).
   */
  get(sessionId: SessionId): CryptoKey {
    const key = _keys.get(sessionId)
    if (!key) throw new Error(`No active key for session: ${sessionId}`)
    return key
  },

  has(sessionId: SessionId): boolean {
    return _keys.has(sessionId)
  },

  /**
   * Hapus key saat sesi berakhir (submit / logout / timeout).
   */
  clear(sessionId: SessionId): void {
    _keys.delete(sessionId)
  },

  clearAll(): void {
    _keys.clear()
  },
}

// Auto-clear saat tab ditutup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => keyManager.clearAll())
}

```

---

### File: `src/lib/db/db.ts`

```typescript
import Dexie, { type Table } from 'dexie'
import { DB_NAME, DB_VERSION, DB_SCHEMA } from './schema'
import type { StoredExamPackage } from './schema'
import type { LocalAnswer } from '@/types/answer'
import type { LocalActivityLog } from '@/types/activity'
import type { LocalSyncItem } from '@/types/sync'
import type { LocalMediaBlob } from '@/types/media'

export class ExamDatabase extends Dexie {
  examPackages!: Table<StoredExamPackage, string>   // PK: sessionId
  answers!: Table<LocalAnswer, number>               // PK: ++id
  activityLogs!: Table<LocalActivityLog, number>
  syncQueue!: Table<LocalSyncItem, number>
  mediaBlobs!: Table<LocalMediaBlob, number>

  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores(DB_SCHEMA)
  }
}

// Singleton — satu instance per tab
let _db: ExamDatabase | null = null

export function getDb(): ExamDatabase {
  if (!_db) _db = new ExamDatabase()
  return _db
}

// Untuk test teardown
export async function closeDb(): Promise<void> {
  if (_db) {
    _db.close()
    _db = null
  }
}

```

---

### File: `src/lib/db/migrations.ts`

```typescript
/**
 * Dexie version migrations.
 * Setiap upgrade() dipanggil saat DB_VERSION naik.
 * Jangan hapus entry lama — Dexie butuh chain lengkap.
 */

import type { ExamDatabase } from './db'

export function applyMigrations(db: ExamDatabase): void {
  // v1 → initial schema (didefinisikan di schema.ts via version(1).stores())
  // Tidak ada migration logic di v1

  // Contoh v2 di masa depan:
  // db.version(2).stores({ ...DB_SCHEMA, newTable: '++id, field' }).upgrade(tx => {
  //   return tx.table('answers').toCollection().modify(ans => { ans.newField = 'default' })
  // })
}

```

---

### File: `src/lib/db/queries.ts`

```typescript
/**
 * Query helpers Dexie — satu tempat untuk semua operasi IndexedDB.
 * Semua fungsi menerima db instance (memudahkan testing dengan mock db).
 */

import type { ExamDatabase, StoredExamPackage } from './schema'
import type { LocalAnswer, SubmitAnswerPayload } from '@/types/answer'
import type { LocalActivityLog } from '@/types/activity'
import type { LocalSyncItem } from '@/types/sync'
import type { LocalMediaBlob } from '@/types/media'
import type { SyncStatus } from '@/types/common'
import { getDb } from './db'

const db = () => getDb()

// ── examPackages ──────────────────────────────────────────────────────────────

export async function saveExamPackage(pkg: StoredExamPackage): Promise<void> {
  await db().examPackages.put(pkg)
}

export async function getExamPackage(sessionId: string): Promise<StoredExamPackage | undefined> {
  return db().examPackages.get(sessionId)
}

export async function deleteExamPackage(sessionId: string): Promise<void> {
  await db().examPackages.delete(sessionId)
}

export async function purgeExpiredPackages(): Promise<number> {
  const now = Date.now()
  return db().examPackages.where('expiresAt').below(now).delete()
}

// ── answers ───────────────────────────────────────────────────────────────────

export async function upsertAnswer(ans: Omit<LocalAnswer, 'id'>): Promise<number> {
  const existing = await db().answers
    .where('[attemptId+questionId]')
    .equals([ans.attemptId, ans.questionId])
    .first()

  if (existing?.id !== undefined) {
    await db().answers.update(existing.id, { ...ans, savedAt: Date.now() })
    return existing.id
  }
  return db().answers.add({ ...ans, savedAt: Date.now() })
}

export async function getAnswersByAttempt(attemptId: string): Promise<LocalAnswer[]> {
  return db().answers.where('attemptId').equals(attemptId).toArray()
}

export async function getUnsyncedAnswers(attemptId: string): Promise<LocalAnswer[]> {
  return db().answers
    .where('[attemptId+questionId]')
    .between([attemptId, Dexie.minKey], [attemptId, Dexie.maxKey])
    .filter(a => !a.synced)
    .toArray()
}

export async function markAnswerSynced(id: number): Promise<void> {
  await db().answers.update(id, { synced: true })
}

export async function clearAnswers(attemptId: string): Promise<void> {
  await db().answers.where('attemptId').equals(attemptId).delete()
}

// ── activityLogs ──────────────────────────────────────────────────────────────

export async function addActivityLog(log: Omit<LocalActivityLog, 'id'>): Promise<number> {
  return db().activityLogs.add(log)
}

export async function getUnsyncedLogs(attemptId: string): Promise<LocalActivityLog[]> {
  return db().activityLogs
    .where('attemptId').equals(attemptId)
    .filter(l => !l.synced)
    .toArray()
}

export async function markLogsSynced(ids: number[]): Promise<void> {
  await db().activityLogs.bulkUpdate(ids.map(id => ({ key: id, changes: { synced: true } })))
}

// ── syncQueue ─────────────────────────────────────────────────────────────────

export async function enqueueSyncItem(item: Omit<LocalSyncItem, 'id'>): Promise<number> {
  return db().syncQueue.add(item)
}

export async function getPendingSyncItems(): Promise<LocalSyncItem[]> {
  return db().syncQueue
    .where('status').equals('PENDING' satisfies SyncStatus)
    .toArray()
}

export async function updateSyncItemStatus(
  id: number,
  status: SyncStatus,
  error?: string,
): Promise<void> {
  await db().syncQueue.update(id, {
    status,
    ...(error ? { lastError: error } : {}),
    ...(status === 'COMPLETED' ? { processedAt: Date.now() } : {}),
  })
}

export async function incrementRetry(id: number, error: string): Promise<void> {
  const item = await db().syncQueue.get(id)
  if (!item) return
  const newCount = item.retryCount + 1
  await db().syncQueue.update(id, {
    retryCount: newCount,
    lastError: error,
    status: newCount >= item.retryCount ? ('FAILED' satisfies SyncStatus) : item.status,
  })
}

// ── mediaBlobs ────────────────────────────────────────────────────────────────

export async function saveMediaBlob(blob: Omit<LocalMediaBlob, 'id'>): Promise<number> {
  return db().mediaBlobs.add(blob)
}

export async function getUnuploadedBlobs(attemptId: string): Promise<LocalMediaBlob[]> {
  return db().mediaBlobs
    .where('attemptId').equals(attemptId)
    .filter(b => !b.uploaded)
    .toArray()
}

export async function markBlobUploaded(id: number, objectKey: string): Promise<void> {
  await db().mediaBlobs.update(id, { uploaded: true, objectKey })
}

export async function clearSessionData(sessionId: string): Promise<void> {
  await Promise.all([
    db().answers.where('sessionId').equals(sessionId).delete(),
    db().activityLogs.where('sessionId').equals(sessionId).delete(),
    db().mediaBlobs.where('sessionId').equals(sessionId).delete(),
  ])
}

// Dexie import untuk minKey/maxKey
import Dexie from 'dexie'

```

---

### File: `src/lib/db/schema.ts`

```typescript
/**
 * Dexie table definitions — IndexedDB schema untuk offline-first flow.
 * Tabel ini menyimpan data LOKAL; tidak pernah menyimpan key enkripsi.
 */

import type { LocalAnswer } from '@/types/answer'
import type { LocalActivityLog } from '@/types/activity'
import type { LocalSyncItem } from '@/types/sync'
import type { LocalMediaBlob } from '@/types/media'
import type { DecryptedExamPackage } from '@/types/exam'

// ── Tipe tambahan untuk IndexedDB ─────────────────────────────────────────────

export interface StoredExamPackage {
  sessionId: string
  attemptId: string
  packageHash: string
  encryptedData: string   // ciphertext — dekripsi saat sesi aktif, tidak pernah disimpan plain
  iv: string
  expiresAt: number       // Date.now() + TTL
  storedAt: number
}

// ── Nama tabel Dexie ─────────────────────────────────────────────────────────

export type DexieTables = {
  examPackages: StoredExamPackage
  answers: LocalAnswer
  activityLogs: LocalActivityLog
  syncQueue: LocalSyncItem
  mediaBlobs: LocalMediaBlob
}

// ── Index definition string per tabel ────────────────────────────────────────
// Format Dexie: "primaryKey, [compound], index1, index2"

export const DB_SCHEMA = {
  examPackages: 'sessionId, attemptId, packageHash, expiresAt',
  answers: '++id, [attemptId+questionId], questionId, sessionId, synced, savedAt',
  activityLogs: '++id, attemptId, sessionId, type, synced, timestamp',
  syncQueue: '++id, idempotencyKey, status, type, createdAt, retryCount',
  mediaBlobs: '++id, [attemptId+questionId], sessionId, uploaded, recordedAt',
} as const satisfies Record<keyof DexieTables, string>

export const DB_NAME = 'exam_offline_db'
export const DB_VERSION = 1

```

---

### File: `src/lib/exam/activity-logger.ts`

```typescript
/**
 * Activity logger — merekam event tab blur, copy-paste, idle ke IndexedDB.
 * Dipanggil dari ActivityLogger component dan useExam hook.
 */

import { addActivityLog } from '@/lib/db/queries'
import { enqueueSyncItem } from '@/lib/db/queries'
import type { ActivityLogType, LocalActivityLog } from '@/types'
import type { ID } from '@/types/common'
import { v4 as uuidv4 } from 'uuid'

export interface LogActivityParams {
  attemptId: ID
  sessionId: ID
  type: ActivityLogType
  metadata?: Record<string, unknown>
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  const { attemptId, sessionId, type, metadata } = params

  const log: Omit<LocalActivityLog, 'id'> = {
    attemptId,
    sessionId,
    type,
    metadata,
    timestamp: Date.now(),
    synced: false,
  }

  await addActivityLog(log)

  // Enqueue ke syncQueue untuk dikirim ke server
  await enqueueSyncItem({
    idempotencyKey: uuidv4(),
    type: 'ACTIVITY_LOG',
    payload: { attemptId, type, metadata, timestamp: log.timestamp },
    status: 'PENDING',
    retryCount: 0,
    createdAt: Date.now(),
  })
}

/**
 * Setup event listeners untuk deteksi aktivitas mencurigakan.
 * Mengembalikan cleanup function untuk dipanggil saat unmount.
 */
export function setupActivityListeners(params: {
  attemptId: ID
  sessionId: ID
  onLog?: (type: ActivityLogType) => void
}): () => void {
  const { attemptId, sessionId, onLog } = params

  const log = (type: ActivityLogType, metadata?: Record<string, unknown>) => {
    void logActivity({ attemptId, sessionId, type, metadata })
    onLog?.(type)
  }

  // Tab visibility
  const onVisibilityChange = () => {
    if (document.hidden) log('tab_blur')
    else log('tab_focus')
  }

  // Paste detection
  const onPaste = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text')?.slice(0, 100)
    log('copy_paste', { preview: text })
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  document.addEventListener('paste', onPaste)

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    document.removeEventListener('paste', onPaste)
  }
}

```

---

### File: `src/lib/exam/auto-save.ts`

```typescript
/**
 * Auto-save logic — persist jawaban ke IndexedDB.
 * Dipanggil via debounce dari useAutoSave hook, bukan interval.
 */

import { upsertAnswer } from '@/lib/db/queries'
import type { LocalAnswer } from '@/types/answer'
import type { AnswerValue } from '@/types/answer'
import type { ID } from '@/types/common'
import { v4 as uuidv4 } from 'uuid'

export interface SaveAnswerParams {
  questionId: ID
  attemptId: ID
  sessionId: ID
  answer: AnswerValue
  mediaUrls?: string[]
  existingIdempotencyKey?: string  // reuse key jika sudah ada (update, bukan insert baru)
}

export async function saveAnswerToLocal(params: SaveAnswerParams): Promise<number> {
  const { questionId, attemptId, sessionId, answer, mediaUrls = [], existingIdempotencyKey } = params

  const record: Omit<LocalAnswer, 'id'> = {
    questionId,
    attemptId,
    sessionId,
    idempotencyKey: existingIdempotencyKey ?? uuidv4(),
    answer,
    mediaUrls,
    savedAt: Date.now(),
    synced: false,
  }

  return upsertAnswer(record)
}

/**
 * Debounce factory — returns fungsi yang menunda eksekusi selama `delay` ms.
 * Setiap panggilan baru membatalkan timer sebelumnya.
 */
export function createDebounce<T extends (...args: Parameters<T>) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

```

---

### File: `src/lib/exam/controller.ts`

```typescript
/**
 * Orchestrator untuk alur ujian siswa:
 * download → dekripsi → inisialisasi store → submit
 */

import { decryptExamPackage } from './package-decoder'
import { applyRandomization } from './randomizer'
import { saveAnswerToLocal } from './auto-save'
import { saveExamPackage } from '@/lib/db/queries'
import { submissionsApi } from '@/lib/api/submissions.api'
import { keyManager } from '@/lib/crypto/key-manager'
import { generateDeviceFingerprint } from '@/lib/crypto/checksum'
import type { DecryptedExamPackage } from '@/types/exam'
import type { ID } from '@/types/common'
import { v4 as uuidv4 } from 'uuid'

export interface StartExamResult {
  decryptedPackage: DecryptedExamPackage
  attemptId: ID
}

export async function startExam(tokenCode: string): Promise<StartExamResult> {
  const fingerprint = await generateDeviceFingerprint()

  // 1. Download paket + upsert attempt (idempoten)
  const { attempt, encryptedPackage, sessionKey } = await submissionsApi.startAttempt({
    tokenCode,
    idempotencyKey: uuidv4(),
    deviceFingerprint: fingerprint,
  })

  // 2. Simpan encrypted ke IndexedDB (untuk recovery offline)
  await saveExamPackage({
    sessionId: attempt.sessionId,
    attemptId: attempt.id,
    packageHash: encryptedPackage.packageHash,
    encryptedData: encryptedPackage.encryptedData,
    iv: encryptedPackage.iv,
    expiresAt: new Date(encryptedPackage.expiresAt).getTime(),
    storedAt: Date.now(),
  })

  // 3. Dekripsi di memori (key tidak pernah masuk IndexedDB)
  const decrypted = await decryptExamPackage(encryptedPackage, sessionKey)

  // 4. Terapkan pengacakan
  const shuffled = applyRandomization(decrypted.questions, decrypted.settings)

  return { decryptedPackage: { ...decrypted, questions: shuffled }, attemptId: attempt.id }
}

export async function submitExam(attemptId: ID): Promise<void> {
  await submissionsApi.submitExam({
    attemptId,
    idempotencyKey: uuidv4(),
  })
}

```

---

### File: `src/lib/exam/navigation.ts`

```typescript
import type { ExamQuestion } from '@/types/question'
import type { ID } from '@/types/common'

export interface NavigationState {
  currentIndex: number
  totalQuestions: number
  questionOrder: ID[]
}

export function canGoNext(s: NavigationState): boolean {
  return s.currentIndex < s.totalQuestions - 1
}

export function canGoPrev(s: NavigationState): boolean {
  return s.currentIndex > 0
}

export function getQuestionAtIndex(
  questions: ExamQuestion[],
  order: ID[],
  index: number,
): ExamQuestion | null {
  const id = order[index]
  return id ? (questions.find(q => q.id === id) ?? null) : null
}

export function getAnsweredFlags(
  questions: ExamQuestion[],
  answeredIds: Set<ID>,
): boolean[] {
  return questions.map(q => answeredIds.has(q.id))
}

```

---

### File: `src/lib/exam/package-decoder.ts`

```typescript
/**
 * Mendekripsi paket ujian terenkripsi dari server.
 * Hasil dekripsi hanya ada di memori — tidak pernah disimpan ke IndexedDB.
 */

import { decryptFromBase64 } from '@/lib/crypto/aes-gcm'
import { validatePackageHash } from '@/lib/crypto/checksum'
import { keyManager } from '@/lib/crypto/key-manager'
import type { EncryptedExamPackage, DecryptedExamPackage } from '@/types/exam'

export async function decryptExamPackage(
  encrypted: EncryptedExamPackage,
  sessionKey: string,     // base64 key dari server (response download)
): Promise<DecryptedExamPackage> {
  // 1. Validasi integritas paket sebelum dekripsi
  await validatePackageHash(encrypted.encryptedData, encrypted.packageHash)

  // 2. Import key ke memori (non-extractable CryptoKey)
  await keyManager.set(encrypted.sessionId, sessionKey)
  const key = keyManager.get(encrypted.sessionId)

  // 3. Dekripsi
  const plaintext = await decryptFromBase64(key, encrypted.encryptedData, encrypted.iv)
  const pkg = JSON.parse(plaintext) as DecryptedExamPackage

  return pkg
}

/**
 * Setelah paket didekripsi dan aktif di memori, panggil ini
 * untuk membersihkan key jika tidak butuh lagi
 * (key tetap dipertahankan selama sesi berlangsung untuk auto-save terenkripsi jika diperlukan)
 */
export function clearPackageKey(sessionId: string): void {
  keyManager.clear(sessionId)
}

```

---

### File: `src/lib/exam/randomizer.ts`

```typescript
/**
 * Fisher-Yates shuffle menggunakan crypto.getRandomValues untuk keacakan yang kuat.
 */

import type { ExamQuestion } from '@/types/question'
import type { MultipleChoiceOption } from '@/types/question'

function cryptoShuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    const j = buf[0]! % (i + 1)
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function shuffleQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  return cryptoShuffle(questions)
}

export function shuffleOptions(question: ExamQuestion): ExamQuestion {
  if (!question.options || !Array.isArray(question.options)) return question
  return {
    ...question,
    options: cryptoShuffle(question.options as MultipleChoiceOption[]),
  }
}

/**
 * Terapkan pengacakan sesuai settings paket ujian.
 * Dipanggil sekali setelah dekripsi — hasilnya disimpan sebagai questionOrder di exam store.
 */
export function applyRandomization(
  questions: ExamQuestion[],
  settings: { shuffleQuestions: boolean; shuffleOptions: boolean },
): ExamQuestion[] {
  let q = settings.shuffleQuestions ? shuffleQuestions(questions) : [...questions]
  if (settings.shuffleOptions) q = q.map(shuffleOptions)
  return q
}

```

---

### File: `src/lib/exam/timer.ts`

```typescript
export interface TimerConfig {
  durationSeconds: number
  startedAt: number        // Date.now() saat attempt dimulai
}

export function calcRemainingSeconds(config: TimerConfig): number {
  const elapsedMs = Date.now() - config.startedAt
  const elapsed = Math.floor(elapsedMs / 1000)
  return Math.max(0, config.durationSeconds - elapsed)
}

export function calcElapsedSeconds(startedAt: number): number {
  return Math.floor((Date.now() - startedAt) / 1000)
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

```

---

### File: `src/lib/exam/validator.ts`

```typescript
import type { DecryptedExamPackage } from '@/types/exam'
import type { AnswerValue } from '@/types/answer'
import type { QuestionType } from '@/types/common'

export interface ValidationError {
  questionId: string
  message: string
}

/** Validasi jawaban sebelum submit — cek kelengkapan minimum */
export function validateAnswers(
  pkg: DecryptedExamPackage,
  answers: Record<string, AnswerValue>,
): ValidationError[] {
  const errors: ValidationError[] = []

  for (const q of pkg.questions) {
    const ans = answers[q.id]
    if (ans === undefined || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
      // Essay dan short answer: skip warning (boleh kosong)
      if (q.type === 'ESSAY' || q.type === 'SHORT_ANSWER') continue
      errors.push({ questionId: q.id, message: 'Soal belum dijawab' })
    }
  }

  return errors
}

export function isAnswerEmpty(type: QuestionType, value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

```

---

### File: `src/lib/media/chunked-upload.ts`

```typescript
import { mediaApi } from '@/lib/api/media.api'

export async function uploadInChunks(
  blob: Blob,
  opts: { questionId: string; attemptId: string; onProgress?: (pct: number) => void },
): Promise<string> {
  const CHUNK = 512 * 1024   // 512 KB
  const total = Math.ceil(blob.size / CHUNK)
  let objectKey: string | null = null

  for (let i = 0; i < total; i++) {
    const chunk = blob.slice(i * CHUNK, (i + 1) * CHUNK)
    const fd = new FormData()
    fd.append('file', chunk)
    fd.append('questionId', opts.questionId)
    fd.append('attemptId', opts.attemptId)
    fd.append('chunkIndex', String(i))
    fd.append('totalChunks', String(total))
    fd.append('mimeType', blob.type)

    const res = await mediaApi.uploadChunk(fd) as { objectKey?: string }
    if (res.objectKey) objectKey = res.objectKey
    opts.onProgress?.(Math.round(((i + 1) / total) * 100))
  }

  if (!objectKey) throw new Error('Upload gagal: objectKey tidak diterima')
  return objectKey
}

```

---

### File: `src/lib/media/compress.ts`

```typescript
export { compressImage } from '@/lib/utils/compression'

```

---

### File: `src/lib/media/player.ts`

```typescript
import { mediaApi } from '@/lib/api/media.api'

const _cache = new Map<string, { url: string; expiresAt: number }>()

export async function getMediaUrl(objectKey: string): Promise<string> {
  const cached = _cache.get(objectKey)
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.url

  const { url, expiresAt } = await mediaApi.getPresignedUrl(objectKey)
  _cache.set(objectKey, { url, expiresAt: new Date(expiresAt).getTime() })
  return url
}

```

---

### File: `src/lib/media/recorder.ts`

```typescript
export interface RecorderOptions {
  audio?: boolean
  video?: boolean
  mimeType?: string
}

export function getSupportedMimeType(prefer: 'audio' | 'video'): string {
  const audio = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
  const video = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4']
  const list = prefer === 'audio' ? audio : video
  return list.find(t => MediaRecorder.isTypeSupported(t)) ?? list[0]!
}

```

---

### File: `src/lib/media/upload.ts`

```typescript
import { mediaApi } from '@/lib/api/media.api'
import { compressImage } from '@/lib/utils/compression'

export async function uploadImage(file: File, compress = true): Promise<string> {
  const blob = compress ? await compressImage(file) : file
  const fd = new FormData()
  fd.append('file', blob, file.name)
  const res = await mediaApi.upload(fd)
  return res.objectKey
}

```

---

### File: `src/lib/middleware/auth.middleware.ts`

```typescript
// Next.js middleware helper — digunakan di src/middleware.ts
import type { NextRequest } from 'next/server'

export function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

```

---

### File: `src/lib/middleware/role.middleware.ts`

```typescript
import type { UserRole } from '@/types/common'

export const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/guru': ['TEACHER', 'ADMIN', 'SUPERADMIN'],
  '/operator': ['OPERATOR', 'ADMIN', 'SUPERADMIN'],
  '/pengawas': ['SUPERVISOR', 'ADMIN', 'SUPERADMIN'],
  '/siswa': ['STUDENT'],
  '/superadmin': ['SUPERADMIN'],
}

export function hasRouteAccess(pathname: string, role: UserRole): boolean {
  const match = Object.entries(ROLE_ROUTES).find(([prefix]) => pathname.startsWith(`/${prefix.replace('/', '')}`))
  if (!match) return true   // route publik
  return match[1].includes(role)
}

```

---

### File: `src/lib/middleware/tenant.middleware.ts`

```typescript
import type { NextRequest } from 'next/server'

export function extractSubdomain(req: NextRequest): string | null {
  const host = req.headers.get('host') ?? ''
  const domain = process.env.NEXT_PUBLIC_TENANT_DOMAIN ?? 'exam.example.com'
  if (host === domain || host === `www.${domain}`) return null
  const sub = host.replace(`.${domain}`, '')
  return sub !== host ? sub : null
}

```

---

### File: `src/lib/offline/cache.ts`

```typescript
export { loadCachedPackage, cacheEncryptedPackage } from './download'

```

---

### File: `src/lib/offline/checksum.ts`

```typescript
export { validatePackageHash, sha256Hex } from '@/lib/crypto/checksum'

```

---

### File: `src/lib/offline/download.ts`

```typescript
import { saveExamPackage, getExamPackage, purgeExpiredPackages } from '@/lib/db/queries'
import { isExpired } from '@/lib/utils/time'
import type { EncryptedExamPackage } from '@/types/exam'
import type { StoredExamPackage } from '@/lib/db/schema'

export async function cacheEncryptedPackage(pkg: EncryptedExamPackage): Promise<void> {
  const stored: StoredExamPackage = {
    sessionId: pkg.sessionId,
    attemptId: pkg.attemptId,
    packageHash: pkg.packageHash,
    encryptedData: pkg.encryptedData,
    iv: pkg.iv,
    expiresAt: new Date(pkg.expiresAt).getTime(),
    storedAt: Date.now(),
  }
  await saveExamPackage(stored)
}

export async function loadCachedPackage(sessionId: string): Promise<StoredExamPackage | null> {
  const pkg = await getExamPackage(sessionId)
  if (!pkg) return null
  if (isExpired(pkg.expiresAt)) {
    await purgeExpiredPackages()
    return null
  }
  return pkg
}

```

---

### File: `src/lib/offline/queue.ts`

```typescript
import { enqueueSyncItem, getPendingSyncItems } from '@/lib/db/queries'
import { useSyncStore } from '@/stores/sync.store'
import type { SyncType, SyncPayload } from '@/types/sync'
import { v4 as uuidv4 } from 'uuid'

export async function enqueue(type: SyncType, payload: SyncPayload): Promise<void> {
  await enqueueSyncItem({
    idempotencyKey: uuidv4(),
    type,
    payload,
    status: 'PENDING',
    retryCount: 0,
    createdAt: Date.now(),
  })
  const items = await getPendingSyncItems()
  useSyncStore.getState().setPending(items.length)
}

```

---

### File: `src/lib/offline/sync.ts`

```typescript
import { getPendingSyncItems, updateSyncItemStatus, incrementRetry } from '@/lib/db/queries'
import { syncApi } from '@/lib/api/sync.api'
import { useSyncStore } from '@/stores/sync.store'
import { isOnline } from '@/lib/utils/network'
import type { ID } from '@/types/common'

export async function flushSyncQueue(attemptId: ID): Promise<void> {
  if (!isOnline()) return
  const sync = useSyncStore.getState()
  if (sync.isSyncing) return

  const items = await getPendingSyncItems()
  if (items.length === 0) return

  sync.setSyncing(true)
  try {
    const res = await syncApi.pushBatch({
      batch: items.slice(0, 20).map(i => ({
        type: i.type,
        attemptId,
        idempotencyKey: i.idempotencyKey,
        payload: i.payload,
      })),
    })

    await Promise.all(
      items.slice(0, 20).map(i =>
        i.id !== undefined ? updateSyncItemStatus(i.id, 'COMPLETED') : Promise.resolve(),
      ),
    )
    sync.setLastSync()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sync failed'
    sync.setError(msg)
  } finally {
    sync.setSyncing(false)
    const remaining = await getPendingSyncItems()
    sync.setPending(remaining.length)
  }
}

```

---

### File: `src/lib/utils/compression.ts`

```typescript
/**
 * Kompresi gambar di browser sebelum upload (Canvas API).
 */
export async function compressImage(
  file: File,
  opts: { maxWidthPx?: number; quality?: number } = {},
): Promise<Blob> {
  const { maxWidthPx = 1280, quality = 0.8 } = opts

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidthPx / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas 2D not supported')); return }

      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        quality,
      )
    }

    img.onerror = () => reject(new Error('Gagal memuat gambar'))
    img.src = url
  })
}

```

---

### File: `src/lib/utils/device.ts`

```typescript
export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

export function supportsWebCrypto(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}

export function supportsIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined'
}

export function supportsMediaRecorder(): boolean {
  return typeof MediaRecorder !== 'undefined'
}

```

---

### File: `src/lib/utils/error.ts`

```typescript
import { ApiError } from '@/types/api'

export function parseErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Terjadi kesalahan. Silakan coba lagi.'
}

export function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message === 'Failed to fetch') return true
  if (err instanceof Error && err.name === 'NetworkError') return true
  return false
}

```

---

### File: `src/lib/utils/format.ts`

```typescript
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export function formatDate(iso: string, fmt = 'dd MMM yyyy'): string {
  return format(parseISO(iso), fmt, { locale: localeId })
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy, HH:mm', { locale: localeId })
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: localeId })
}

export function formatScore(score: number | null, max: number | null): string {
  if (score === null || max === null) return '-'
  return `${score}/${max} (${Math.round((score / max) * 100)}%)`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

```

---

### File: `src/lib/utils/logger.ts`

```typescript
const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  debug: (...args: unknown[]) => { if (isDev) console.log('[DEBUG]', ...args) },
  warn: (...args: unknown[]) => console.warn('[WARN]', ...args),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args),
}

```

---

### File: `src/lib/utils/network.ts`

```typescript
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export async function checkConnectivity(url = '/api/health'): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}

```

---

### File: `src/lib/utils/time.ts`

```typescript
export function secondsToMinutes(s: number): number {
  return Math.floor(s / 60)
}

export function minutesToSeconds(m: number): number {
  return m * 60
}

export function isExpired(expiresAt: string | number): boolean {
  const ts = typeof expiresAt === 'string' ? new Date(expiresAt).getTime() : expiresAt
  return Date.now() > ts
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

```

---

### File: `src/middleware.ts`

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { extractSubdomain } from '@/lib/middleware/tenant.middleware'
import { hasRouteAccess } from '@/lib/middleware/role.middleware'
import type { UserRole } from '@/types/common'

// Decode JWT payload tanpa verify (verify dilakukan di backend)
function decodeJwtPayload(token: string): { role?: UserRole; exp?: number } | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip static files & Next internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Tambahkan subdomain sebagai header untuk server components
  const subdomain = extractSubdomain(req)
  const headers = new Headers(req.headers)
  if (subdomain) headers.set('x-tenant-subdomain', subdomain)

  // Auth check via cookie (access token disimpan di cookie httpOnly di Next.js API route)
  const token = req.cookies.get('access_token')?.value
  const isLoginPage = pathname === '/login'

  if (!token) {
    if (isLoginPage) return NextResponse.next({ request: { headers } })
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const payload = decodeJwtPayload(token)
  const isExpired = payload?.exp !== undefined && payload.exp * 1000 < Date.now()

  if (!payload || isExpired) {
    if (isLoginPage) return NextResponse.next()
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('access_token')
    return res
  }

  if (isLoginPage) {
    // Redirect ke dashboard sesuai role
    const dashboards: Record<UserRole, string> = {
      SUPERADMIN: '/superadmin/dashboard',
      ADMIN: '/superadmin/dashboard',
      TEACHER: '/guru/dashboard',
      OPERATOR: '/operator/dashboard',
      SUPERVISOR: '/pengawas/dashboard',
      STUDENT: '/siswa/dashboard',
    }
    return NextResponse.redirect(new URL(dashboards[payload.role ?? 'STUDENT'] ?? '/', req.url))
  }

  // RBAC check
  if (payload.role && !hasRouteAccess(pathname, payload.role)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

```

---

### File: `src/schemas/answer.schema.ts`

```typescript
import { z } from 'zod'

export const answerValueSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.record(z.string()),
])

export const submitAnswerSchema = z.object({
  attemptId: z.string().cuid(),
  questionId: z.string().cuid(),
  idempotencyKey: z.string().uuid(),
  answer: answerValueSchema,
  mediaUrls: z.array(z.string()).optional(),
})

export const gradeAnswerSchema = z.object({
  answerId: z.string().cuid(),
  score: z.number().min(0),
  feedback: z.string().optional(),
})

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>
export type GradeAnswerInput = z.infer<typeof gradeAnswerSchema>

```

---

### File: `src/schemas/auth.schema.ts`

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

```

---

### File: `src/schemas/exam.schema.ts`

```typescript
import { z } from 'zod'

export const examPackageSettingsSchema = z.object({
  duration: z.number().int().positive('Durasi harus lebih dari 0 menit'),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showResult: z.boolean().default(true),
  maxAttempts: z.number().int().min(1).default(1),
})

export const createExamPackageSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().optional(),
  subjectId: z.string().cuid().optional(),
  settings: examPackageSettingsSchema,
})

export const createSessionSchema = z.object({
  examPackageId: z.string().cuid(),
  roomId: z.string().cuid().optional(),
  title: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
}).refine(d => new Date(d.endTime) > new Date(d.startTime), {
  message: 'Waktu selesai harus setelah waktu mulai',
  path: ['endTime'],
})

export type CreateExamPackageInput = z.infer<typeof createExamPackageSchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>

```

---

### File: `src/schemas/question.schema.ts`

```typescript
import { z } from 'zod'
import { QUESTION_TYPES } from '@/types/common'

export const questionContentSchema = z.object({
  text: z.string().min(1, 'Konten soal wajib diisi'),
  images: z.array(z.string()).optional(),
  audio: z.string().optional(),
  video: z.string().optional(),
})

export const multipleChoiceOptionSchema = z.object({
  key: z.string(),
  text: z.string().min(1),
  imageUrl: z.string().optional(),
})

export const createQuestionSchema = z.object({
  subjectId: z.string().cuid(),
  type: z.enum(['MULTIPLE_CHOICE', 'COMPLEX_MULTIPLE_CHOICE', 'TRUE_FALSE', 'MATCHING', 'SHORT_ANSWER', 'ESSAY']),
  content: questionContentSchema,
  options: z.unknown().optional(),
  correctAnswer: z.unknown(),
  points: z.number().int().min(1).default(1),
  difficulty: z.number().int().min(1).max(5).default(1),
  tagIds: z.array(z.string().cuid()).optional(),
})

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>

```

---

### File: `src/schemas/sync.schema.ts`

```typescript
import { z } from 'zod'

export const syncItemSchema = z.object({
  type: z.enum(['SUBMIT_ANSWER', 'SUBMIT_EXAM', 'UPLOAD_MEDIA', 'ACTIVITY_LOG']),
  attemptId: z.string(),
  idempotencyKey: z.string().uuid(),
  payload: z.record(z.unknown()),
})

export const syncBatchSchema = z.object({
  batch: z.array(syncItemSchema).min(1).max(50),
})

export type SyncItemInput = z.infer<typeof syncItemSchema>

```

---

### File: `src/schemas/user.schema.ts`

```typescript
import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'TEACHER', 'SUPERVISOR', 'OPERATOR', 'STUDENT']),
})

export const updateUserSchema = createUserSchema.partial().omit({ password: true })

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

```

---

### File: `src/stores/activity.store.ts`

```typescript
import { create } from 'zustand'
import type { ActivityLogType, LocalActivityLog } from '@/types'

interface ActivityState {
  logs: LocalActivityLog[]
  tabBlurCount: number
  copyPasteCount: number
  idleCount: number
  isTabActive: boolean

  addLog: (log: Omit<LocalActivityLog, 'id' | 'synced'>) => void
  setTabActive: (v: boolean) => void
  clearLogs: () => void
}

export const useActivityStore = create<ActivityState>((set) => ({
  logs: [],
  tabBlurCount: 0,
  copyPasteCount: 0,
  idleCount: 0,
  isTabActive: true,

  addLog: (log) =>
    set(s => {
      const counter: Partial<Record<ActivityLogType, keyof ActivityState>> = {
        tab_blur: 'tabBlurCount',
        copy_paste: 'copyPasteCount',
        idle: 'idleCount',
      }
      const key = counter[log.type as ActivityLogType]
      return {
        logs: [...s.logs, { ...log, synced: false }],
        ...(key ? { [key]: (s[key] as number) + 1 } : {}),
      }
    }),

  setTabActive: (isTabActive) => set({ isTabActive }),

  clearLogs: () =>
    set({ logs: [], tabBlurCount: 0, copyPasteCount: 0, idleCount: 0 }),
}))

```

---

### File: `src/stores/answer.store.ts`

```typescript
import { create } from 'zustand'
import type { AnswerValue } from '@/types/answer'
import type { ID } from '@/types/common'

// State in-memory (Zustand) — sumber kebenaran untuk UI
// Persistensi ke IndexedDB dilakukan via useAutoSave / lib/exam/auto-save.ts
interface AnswerState {
  // Map questionId → answer value
  answers: Record<ID, AnswerValue>
  // Map questionId → array objectKey (MinIO) untuk media
  mediaUrls: Record<ID, string[]>
  // Map questionId → apakah sudah tersync ke server
  synced: Record<ID, boolean>
  // Timestamp terakhir save per questionId
  lastSavedAt: Record<ID, number>

  setAnswer: (questionId: ID, value: AnswerValue) => void
  setMediaUrls: (questionId: ID, urls: string[]) => void
  addMediaUrl: (questionId: ID, url: string) => void
  markSynced: (questionId: ID) => void
  markAllUnsynced: () => void
  getAnswer: (questionId: ID) => AnswerValue | undefined
  hasAnswer: (questionId: ID) => boolean
  clearAnswers: () => void
  // Inisialisasi dari IndexedDB saat resume
  hydrateFromLocal: (answers: Array<{ questionId: ID; answer: AnswerValue; mediaUrls: string[] }>) => void
}

export const useAnswerStore = create<AnswerState>((set, get) => ({
  answers: {},
  mediaUrls: {},
  synced: {},
  lastSavedAt: {},

  setAnswer: (questionId, value) =>
    set(s => ({
      answers: { ...s.answers, [questionId]: value },
      synced: { ...s.synced, [questionId]: false },
      lastSavedAt: { ...s.lastSavedAt, [questionId]: Date.now() },
    })),

  setMediaUrls: (questionId, urls) =>
    set(s => ({ mediaUrls: { ...s.mediaUrls, [questionId]: urls } })),

  addMediaUrl: (questionId, url) =>
    set(s => ({
      mediaUrls: {
        ...s.mediaUrls,
        [questionId]: [...(s.mediaUrls[questionId] ?? []), url],
      },
    })),

  markSynced: (questionId) =>
    set(s => ({ synced: { ...s.synced, [questionId]: true } })),

  markAllUnsynced: () =>
    set(s => ({
      synced: Object.fromEntries(Object.keys(s.answers).map(k => [k, false])),
    })),

  getAnswer: (questionId) => get().answers[questionId],

  hasAnswer: (questionId) => get().answers[questionId] !== undefined,

  clearAnswers: () =>
    set({ answers: {}, mediaUrls: {}, synced: {}, lastSavedAt: {} }),

  hydrateFromLocal: (items) =>
    set(() => ({
      answers: Object.fromEntries(items.map(i => [i.questionId, i.answer])),
      mediaUrls: Object.fromEntries(items.map(i => [i.questionId, i.mediaUrls])),
      synced: Object.fromEntries(items.map(i => [i.questionId, true])),
      lastSavedAt: Object.fromEntries(items.map(i => [i.questionId, Date.now()])),
    })),
}))

// Selector: jumlah soal yang sudah dijawab
export const selectAnsweredCount = (s: AnswerState): number =>
  Object.keys(s.answers).length

// Selector: daftar questionId yang belum tersync
export const selectUnsyncedIds = (s: AnswerState): ID[] =>
  Object.entries(s.synced)
    .filter(([, v]) => !v)
    .map(([k]) => k)

```

---

### File: `src/stores/auth.store.ts`

```typescript
import { create } from 'zustand'
import type { AuthUser } from '@/types/user'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (user: AuthUser, accessToken: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  setLoading: (v: boolean) => void
}

/**
 * Auth store — TIDAK dipersist (tidak ada zustand/middleware/persist).
 * accessToken hanya hidup di memori; refresh token ada di httpOnly cookie (server-side).
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  setAccessToken: (accessToken) => set({ accessToken }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}))

```

---

### File: `src/stores/exam.store.ts`

```typescript
import { create } from 'zustand'
import type { DecryptedExamPackage, ExamAttempt } from '@/types/exam'
import type { ExamQuestion } from '@/types/question'

interface ExamState {
  // Data paket — hanya di memori setelah dekripsi
  activePackage: DecryptedExamPackage | null
  activeAttempt: ExamAttempt | null
  currentQuestionIndex: number
  questionOrder: string[]   // array questionId setelah shuffle

  // Status UI
  isStarted: boolean
  isSubmitting: boolean
  isSubmitted: boolean

  // Actions
  setPackage: (pkg: DecryptedExamPackage, attempt: ExamAttempt) => void
  setQuestionOrder: (ids: string[]) => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  setSubmitting: (v: boolean) => void
  markSubmitted: () => void
  clearExam: () => void
}

export const useExamStore = create<ExamState>((set, get) => ({
  activePackage: null,
  activeAttempt: null,
  currentQuestionIndex: 0,
  questionOrder: [],
  isStarted: false,
  isSubmitting: false,
  isSubmitted: false,

  setPackage: (pkg, attempt) =>
    set({
      activePackage: pkg,
      activeAttempt: attempt,
      currentQuestionIndex: 0,
      isStarted: true,
      isSubmitted: false,
      // Default order sebelum shuffle
      questionOrder: pkg.questions.map(q => q.id),
    }),

  setQuestionOrder: (ids) => set({ questionOrder: ids }),

  goToQuestion: (index) => {
    const max = get().activePackage?.questions.length ?? 0
    if (index >= 0 && index < max) set({ currentQuestionIndex: index })
  },

  nextQuestion: () => {
    const { currentQuestionIndex, activePackage } = get()
    const max = activePackage?.questions.length ?? 0
    if (currentQuestionIndex < max - 1) set({ currentQuestionIndex: currentQuestionIndex + 1 })
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get()
    if (currentQuestionIndex > 0) set({ currentQuestionIndex: currentQuestionIndex - 1 })
  },

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  markSubmitted: () => set({ isSubmitting: false, isSubmitted: true }),

  clearExam: () =>
    set({
      activePackage: null,
      activeAttempt: null,
      currentQuestionIndex: 0,
      questionOrder: [],
      isStarted: false,
      isSubmitting: false,
      isSubmitted: false,
    }),
}))

// Selector helpers
export const selectCurrentQuestion = (s: ExamState): ExamQuestion | null => {
  if (!s.activePackage) return null
  const id = s.questionOrder[s.currentQuestionIndex]
  return s.activePackage.questions.find(q => q.id === id) ?? null
}

export const selectTotalQuestions = (s: ExamState): number =>
  s.activePackage?.questions.length ?? 0

```

---

### File: `src/stores/index.ts`

```typescript
export { useAuthStore } from './auth.store'
export { useExamStore, selectCurrentQuestion, selectTotalQuestions } from './exam.store'
export { useAnswerStore, selectAnsweredCount, selectUnsyncedIds } from './answer.store'
export { useTimerStore, selectFormattedTime, selectProgressPercent, selectIsWarning } from './timer.store'
export { useSyncStore } from './sync.store'
export { useActivityStore } from './activity.store'
export { useUiStore } from './ui.store'
export type { Toast, ToastVariant } from './ui.store'

```

---

### File: `src/stores/sync.store.ts`

```typescript
import { create } from 'zustand'
import type { SyncStatus } from '@/types/common'

interface SyncState {
  isSyncing: boolean
  pendingCount: number
  failedCount: number
  lastSyncAt: number | null
  lastError: string | null
  overallStatus: SyncStatus | 'IDLE'

  setPending: (count: number) => void
  setFailed: (count: number) => void
  setSyncing: (v: boolean) => void
  setLastSync: () => void
  setError: (err: string | null) => void
  incrementFailed: () => void
  decrementPending: () => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  lastSyncAt: null,
  lastError: null,
  overallStatus: 'IDLE',

  setPending: (pendingCount) =>
    set({ pendingCount, overallStatus: pendingCount > 0 ? 'PENDING' : 'IDLE' }),

  setFailed: (failedCount) => set({ failedCount }),

  setSyncing: (isSyncing) =>
    set({ isSyncing, overallStatus: isSyncing ? 'PROCESSING' : get().overallStatus }),

  setLastSync: () =>
    set({ lastSyncAt: Date.now(), overallStatus: 'COMPLETED', lastError: null }),

  setError: (lastError) =>
    set({ lastError, overallStatus: lastError ? 'FAILED' : get().overallStatus }),

  incrementFailed: () => set(s => ({ failedCount: s.failedCount + 1 })),

  decrementPending: () =>
    set(s => ({
      pendingCount: Math.max(0, s.pendingCount - 1),
      overallStatus: s.pendingCount - 1 <= 0 ? 'COMPLETED' : 'PROCESSING',
    })),
}))

```

---

### File: `src/stores/timer.store.ts`

```typescript
import { create } from 'zustand'

interface TimerState {
  durationSeconds: number    // total durasi ujian
  remainingSeconds: number
  isRunning: boolean
  isExpired: boolean
  startedAt: number | null   // Date.now() saat timer mulai

  start: (durationSeconds: number, elapsedSeconds?: number) => void
  tick: () => void           // dipanggil setiap detik oleh useTimer hook
  pause: () => void
  resume: () => void
  expire: () => void
  reset: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  durationSeconds: 0,
  remainingSeconds: 0,
  isRunning: false,
  isExpired: false,
  startedAt: null,

  start: (durationSeconds, elapsedSeconds = 0) => {
    const remaining = Math.max(0, durationSeconds - elapsedSeconds)
    set({
      durationSeconds,
      remainingSeconds: remaining,
      isRunning: remaining > 0,
      isExpired: remaining === 0,
      startedAt: Date.now() - elapsedSeconds * 1000,
    })
  },

  tick: () => {
    const { remainingSeconds } = get()
    if (remainingSeconds <= 1) {
      set({ remainingSeconds: 0, isRunning: false, isExpired: true })
    } else {
      set({ remainingSeconds: remainingSeconds - 1 })
    }
  },

  pause: () => set({ isRunning: false }),

  resume: () => {
    const { remainingSeconds } = get()
    if (remainingSeconds > 0) set({ isRunning: true })
  },

  expire: () => set({ remainingSeconds: 0, isRunning: false, isExpired: true }),

  reset: () =>
    set({
      durationSeconds: 0,
      remainingSeconds: 0,
      isRunning: false,
      isExpired: false,
      startedAt: null,
    }),
}))

// Selectors
export const selectFormattedTime = (s: TimerState): string => {
  const h = Math.floor(s.remainingSeconds / 3600)
  const m = Math.floor((s.remainingSeconds % 3600) / 60)
  const sec = s.remainingSeconds % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export const selectProgressPercent = (s: TimerState): number => {
  if (s.durationSeconds === 0) return 0
  return Math.round(((s.durationSeconds - s.remainingSeconds) / s.durationSeconds) * 100)
}

export const selectIsWarning = (s: TimerState): boolean =>
  s.remainingSeconds > 0 && s.remainingSeconds <= 300   // 5 menit terakhir

```

---

### File: `src/stores/ui.store.ts`

```typescript
import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number   // ms; undefined = tidak auto-dismiss
}

interface UiState {
  toasts: Toast[]
  isOnline: boolean
  isSidebarOpen: boolean
  theme: 'light' | 'dark'

  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  setOnline: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
  toggleSidebar: () => void
  setTheme: (t: 'light' | 'dark') => void
}

let _toastCounter = 0

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSidebarOpen: true,
  theme: 'light',

  addToast: (toast) => {
    const id = `toast-${++_toastCounter}`
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }))
    return id
  },

  removeToast: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),

  setOnline: (isOnline) => set({ isOnline }),

  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),

  setTheme: (theme) => {
    set({ theme })
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  },
}))

```

---

### File: `src/styles/animations.css`

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.animate-fade-in    { animation: fadeIn 0.2s ease-out; }
.animate-slide-in   { animation: slideIn 0.2s ease-out; }
.animate-blink      { animation: blink 1s step-end infinite; }

```

---

### File: `src/styles/arabic.css`

```css
.arabic-text {
  font-family: 'Amiri', 'Traditional Arabic', serif;
  font-size: 1.25rem;
  line-height: 2.2;
  direction: rtl;
  text-align: right;
  letter-spacing: 0;
}

.quran-text {
  font-family: 'Scheherazade New', 'Amiri', serif;
  font-size: 1.5rem;
  line-height: 2.8;
  direction: rtl;
  text-align: center;
}

.arabic-keyboard-key {
  font-family: 'Amiri', serif;
  font-size: 1.1rem;
  min-width: 2.5rem;
}

```

---

### File: `src/styles/print.css`

```css
@media print {
  .no-print { display: none !important; }

  body {
    font-size: 12pt;
    color: #000;
    background: #fff;
  }

  .print-break-before { page-break-before: always; }
  .print-break-after  { page-break-after: always; }

  .card, .modal { box-shadow: none; border: 1px solid #ddd; }
}

```

---

### File: `src/tests/integration/dexie.spec.ts`

```typescript

```

---

### File: `src/tests/integration/sync.spec.ts`

```typescript

```

---

### File: `src/tests/setup.ts`

```typescript
import '@testing-library/jest-dom'

Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      generateKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      digest: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
    },
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
      return arr
    },
  },
})

vi.mock('dexie', () => ({
  default: vi.fn().mockImplementation(() => ({
    version: vi.fn().mockReturnThis(),
    stores: vi.fn().mockReturnThis(),
    open: vi.fn(),
  })),
}))

vi.mock('@powersync/react', () => ({
  usePowerSync: vi.fn(),
  PowerSyncContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}))

```

---

### File: `src/tests/unit/hooks/use-auto-save.spec.ts`

```typescript

```

---

### File: `src/tests/unit/hooks/use-online-status.spec.ts`

```typescript

```

---

### File: `src/tests/unit/hooks/use-timer.spec.ts`

```typescript

```

---

### File: `src/tests/unit/lib/aes-gcm.spec.ts`

```typescript

```

---

### File: `src/tests/unit/lib/auto-save.spec.ts`

```typescript

```

---

### File: `src/tests/unit/lib/checksum.spec.ts`

```typescript

```

---

### File: `src/tests/unit/lib/compression.spec.ts`

```typescript

```

---

### File: `src/tests/unit/stores/answer.store.spec.ts`

```typescript

```

---

### File: `src/tests/unit/stores/auth.store.spec.ts`

```typescript

```

---

### File: `src/tests/unit/stores/exam.store.spec.ts`

```typescript

```

---

### File: `src/types/activity.ts`

```typescript
import type { ID } from './common'
import type { ActivityLogType } from './sync'

export interface ExamActivityLog {
  id: ID
  attemptId: ID
  userId: ID
  type: ActivityLogType
  metadata: Record<string, unknown> | null
  createdAt: string
}

// State lokal di IndexedDB sebelum sync
export interface LocalActivityLog {
  id?: number        // Dexie auto-increment
  attemptId: ID
  sessionId: ID
  type: ActivityLogType
  metadata?: Record<string, unknown>
  timestamp: number  // Date.now()
  synced: boolean
}

// Untuk monitoring real-time via Socket.IO
export interface LiveActivityEvent {
  attemptId: ID
  userId: ID
  username: string
  type: ActivityLogType
  metadata?: Record<string, unknown>
  timestamp: string
}

// Statistik ringkasan per attempt (untuk monitoring & audit review)
export interface ActivitySummary {
  attemptId: ID
  userId: ID
  username: string
  tabBlurCount: number
  copyPasteCount: number
  idleCount: number
  totalEvents: number
  lastEventAt: string | null
}

```

---

### File: `src/types/answer.ts`

```typescript
import type { ID, GradingStatus } from './common'

// ── Jawaban yang dikirim siswa ────────────────────────────────────────────────

// Nilai answer sesuai tipe soal (mirror CorrectAnswer tapi bisa partial)
export type AnswerValue =
  | string                     // MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY
  | string[]                   // COMPLEX_MULTIPLE_CHOICE
  | Record<string, string>     // MATCHING

export interface ExamAnswer {
  id: ID
  attemptId: ID
  questionId: ID
  idempotencyKey: string
  answer: AnswerValue
  mediaUrls: string[]
  score: number | null
  maxScore: number | null
  feedback: string | null
  isAutoGraded: boolean
  gradedById: ID | null
  gradedAt: string | null
  createdAt: string
  updatedAt: string
}

// ── State lokal di IndexedDB (Dexie) sebelum sync ────────────────────────────

export interface LocalAnswer {
  questionId: ID
  attemptId: ID
  sessionId: ID
  idempotencyKey: string
  answer: AnswerValue
  mediaUrls: string[]
  savedAt: number         // Date.now()
  synced: boolean
}

// ── Submit answer payload ─────────────────────────────────────────────────────

export interface SubmitAnswerPayload {
  attemptId: ID
  questionId: ID
  idempotencyKey: string
  answer: AnswerValue
  mediaUrls?: string[]
}

// ── Manual grading ────────────────────────────────────────────────────────────

export interface GradeAnswerPayload {
  answerId: ID
  score: number
  feedback?: string
}

export interface ManualGradingItem {
  answerId: ID
  attemptId: ID
  questionId: ID
  questionContent: string
  answerValue: AnswerValue
  mediaUrls: string[]
  maxScore: number
  studentName: string
  gradingStatus: GradingStatus
  similarityScore?: number    // dari similarity.util.ts
}

```

---

### File: `src/types/api.ts`

```typescript
import type { PaginationMeta } from './common'

// ── Generic API envelope ──────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  message: string
  statusCode: number
  details?: Record<string, string[]>   // field-level validation errors
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface PaginatedApiResponse<T> extends ApiSuccessResponse<T[]> {
  meta: PaginationMeta
}

// ── HTTP client error ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Request helpers ───────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type BaseQueryParams = PaginationParams & SortParams & {
  search?: string
}

// ── Upload ────────────────────────────────────────────────────────────────────

export interface UploadProgressEvent {
  loaded: number
  total: number
  percent: number
}

```

---

### File: `src/types/common.ts`

```typescript
export type ID = string

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
}

export type Nullable<T> = T | null
export type Optional<T> = T | undefined

// Prisma enums mirrored untuk FE (tidak import dari @prisma/client di browser)
export type UserRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'TEACHER'
  | 'SUPERVISOR'
  | 'OPERATOR'
  | 'STUDENT'

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'COMPLEX_MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'MATCHING'
  | 'SHORT_ANSWER'
  | 'ESSAY'

export type ExamPackageStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED'

export type SessionStatus =
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'ABANDONED'

export type GradingStatus =
  | 'PENDING'
  | 'AUTO_GRADED'
  | 'MANUAL_REQUIRED'
  | 'COMPLETED'
  | 'PUBLISHED'

export type SyncStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER'

export type SyncType = 'SUBMIT_ANSWER' | 'SUBMIT_EXAM' | 'UPLOAD_MEDIA' | 'ACTIVITY_LOG'

export type QuestionStatus = 'draft' | 'review' | 'approved'

```

---

### File: `src/types/exam.ts`

```typescript
import type { ID, ExamPackageStatus, SessionStatus, AttemptStatus, GradingStatus } from './common'
import type { ExamQuestion } from './question'

// ── Exam Package ─────────────────────────────────────────────────────────────

export interface ExamPackageSettings {
  duration: number             // menit
  shuffleQuestions: boolean
  shuffleOptions: boolean
  showResult: boolean
  maxAttempts: number
}

export interface ExamPackage {
  id: ID
  tenantId: ID
  title: string
  description: string | null
  subjectId: ID | null
  settings: ExamPackageSettings
  status: ExamPackageStatus
  publishedAt: string | null
  createdById: ID | null
  createdAt: string
  updatedAt: string
  questionCount?: number
  totalPoints?: number
}

// ── Session ──────────────────────────────────────────────────────────────────

export interface ExamSession {
  id: ID
  tenantId: ID
  examPackageId: ID
  roomId: ID | null
  title: string
  startTime: string
  endTime: string
  status: SessionStatus
  createdById: ID | null
  createdAt: string
  updatedAt: string
  examPackage?: Pick<ExamPackage, 'id' | 'title' | 'settings'>
  roomName?: string
  studentCount?: number
}

export interface SessionStudent {
  sessionId: ID
  userId: ID
  tokenCode: string
  expiresAt: string | null
  addedAt: string
  username?: string
  email?: string
}

// ── Attempt ──────────────────────────────────────────────────────────────────

export interface ExamAttempt {
  id: ID
  sessionId: ID
  userId: ID
  idempotencyKey: string
  deviceFingerprint: string | null
  startedAt: string
  submittedAt: string | null
  status: AttemptStatus
  packageHash: string | null
  totalScore: number | null
  maxScore: number | null
  gradingStatus: GradingStatus
  gradingCompletedAt: string | null
}

// ── Paket ujian terenkripsi yang didownload siswa ────────────────────────────

export interface EncryptedExamPackage {
  sessionId: ID
  attemptId: ID
  packageHash: string
  encryptedData: string     // base64 AES-GCM ciphertext
  iv: string                // base64 IV
  expiresAt: string
}

// Setelah didekripsi di memori
export interface DecryptedExamPackage {
  sessionId: ID
  attemptId: ID
  packageHash: string
  title: string
  settings: ExamPackageSettings
  questions: ExamQuestion[]
  totalPoints: number
}

// ── Exam Room ────────────────────────────────────────────────────────────────

export interface ExamRoom {
  id: ID
  tenantId: ID
  name: string
  capacity: number | null
}

// ── Result ───────────────────────────────────────────────────────────────────

export interface ExamResult {
  attemptId: ID
  sessionTitle: string
  submittedAt: string
  totalScore: number
  maxScore: number
  percentage: number
  gradingStatus: GradingStatus
  answers?: AnswerResult[]
}

export interface AnswerResult {
  questionId: ID
  score: number | null
  maxScore: number
  feedback: string | null
  isAutoGraded: boolean
}

```

---

### File: `src/types/index.ts`

```typescript
export * from './common'
export * from './user'
export * from './question'
export * from './exam'
export * from './answer'
export * from './sync'
export * from './activity'
export * from './media'
export * from './api'

```

---

### File: `src/types/media.ts`

```typescript
import type { ID } from './common'

export type MediaType = 'image' | 'audio' | 'video'

export interface MediaUploadResponse {
  objectKey: string
  presignedUrl: string
  expiresAt: string
  mimeType: string
  size: number
}

export interface PresignedUrlResponse {
  url: string
  expiresAt: string
}

// Chunk upload untuk media rekaman offline
export interface ChunkUploadState {
  uploadId: string
  questionId: ID
  attemptId: ID
  mimeType: string
  totalChunks: number
  uploadedChunks: number
  objectKey: string | null    // tersedia setelah semua chunk diterima
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

// State rekaman lokal sebelum upload
export interface LocalMediaBlob {
  id?: number              // Dexie auto-increment
  questionId: ID
  attemptId: ID
  sessionId: ID
  mimeType: string
  blob: Blob
  duration?: number        // detik
  size: number
  recordedAt: number       // Date.now()
  uploaded: boolean
  objectKey?: string
}

// Hasil rekaman yang sudah selesai
export interface RecordingResult {
  blob: Blob
  mimeType: string
  duration: number
  size: number
}

```

---

### File: `src/types/question.ts`

```typescript
import type { ID, QuestionType, QuestionStatus } from './common'

// ── Question content (JSON column) ──────────────────────────────────────────

export interface QuestionContent {
  text: string
  images?: string[]    // MinIO object keys
  audio?: string       // MinIO object key
  video?: string       // MinIO object key
}

// ── Options per type ─────────────────────────────────────────────────────────

export interface MultipleChoiceOption {
  key: string          // 'a' | 'b' | 'c' | 'd' | 'e'
  text: string
  imageUrl?: string
}

export interface MatchingOption {
  left: Array<{ key: string; text: string }>
  right: Array<{ key: string; text: string }>
}

export type QuestionOptions =
  | MultipleChoiceOption[]   // MULTIPLE_CHOICE, COMPLEX_MULTIPLE_CHOICE
  | MatchingOption           // MATCHING
  | null                     // TRUE_FALSE, SHORT_ANSWER, ESSAY

// ── Correct answer per type ──────────────────────────────────────────────────
// Disimpan terenkripsi di server; client hanya terima setelah submit

export type CorrectAnswer =
  | string                       // MULTIPLE_CHOICE ('a'), TRUE_FALSE ('true')
  | string[]                     // COMPLEX_MULTIPLE_CHOICE (['a','c'])
  | Record<string, string>       // MATCHING ({ 'a': '1', 'b': '2' })
  | string                       // SHORT_ANSWER, ESSAY (model answer)

// ── Question tag ─────────────────────────────────────────────────────────────

export interface QuestionTag {
  id: ID
  tenantId: ID
  name: string
}

// ── Question ─────────────────────────────────────────────────────────────────

export interface Question {
  id: ID
  tenantId: ID
  subjectId: ID
  type: QuestionType
  content: QuestionContent
  options: QuestionOptions
  points: number
  difficulty: number   // 1–5
  status: QuestionStatus
  createdById: ID | null
  createdAt: string
  updatedAt: string
  tags?: QuestionTag[]
}

// Versi yang diterima client dalam paket ujian (tanpa correctAnswer)
export interface ExamQuestion extends Omit<Question, 'tags'> {
  order: number
  pointsOverride: number | null  // dari ExamPackageQuestion.points
}

// Versi untuk grading — correctAnswer sudah didekripsi server, dikirim ke guru
export interface QuestionWithAnswer extends Question {
  correctAnswer: CorrectAnswer
}

```

---

### File: `src/types/sync.ts`

```typescript
import type { ID, SyncStatus, SyncType } from './common'
import type { SubmitAnswerPayload } from './answer'

// ── Server model ──────────────────────────────────────────────────────────────

export interface SyncQueueItem {
  id: ID
  attemptId: ID
  idempotencyKey: string
  type: SyncType
  payload: SyncPayload
  status: SyncStatus
  retryCount: number
  maxRetries: number
  lastError: string | null
  processedAt: string | null
  createdAt: string
  updatedAt: string
}

// ── Payload union per SyncType ────────────────────────────────────────────────

export type SyncPayload =
  | SubmitAnswerPayload
  | SubmitExamPayload
  | UploadMediaPayload
  | ActivityLogPayload

export interface SubmitExamPayload {
  attemptId: ID
  idempotencyKey: string
  submittedAt: string
}

export interface UploadMediaPayload {
  attemptId: ID
  questionId: ID
  idempotencyKey: string
  chunkIndex: number
  totalChunks: number
  mimeType: string
  data: string    // base64 chunk
}

export interface ActivityLogPayload {
  attemptId: ID
  type: ActivityLogType
  metadata?: Record<string, unknown>
  timestamp: number
}

export type ActivityLogType =
  | 'tab_blur'
  | 'tab_focus'
  | 'copy_paste'
  | 'idle'
  | 'resume'
  | 'screen_capture_attempt'

// ── Dexie local sync queue ────────────────────────────────────────────────────

export interface LocalSyncItem {
  id?: number           // Dexie auto-increment
  idempotencyKey: string
  type: SyncType
  payload: SyncPayload
  status: SyncStatus
  retryCount: number
  createdAt: number     // Date.now()
  processedAt?: number
  lastError?: string
}

// ── PowerSync batch mutation ──────────────────────────────────────────────────

export interface PowerSyncBatchItem {
  type: SyncType
  attemptId: ID
  idempotencyKey: string
  payload: SyncPayload
}

export interface PowerSyncBatch {
  batch: PowerSyncBatchItem[]
}

```

---

### File: `src/types/user.ts`

```typescript
import type { ID, UserRole } from './common'

export interface User {
  id: ID
  tenantId: ID
  email: string
  username: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserDevice {
  id: ID
  userId: ID
  fingerprint: string
  label: string | null
  isLocked: boolean
  lockedAt: string | null
  lastSeenAt: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser extends User {
  tenantSubdomain: string
}

export interface JwtPayload {
  sub: ID
  tenantId: ID
  role: UserRole
  username: string
  iat: number
  exp: number
}

```

---

## Direktori: public

### File: `public/manifest.json`

```json
{
  "name": "Sistem Ujian",
  "short_name": "Ujian",
  "description": "Sistem Ujian Offline-First untuk Sekolah dan Madrasah",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["education"]
}

```

---

### File: `public/robots.txt`

```
User-agent: *
Disallow: /api/
Disallow: /(siswa)/
Disallow: /(guru)/
Disallow: /(pengawas)/
Disallow: /(operator)/
Disallow: /(superadmin)/
Allow: /

```

---

## Direktori: tests

### File: `tests/e2e/auth.spec.ts`

```typescript

```

---

### File: `tests/e2e/exam-flow.spec.ts`

```typescript

```

---

### File: `tests/e2e/grading.spec.ts`

```typescript

```

---

### File: `tests/e2e/media-recording.spec.ts`

```typescript

```

---

### File: `tests/e2e/offline-sync.spec.ts`

```typescript

```

---

## Direktori: ROOT

### File: `.env.example`

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_POWERSYNC_URL=https://sync.example.com
NEXT_PUBLIC_MINIO_ENDPOINT=minio.example.com
NEXT_PUBLIC_TENANT_DOMAIN=exam.example.com

NEXT_PUBLIC_ENABLE_RECORDING=true
NEXT_PUBLIC_AUTOSAVE_INTERVAL=30000
NEXT_PUBLIC_MAX_RECORDING_DURATION=300
NEXT_PUBLIC_MAX_RECORDING_SIZE=1073741824
NEXT_PUBLIC_MIN_STORAGE_MB=2048

```

---

### File: `.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-floating-promises": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}

```

---

### File: `.prettierrc`

```
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}

```

---

### File: `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_MINIO_ENDPOINT ?? '',
        pathname: '/exam-assets/**',
      },
    ],
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false, // gunakan native Web Crypto, bukan Node crypto
    }
    return config
  },
  experimental: {
    optimizePackageImports: ['chart.js', 'dexie'],
  },
}

export default nextConfig

```

---

### File: `package.json`

```json
{
  "name": "exam-frontend",
  "version": "1.0.0",
  "description": "Offline-First Exam System Frontend — Multi-Tenant",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:cov": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "daisyui": "^4.6.0",
    "zustand": "^4.5.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.7",
    "@powersync/react": "^1.0.0",
    "@powersync/web": "^1.0.0",
    "ky": "^1.2.0",
    "zod": "^3.22.4",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^3.2.0",
    "clsx": "^2.1.0",
    "next-safe": "^3.4.1",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.4",
    "socket.io-client": "^4.6.0",
    "uuid": "^9.0.0",
    "@types/uuid": "^9.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^20.11.5",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.2.4",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "vitest": "^1.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "@testing-library/react": "^14.2.0",
    "@testing-library/user-event": "^14.5.2",
    "@playwright/test": "^1.41.0",
    "@types/uuid": "^9.0.7"
  }
}

```

---

### File: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'android-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'android-tablet', use: { ...devices['Galaxy Tab S4'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})

```

---

### File: `postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

---

### File: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
        quran: ['Scheherazade New', 'Amiri', 'serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#3d4451',
          'base-100': '#ffffff',
          info: '#3abff8',
          success: '#36d399',
          warning: '#fbbd23',
          error: '#f87272',
        },
        dark: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#2a2e37',
          'base-100': '#1d232a',
          info: '#3abff8',
          success: '#36d399',
          warning: '#fbbd23',
          error: '#f87272',
        },
      },
    ],
    darkTheme: 'dark',
    logs: false,
    rtl: false,
  },
}

export default config

```

---

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@stores/*": ["src/stores/*"],
      "@lib/*": ["src/lib/*"],
      "@types/*": ["src/types/*"],
      "@schemas/*": ["src/schemas/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "dist"]
}

```

---

### File: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@stores': resolve(__dirname, './src/stores'),
      '@lib': resolve(__dirname, './src/lib'),
      '@types': resolve(__dirname, './src/types'),
      '@schemas': resolve(__dirname, './src/schemas'),
    },
  },
})

```

---

