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
