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
