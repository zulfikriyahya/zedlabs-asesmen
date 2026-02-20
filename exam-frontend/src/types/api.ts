import type { PaginationMeta } from './common'

// ── Generic API envelope ──────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  message: string
  statusCode: number
  details?: Record<string, string[]>   // field-level validation errors
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface PaginatedApiResponse<T> extends ApiSuccessResponse<T[]> {
  meta: PaginationMeta
}

// ── HTTP client error ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Request helpers ───────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type BaseQueryParams = PaginationParams & SortParams & {
  search?: string
}

// ── Upload ────────────────────────────────────────────────────────────────────

export interface UploadProgressEvent {
  loaded: number
  total: number
  percent: number
}
