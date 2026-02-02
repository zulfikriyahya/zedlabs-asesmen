// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: import('./user').User;
  school: import('./user').School;
}

export interface ExamDownloadResponse {
  exam: import('./exam').Exam;
  questions: import('./question').Question[];
  media_files: import('./exam').MediaFile[];
  checksum: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  errors?: ValidationError[];
}