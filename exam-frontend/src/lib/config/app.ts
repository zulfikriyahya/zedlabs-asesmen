export const appConfig = {
  name: 'ExamApp',
  version: '1.0.0',
  description: 'Sistem Ujian Sekolah & Madrasah Offline-First',
  api: {
    baseUrl: import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
  },
  exam: {
    autoSaveInterval: 30000, // 30 detik
    maxMediaSize: 100 * 1024 * 1024, // 100MB
    warningThresholds: {
      storage: 2 * 1024 * 1024 * 1024, // 2GB
      battery: 0.2, // 20%
    }
  },
  features: {
    enablePWA: true,
    enableOffline: true,
    enableDeviceLock: true,
  }
};