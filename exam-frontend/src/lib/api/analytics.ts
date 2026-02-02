import { apiClient } from './client';

export async function getDashboardStats() {
  const response = await apiClient.get('/analytics/dashboard');
  return response.data;
}

export async function getExamAnalytics(examId: number) {
  const response = await apiClient.get(`/analytics/exam/${examId}`);
  return response.data;
}

export async function getStudentProgress(studentId: number) {
  const response = await apiClient.get(`/analytics/student/${studentId}`);
  return response.data;
}