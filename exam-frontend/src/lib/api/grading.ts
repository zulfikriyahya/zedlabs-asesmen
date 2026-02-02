import { apiClient } from './client';

export interface GradePayload {
  score: number;
  feedback?: string;
}

export async function getPendingGrading(examId?: number) {
  const params = examId ? { exam_id: examId } : {};
  const response = await apiClient.get('/teacher/grading/pending', { params });
  return response.data;
}

export async function getStudentAttemptForGrading(attemptId: number) {
  const response = await apiClient.get(`/teacher/grading/attempt/${attemptId}`);
  return response.data;
}

export async function submitGrade(answerId: number, payload: GradePayload) {
  const response = await apiClient.post(`/teacher/grading/answer/${answerId}`, payload);
  return response.data;
}

export async function finishGradingAttempt(attemptId: number) {
  const response = await apiClient.post(`/teacher/grading/attempt/${attemptId}/finish`);
  return response.data;
}