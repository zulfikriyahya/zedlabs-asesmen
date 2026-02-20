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
