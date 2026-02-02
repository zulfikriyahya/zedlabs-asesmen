import axios, { AxiosError } from 'axios';
import { $authStore } from '@/stores/auth';

const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 1. Handle Network Error (Offline)
    if (!error.response) {
      // Ini terjadi jika tidak ada koneksi internet atau server down
      const customError = new Error('OFFLINE_MODE');
      (customError as any).isNetworkError = true;
      (customError as any).originalRequest = error.config;
      return Promise.reject(customError);
    }

    // 2. Handle Unauthorized (401) - Auto Refresh Logic
    if (error.response.status === 401) {
      // Logic refresh token (simplified)
      // Di real app, gunakan queue untuk menampung request selama refreshing
      window.location.href = '/login'; 
    }

    return Promise.reject(error);
  }
);