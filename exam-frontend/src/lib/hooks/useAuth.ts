// src/lib/hooks/useAuth.ts
import { useStore } from '@nanostores/react';
import { $authStore, login, logout, refreshAccessToken } from '@/stores/auth';
import type { LoginCredentials } from '@/lib/api/auth';

export function useAuth() {
  const authState = useStore($authStore);

  return {
    // State
    user: authState.user,
    school: authState.school,
    isAuthenticated: authState.isAuthenticated,
    token: authState.accessToken,
    
    // Helpers
    role: authState.user?.role,
    isStudent: authState.user?.role === 'siswa',
    isTeacher: authState.user?.role === 'guru',
    isAdmin: authState.user?.role === 'superadmin' || authState.user?.role === 'operator',
    
    // Actions (Wrapped for convenience)
    login: async (credentials: LoginCredentials) => {
      try {
        await login(credentials);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    logout: async () => {
      await logout();
    },
    refreshToken: async () => {
      try {
        await refreshAccessToken();
        return true;
      } catch (e) {
        return false;
      }
    }
  };
}