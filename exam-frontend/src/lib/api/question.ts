import { apiClient } from './client';
import type { Question } from '@/types/question';

export async function getQuestions(params?: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  tags?: string[] 
}) {
  const response = await apiClient.get('/teacher/questions', { params });
  return response.data;
}

export async function getQuestionById(id: number) {
  const response = await apiClient.get<Question>(`/teacher/questions/${id}`);
  return response.data;
}

export async function createQuestion(data: Partial<Question>) {
  const response = await apiClient.post('/teacher/questions', data);
  return response.data;
}

export async function updateQuestion(id: number, data: Partial<Question>) {
  const response = await apiClient.put(`/teacher/questions/${id}`, data);
  return response.data;
}

export async function deleteQuestion(id: number) {
  const response = await apiClient.delete(`/teacher/questions/${id}`);
  return response.data;
}

export async function importQuestions(file: File, examId?: number) {
  const formData = new FormData();
  formData.append('file', file);
  if (examId) formData.append('exam_id', examId.toString());

  const response = await apiClient.post('/teacher/questions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}