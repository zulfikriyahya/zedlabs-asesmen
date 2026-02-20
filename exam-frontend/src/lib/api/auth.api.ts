import { apiPost } from './client';
import type { AuthUser } from '@/types/user';

export interface LoginPayload {
  username: string;
  password: string;
  fingerprint: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Login gagal');
      }
      return res.json() as Promise<LoginResponse>;
    }),

  logout: () => fetch('/api/auth/logout', { method: 'POST' }).then(() => undefined),

  refresh: () =>
    fetch('/api/auth/refresh', { method: 'POST' }).then(async (res) => {
      if (!res.ok) throw new Error('Token expired');
      return res.json() as Promise<{ accessToken: string }>;
    }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiPost<void>('auth/change-password', payload),

  me: () => apiPost<AuthUser>('auth/me', {}),
};
