import { apiGet, apiPost, apiPatch } from './client'
import type { ExamPackage } from '@/types/exam'
import type { ID } from '@/types/common'
import type { PaginatedApiResponse, BaseQueryParams } from '@/types/api'

export interface CreatePackagePayload {
  title: string
  description?: string
  subjectId?: ID
  settings: ExamPackage['settings']
  questionIds?: Array<{ questionId: ID; order: number; points?: number }>
}

export const examPackagesApi = {
  list: (params?: BaseQueryParams) =>
    apiGet<PaginatedApiResponse<ExamPackage>>('exam-packages', {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getById: (id: ID) => apiGet<ExamPackage>(`exam-packages/${id}`),

  create: (payload: CreatePackagePayload) =>
    apiPost<ExamPackage>('exam-packages', payload),

  update: (id: ID, payload: Partial<CreatePackagePayload>) =>
    apiPatch<ExamPackage>(`exam-packages/${id}`, payload),

  addQuestions: (id: ID, questions: CreatePackagePayload['questionIds']) =>
    apiPost<void>(`exam-packages/${id}/questions`, { questions }),

  publish: (id: ID) => apiPost<ExamPackage>(`exam-packages/${id}/publish`, {}),

  getItemAnalysis: (id: ID) =>
    apiGet<Record<string, unknown>>(`exam-packages/${id}/item-analysis`),
}
