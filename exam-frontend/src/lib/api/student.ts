import { apiClient } from './client';
import type { Student } from '@/types/user';

export async function getStudentProfile() {
  const response = await apiClient.get<Student>('/student/profile');
  return response.data;
}

export async function updateStudentProfile(data: Partial<Student>) {
  const response = await apiClient.put('/student/profile', data);
  return response.data;
}

export async function changePassword(password: string, newPassword: string) {
  const response = await apiClient.post('/student/change-password', {
    current_password: password,
    new_password: newPassword
  });
  return response.data;
}

export async function getStudentResults() {
  const response = await apiClient.get('/student/results');
  return response.data;
}