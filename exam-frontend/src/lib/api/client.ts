// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { $authStore } from '@/stores/auth';

// Base URL from environment variable
const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const authState = $authStore.get();
    
    if (authState.accessToken) {
      config.headers.Authorization = `Bearer ${authState.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - try to refresh token
      // If refresh fails, redirect to login
      const authState = $authStore.get();
      
      if (authState.isAuthenticated) {
        try {
          // Attempt token refresh
          const { refreshAccessToken } = await import('./auth');
          const newToken = await refreshAccessToken();
          
          // Retry the original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios.request(error.config);
          }
        } catch (refreshError) {
          // Refresh failed - logout
          const { logout } = await import('./auth');
          await logout();
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;