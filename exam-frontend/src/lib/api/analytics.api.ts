import { apiGet } from './client';
import type { ID } from '@/types/common';

export const analyticsApi = {
  getDashboard: () => apiGet<Record<string, unknown>>('analytics/dashboard'),

  getSessionStats: (sessionId: ID) =>
    apiGet<Record<string, unknown>>(`analytics/sessions/${sessionId}`),

  getPackageStats: (packageId: ID) =>
    apiGet<Record<string, unknown>>(`analytics/packages/${packageId}`),
};
