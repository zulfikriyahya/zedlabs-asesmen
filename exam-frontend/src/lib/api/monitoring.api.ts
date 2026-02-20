import { apiGet } from './client';
import type { ActivitySummary } from '@/types/activity';
import type { ID } from '@/types/common';

export const monitoringApi = {
  getSessionStatus: (sessionId: ID) =>
    apiGet<Record<string, unknown>>(`monitoring/sessions/${sessionId}`),

  getActivitySummaries: (sessionId: ID) =>
    apiGet<ActivitySummary[]>(`monitoring/sessions/${sessionId}/activities`),

  getAttemptLogs: (attemptId: ID) =>
    apiGet<ActivitySummary>(`monitoring/attempts/${attemptId}/logs`),
};
