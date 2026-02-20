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
