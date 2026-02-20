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
