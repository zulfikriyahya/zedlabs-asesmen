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
