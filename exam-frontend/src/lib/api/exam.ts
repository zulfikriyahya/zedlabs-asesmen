// src/lib/api/exam.ts
import { apiClient } from './client';
import type { Exam, ExamAttempt } from '@/types/exam';
import type { ExamDownloadResponse } from '@/types/api';

export async function getAvailableExams() {
  const response = await apiClient.get<Exam[]>('/student/exams');
  return response.data;
}

export async function getExamById(examId: number) {
  const response = await apiClient.get<Exam>(`/student/exams/${examId}`);
  return response.data;
}

export async function prepareExam(examId: number) {
  const response = await apiClient.post<{ attempt_id: number }>(`/student/exams/${examId}/prepare`);
  return response.data;
}

export async function downloadExamData(examId: number) {
  const response = await apiClient.get<ExamDownloadResponse>(`/student/exams/${examId}/download`);
  return response.data;
}

export async function getExamAttempt(attemptId: number) {
  const response = await apiClient.get<ExamAttempt>(`/student/attempts/${attemptId}`);
  return response.data;
}

export async function submitExam(attemptId: number, data: any) {
  const response = await apiClient.post(`/student/attempts/${attemptId}/submit`, data);
  return response.data;
}

export async function saveAnswers(attemptId: number, answers: any[]) {
  const response = await apiClient.post(`/student/attempts/${attemptId}/answers`, {
    answers,
  });
  return response.data;
}

export async function saveActivityLogs(attemptId: number, events: any[]) {
  const response = await apiClient.post(`/student/attempts/${attemptId}/activity`, {
    events,
  });
  return response.data;
}