// src/stores/auth.ts
import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { User, School } from '@/types/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  school: School | null;
  accessToken: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  school: null,
  accessToken: null,
};

// Create persistent atom for auth state
export const $authStore = persistentAtom<AuthState>('auth', initialState, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Getters
export function getUser(): User | null {
  return $authStore.get().user;
}

export function getSchool(): School | null {
  return $authStore.get().school;
}

export function getAccessToken(): string | null {
  return $authStore.get().accessToken;
}

export function isAuthenticated(): boolean {
  return $authStore.get().isAuthenticated;
}

// Actions
export function setAuth(data: Partial<AuthState>): void {
  $authStore.set({
    ...$authStore.get(),
    ...data,
  });
}

export function clearAuth(): void {
  $authStore.set(initialState);
}

export function setUser(user: User): void {
  $authStore.set({
    ...$authStore.get(),
    user,
  });
}

export function setSchool(school: School): void {
  $authStore.set({
    ...$authStore.get(),
    school,
  });
}

export function setAccessToken(token: string): void {
  $authStore.set({
    ...$authStore.get(),
    accessToken: token,
  });
}