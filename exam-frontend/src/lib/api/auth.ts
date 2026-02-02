// src/lib/api/auth.ts
import { apiClient } from './client';
import { generateDeviceFingerprint } from '@/lib/utils/device';
import { db } from '@/lib/db/schema';
import { $authStore, setAuth, clearAuth } from '@/stores/auth';
import type { LoginResponse } from '@/types/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const deviceFingerprint = await generateDeviceFingerprint();

  const response = await apiClient.post<LoginResponse>('/auth/login', {
    ...credentials,
    device_fingerprint: deviceFingerprint,
  });

  const { access_token, refresh_token, user, school } = response.data;

  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);

  await db.users.put(user);
  await db.schools.put(school);

  setAuth({
    isAuthenticated: true,
    user,
    school,
    accessToken: access_token,
  });

  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  }

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  clearAuth();

  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post<{ access_token: string }>('/auth/refresh', {
    refresh_token: refreshToken,
  });

  const { access_token } = response.data;

  localStorage.setItem('access_token', access_token);

  setAuth({
    ...$authStore.get(),
    accessToken: access_token,
  });

  return access_token;
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function checkAuth(): Promise<boolean> {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return false;
  }

  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}