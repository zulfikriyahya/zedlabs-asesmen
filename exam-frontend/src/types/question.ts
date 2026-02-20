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
