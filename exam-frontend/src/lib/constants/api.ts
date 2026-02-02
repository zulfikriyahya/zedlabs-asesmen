export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  EXAM: {
    LIST: '/student/exams',
    DETAIL: (id: number) => `/student/exams/${id}`,
    DOWNLOAD: (id: number) => `/student/exams/${id}/download`,
    SUBMIT: (id: number) => `/student/attempts/${id}/submit`,
  },
  MEDIA: {
    UPLOAD: '/media/upload',
    CHUNK: '/media/chunk',
  },
} as const;