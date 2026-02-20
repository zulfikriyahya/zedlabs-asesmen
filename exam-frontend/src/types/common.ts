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
