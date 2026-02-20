import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { ExamSession, SessionStudent } from '@/types/exam';
import type { ID } from '@/types/common';
import type { PaginatedApiResponse, BaseQueryParams } from '@/types/api';

export interface CreateSessionPayload {
  examPackageId: ID;
  roomId?: ID;
  title: string;
  startTime: string;
  endTime: string;
}

export const sessionsApi = {
  list: (params?: BaseQueryParams) =>
    apiGet<PaginatedApiResponse<ExamSession>>('sessions', {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getById: (id: ID) => apiGet<ExamSession>(`sessions/${id}`),

  create: (payload: CreateSessionPayload) => apiPost<ExamSession>('sessions', payload),

  update: (id: ID, payload: Partial<CreateSessionPayload>) =>
    apiPatch<ExamSession>(`sessions/${id}`, payload),

  activate: (id: ID) => apiPost<ExamSession>(`sessions/${id}/activate`, {}),

  pause: (id: ID) => apiPost<ExamSession>(`sessions/${id}/pause`, {}),

  complete: (id: ID) => apiPost<ExamSession>(`sessions/${id}/complete`, {}),

  assignStudents: (id: ID, payload: { userIds: ID[] }) =>
    apiPost<SessionStudent[]>(`sessions/${id}/students`, payload),

  getStudents: (id: ID) => apiGet<SessionStudent[]>(`sessions/${id}/students`),

  removeStudent: (sessionId: ID, userId: ID) =>
    apiDelete<void>(`sessions/${sessionId}/students/${userId}`),
};
