import { apiClient } from './client';

export async function getActiveSessions() {
  const response = await apiClient.get('/proctor/sessions/active');
  return response.data;
}

export async function getSessionLiveStats(sessionId: number) {
  const response = await apiClient.get(`/proctor/sessions/${sessionId}/live`);
  return response.data;
}

export async function getStudentLiveStatus(attemptId: number) {
  const response = await apiClient.get(`/proctor/monitoring/student/${attemptId}`);
  return response.data;
}

export async function pauseStudentExam(attemptId: number, reason: string) {
  const response = await apiClient.post(`/proctor/monitoring/student/${attemptId}/pause`, { reason });
  return response.data;
}

export async function resumeStudentExam(attemptId: number) {
  const response = await apiClient.post(`/proctor/monitoring/student/${attemptId}/resume`);
  return response.data;
}

export async function forceFinishExam(attemptId: number) {
  const response = await apiClient.post(`/proctor/monitoring/student/${attemptId}/finish`);
  return response.data;
}