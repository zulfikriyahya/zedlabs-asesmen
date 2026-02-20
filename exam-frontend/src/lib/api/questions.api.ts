import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type { Question, QuestionTag } from '@/types/question'
import type { QuestionType, QuestionStatus, ID } from '@/types/common'
import type { PaginatedApiResponse, BaseQueryParams } from '@/types/api'

export interface QuestionQueryParams extends BaseQueryParams {
  subjectId?: ID
  type?: QuestionType
  status?: QuestionStatus
  tagIds?: ID[]
  difficulty?: number
}

export interface CreateQuestionPayload {
  subjectId: ID
  type: QuestionType
  content: Question['content']
  options?: Question['options']
  correctAnswer: unknown
  points?: number
  difficulty?: number
  tagIds?: ID[]
}

export const questionsApi = {
  list: (params?: QuestionQueryParams) =>
    apiGet<PaginatedApiResponse<Question>>('questions', {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getById: (id: ID) => apiGet<Question>(`questions/${id}`),

  create: (payload: CreateQuestionPayload) =>
    apiPost<Question>('questions', payload),

  update: (id: ID, payload: Partial<CreateQuestionPayload>) =>
    apiPatch<Question>(`questions/${id}`, payload),

  approve: (id: ID) => apiPost<Question>(`questions/${id}/approve`, {}),

  delete: (id: ID) => apiDelete<void>(`questions/${id}`),

  importBulk: (formData: FormData) =>
    apiPost<{ imported: number; failed: number }>('questions/import', formData),

  listTags: () => apiGet<QuestionTag[]>('question-tags'),

  createTag: (name: string) => apiPost<QuestionTag>('question-tags', { name }),
}
