import { apiGet, apiPost } from './client';
import type { GradeAnswerPayload, ManualGradingItem } from '@/types/answer';
import type { ExamAttempt } from '@/types/exam';
import type { GradingStatus, ID } from '@/types/common';
import type { PaginatedApiResponse, BaseQueryParams } from '@/types/api';

export interface GradingQueryParams extends BaseQueryParams {
  status?: GradingStatus;
  sessionId?: ID;
}

export interface PublishResultPayload {
  attemptId: ID;
}

export const gradingApi = {
  listPending: (params?: GradingQueryParams) =>
    apiGet<PaginatedApiResponse<ManualGradingItem>>('grading', {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  gradeAnswer: (payload: GradeAnswerPayload) => apiPost<void>('grading/answer', payload),

  completeGrading: (attemptId: ID) => apiPost<ExamAttempt>('grading/complete', { attemptId }),

  publishResult: (payload: PublishResultPayload) =>
    apiPost<ExamAttempt>('grading/publish', payload),
};
