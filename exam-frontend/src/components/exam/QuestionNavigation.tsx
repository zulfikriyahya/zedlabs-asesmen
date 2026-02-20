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
