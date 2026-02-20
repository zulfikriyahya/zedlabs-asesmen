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
