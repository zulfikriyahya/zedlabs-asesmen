# Frontend Blueprint - Astro Exam System

> Auto-generated blueprint untuk frontend Astro
> Sistem Asesmen/Ujian Sekolah & Madrasah
> Offline-First Multi-Tenant Web Application

## 📋 Informasi Project

- **Framework**: Astro (SSR + SSG)
- **Styling**: TailwindCSS + DaisyUI
- **State**: Nanostores (with persistence)
- **Database**: IndexedDB (Dexie.js)
- **PWA**: Service Worker enabled
- **Target**: Android WebView optimized

---

## 📁 Direktori: src

**Core application code** - Components, pages, layouts, lib, stores

### 📂 Sub-direktori: src/components

#### 📄 File: `./src/components/analytics/DashboardStats.astro`

```astro

```

---

#### 📄 File: `./src/components/analytics/ExamStatistics.astro`

```astro

```

---

#### 📄 File: `./src/components/analytics/ItemAnalysisChart.astro`

```astro

```

---

#### 📄 File: `./src/components/analytics/StudentProgress.astro`

```astro

```

---

#### 📄 File: `./src/components/auth/DeviceLockWarning.astro`

```astro

```

---

#### 📄 File: `./src/components/auth/LoginForm.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/AutoSaveIndicator.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/ExamInstructions.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/ExamTimer.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/MediaPlayer.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/MediaRecorder.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/ProgressBar.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/QuestionNavigation.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/Essay.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/Matching.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/MultipleChoice.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/MultipleChoiceComplex.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/ShortAnswer.astro`

```astro

```

---

#### 📄 File: `./src/components/exam/QuestionTypes/TrueFalse.astro`

```astro

```

---

#### 📄 File: `./src/components/grading/AudioPlayer.astro`

```astro

```

---

#### 📄 File: `./src/components/grading/GradingRubric.astro`

```astro

```

---

#### 📄 File: `./src/components/grading/ManualGradingCard.astro`

```astro

```

---

#### 📄 File: `./src/components/layout/Footer.astro`

```astro

```

---

#### 📄 File: `./src/components/layout/Header.astro`

```astro

```

---

#### 📄 File: `./src/components/layout/MainLayout.astro`

```astro

```

---

#### 📄 File: `./src/components/layout/Sidebar.astro`

```astro

```

---

#### 📄 File: `./src/components/madrasah/ArabicKeyboard.astro`

```astro

```

---

#### 📄 File: `./src/components/madrasah/HafalanRecorder.astro`

```astro

```

---

#### 📄 File: `./src/components/madrasah/QuranDisplay.astro`

```astro

```

---

#### 📄 File: `./src/components/madrasah/TajwidMarker.astro`

```astro

```

---

#### 📄 File: `./src/components/monitoring/ActivityLogViewer.astro`

```astro

```

---

#### 📄 File: `./src/components/monitoring/LiveMonitor.astro`

```astro

```

---

#### 📄 File: `./src/components/monitoring/StudentProgressCard.astro`

```astro

```

---

#### 📄 File: `./src/components/questions/MatchingEditor.astro`

```astro

```

---

#### 📄 File: `./src/components/questions/MediaUpload.astro`

```astro

```

---

#### 📄 File: `./src/components/questions/OptionsEditor.astro`

```astro

```

---

#### 📄 File: `./src/components/questions/QuestionEditor.astro`

```astro

```

---

#### 📄 File: `./src/components/questions/TagSelector.astro`

```astro

```

---

#### 📄 File: `./src/components/sync/ChecksumValidator.astro`

```astro

```

---

#### 📄 File: `./src/components/sync/DownloadProgress.astro`

```astro

```

---

#### 📄 File: `./src/components/sync/SyncStatus.astro`

```astro

```

---

#### 📄 File: `./src/components/sync/UploadQueue.astro`

```astro

```

---

#### 📄 File: `./src/components/ui/Alert.astro`

```astro
---
// src/components/ui/Alert.astro
interface Props {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  class?: string;
}

const {
  type = 'info',
  title,
  dismissible = false,
  class: className = '',
} = Astro.props;

const typeClass = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
}[type];
---

<div class:list={['alert', typeClass, className]} role="alert">
  <div class="flex-1">
    {title && <h3 class="font-bold">{title}</h3>}
    <div class="text-sm">
      <slot />
    </div>
  </div>
  
  {dismissible && (
    <button class="btn btn-sm btn-ghost" onclick="this.parentElement.remove()">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )}
</div>
```

---

#### 📄 File: `./src/components/ui/Badge.astro`

```astro

```

---

#### 📄 File: `./src/components/ui/Button.astro`

```astro
---
// src/components/ui/Button.astro
interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'error' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  class?: string;
}

const {
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  block = false,
  class: className = '',
} = Astro.props;

const variantClass = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  link: 'btn-link',
  error: 'btn-error',
  success: 'btn-success',
}[variant];

const sizeClass = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}[size];
---

<button
  type={type}
  class:list={[
    'btn',
    variantClass,
    sizeClass,
    { 'btn-block': block },
    { 'loading': loading },
    className,
  ]}
  disabled={disabled || loading}
>
  <slot />
</button>
```

---

#### 📄 File: `./src/components/ui/Card.astro`

```astro
---
// src/components/ui/Card.astro
interface Props {
  title?: string;
  bordered?: boolean;
  compact?: boolean;
  class?: string;
}

const {
  title,
  bordered = false,
  compact = false,
  class: className = '',
} = Astro.props;
---

<div class:list={[
  'card bg-base-100',
  { 'card-bordered': bordered },
  { 'card-compact': compact },
  'shadow-xl',
  className,
]}>
  {title && (
    <div class="card-body">
      <h2 class="card-title">{title}</h2>
      <slot />
    </div>
  )}
  
  {!title && (
    <div class="card-body">
      <slot />
    </div>
  )}
</div>
```

---

#### 📄 File: `./src/components/ui/Input.astro`

```astro
---
// src/components/ui/Input.astro
interface Props {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  class?: string;
}

const {
  type = 'text',
  name,
  label,
  placeholder,
  value,
  required = false,
  disabled = false,
  error,
  class: className = '',
} = Astro.props;
---

<div class:list={['form-control', className]}>
  {label && (
    <label class="label" for={name}>
      <span class="label-text">
        {label}
        {required && <span class="text-error ml-1">*</span>}
      </span>
    </label>
  )}
  
  <input
    type={type}
    id={name}
    name={name}
    placeholder={placeholder}
    value={value}
    required={required}
    disabled={disabled}
    class:list={[
      'input input-bordered',
      { 'input-error': error },
    ]}
  />
  
  {error && (
    <label class="label">
      <span class="label-text-alt text-error">{error}</span>
    </label>
  )}
</div>
```

---

#### 📄 File: `./src/components/ui/Loading.astro`

```astro
---
// src/components/ui/Loading.astro
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

const {
  size = 'md',
  text,
  fullscreen = false,
} = Astro.props;

const sizeClass = {
  xs: 'loading-xs',
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
}[size];
---

{fullscreen ? (
  <div class="fixed inset-0 bg-base-200/80 flex items-center justify-center z-50">
    <div class="text-center">
      <span class:list={['loading loading-spinner', sizeClass]}></span>
      {text && <p class="mt-4 text-base-content">{text}</p>}
    </div>
  </div>
) : (
  <div class="flex items-center gap-2">
    <span class:list={['loading loading-spinner', sizeClass]}></span>
    {text && <span>{text}</span>}
  </div>
)}
```

---

#### 📄 File: `./src/components/ui/Modal.astro`

```astro

```

---

#### 📄 File: `./src/components/ui/Select.astro`

```astro

```

---

#### 📄 File: `./src/components/ui/Spinner.astro`

```astro

```

---

#### 📄 File: `./src/components/ui/Table.astro`

```astro

```

---

#### 📄 File: `./src/components/ui/Tabs.astro`

```astro

```

---

#### 📄 File: `./src/components/ui/Toast.astro`

```astro

```

---

#### 📄 File: `./src/components/ui/Tooltip.astro`

```astro

```

---

### 📂 Sub-direktori: src/pages

#### 📄 File: `./src/pages/api/health.ts`

```typescript

```

---

#### 📄 File: `./src/pages/guru/dashboard.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/grading/index.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/grading/[attemptId].astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/hasil.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/soal/create.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/soal/import.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/soal/index.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/soal/[id]/edit.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/ujian/create.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/ujian/index.astro`

```astro

```

---

#### 📄 File: `./src/pages/guru/ujian/[id]/{edit,preview,statistics}.astro`

```astro

```

---

#### 📄 File: `./src/pages/index.astro`

```astro
---
// src/pages/index.astro
---

<script>
  import { $authStore } from '@/stores/auth';
  
  const authState = $authStore.get();
  
  if (!authState.isAuthenticated) {
    window.location.href = '/login';
  } else {
    const role = authState.user?.role;
    
    switch (role) {
      case 'siswa':
        window.location.href = '/siswa/dashboard';
        break;
      case 'guru':
        window.location.href = '/guru/dashboard';
        break;
      case 'pengawas':
        window.location.href = '/pengawas/dashboard';
        break;
      case 'operator':
        window.location.href = '/operator/dashboard';
        break;
      case 'superadmin':
        window.location.href = '/superadmin/dashboard';
        break;
      default:
        window.location.href = '/login';
    }
  }
</script>
```

---

#### 📄 File: `./src/pages/login.astro`

```astro
---
// src/pages/login.astro
import Base from '@/layouts/Base.astro';
import Button from '@/components/ui/Button.astro';
import Input from '@/components/ui/Input.astro';
import Alert from '@/components/ui/Alert.astro';
---

<Base title="Login - Sistem Ujian">
  <div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-4">
          Sistem Ujian Sekolah
        </h2>
        
        <div id="error-alert" class="hidden mb-4">
          <Alert type="error" dismissible>
            <span id="error-message"></span>
          </Alert>
        </div>
        
        <form id="login-form">
          <Input
            name="username"
            label="Username"
            placeholder="Masukkan username"
            required
          />
          
          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="Masukkan password"
            required
            class="mt-4"
          />
          
          <div class="form-control mt-6">
            <Button type="submit" block>
              <span id="login-text">Login</span>
              <span id="login-loading" class="loading loading-spinner loading-sm hidden"></span>
            </Button>
          </div>
        </form>
        
        <div class="text-center mt-4 text-sm text-base-content/70">
          <p>Pastikan koneksi internet stabil untuk login pertama kali</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    import { login } from '@/lib/api/auth';
    
    const form = document.getElementById('login-form') as HTMLFormElement;
    const errorAlert = document.getElementById('error-alert') as HTMLElement;
    const errorMessage = document.getElementById('error-message') as HTMLElement;
    const loginText = document.getElementById('login-text') as HTMLElement;
    const loginLoading = document.getElementById('login-loading') as HTMLElement;
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      errorAlert.classList.add('hidden');
      submitBtn.disabled = true;
      loginText.classList.add('hidden');
      loginLoading.classList.remove('hidden');
      
      const formData = new FormData(form);
      const credentials = {
        username: formData.get('username') as string,
        password: formData.get('password') as string,
      };
      
      try {
        await login(credentials);
        
        window.location.href = '/siswa/dashboard';
      } catch (error: any) {
        errorMessage.textContent = error.response?.data?.error || 'Login gagal. Periksa username dan password Anda.';
        errorAlert.classList.remove('hidden');
        
        submitBtn.disabled = false;
        loginText.classList.remove('hidden');
        loginLoading.classList.add('hidden');
      }
    });
  </script>
</Base>
```

---

#### 📄 File: `./src/pages/offline.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/dashboard.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/laporan.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/peserta/import.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/peserta/index.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/ruang/create.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/ruang/index.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/ruang/[id]/edit.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/sesi/create.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/sesi/index.astro`

```astro

```

---

#### 📄 File: `./src/pages/operator/sesi/[id]/edit.astro`

```astro

```

---

#### 📄 File: `./src/pages/pengawas/dashboard.astro`

```astro

```

---

#### 📄 File: `./src/pages/pengawas/monitoring/live.astro`

```astro

```

---

#### 📄 File: `./src/pages/pengawas/monitoring/session/[id].astro`

```astro

```

---

#### 📄 File: `./src/pages/siswa/dashboard.astro`

```astro

```

---

#### 📄 File: `./src/pages/siswa/profile.astro`

```astro

```

---

#### 📄 File: `./src/pages/siswa/ujian/download.astro`

```astro

```

---

#### 📄 File: `./src/pages/siswa/ujian/index.astro`

```astro

```

---

#### 📄 File: `./src/pages/siswa/ujian/result.astro`

```astro

```

---

#### 📄 File: `./src/pages/siswa/ujian/[id].astro`

```astro

```

---

#### 📄 File: `./src/pages/superadmin/audit-logs.astro`

```astro

```

---

#### 📄 File: `./src/pages/superadmin/dashboard.astro`

```astro

```

---

#### 📄 File: `./src/pages/superadmin/schools/create.astro`

```astro

```

---

#### 📄 File: `./src/pages/superadmin/schools/index.astro`

```astro

```

---

#### 📄 File: `./src/pages/superadmin/schools/[id]/edit.astro`

```astro

```

---

#### 📄 File: `./src/pages/superadmin/settings.astro`

```astro

```

---

#### 📄 File: `./src/pages/superadmin/users.astro`

```astro

```

---

### 📂 Sub-direktori: src/layouts

#### 📄 File: `./src/layouts/Auth.astro`

```astro

```

---

#### 📄 File: `./src/layouts/Base.astro`

```astro
---
// src/layouts/Base.astro
import '@/styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Sistem Ujian Sekolah' } = Astro.props;
---

<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/manifest.json" />
    
    <meta name="theme-color" content="#3b82f6" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  </head>
  <body>
    <slot />
    
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(
          (registration) => {
            console.log('Service Worker registered:', registration);
          },
          (error) => {
            console.error('Service Worker registration failed:', error);
          }
        );
      }
      
      import { $uiStore } from '@/stores/ui';
      
      $uiStore.subscribe((state) => {
        document.documentElement.setAttribute('data-theme', state.theme);
        
        document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
        if (state.fontSize === 'small') document.documentElement.classList.add('text-sm');
        if (state.fontSize === 'large') document.documentElement.classList.add('text-lg');
        
        if (state.highContrast) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      });
      
      const initialState = $uiStore.get();
      document.documentElement.setAttribute('data-theme', initialState.theme);
    </script>
  </body>
</html>
```

---

#### 📄 File: `./src/layouts/Dashboard.astro`

```astro

```

---

#### 📄 File: `./src/layouts/Exam.astro`

```astro

```

---

### 📂 Sub-direktori: src/lib

#### 📄 File: `./src/lib/api/analytics.ts`

```typescript

```

---

#### 📄 File: `./src/lib/api/auth.ts`

```typescript
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
```

---

#### 📄 File: `./src/lib/api/client.ts`

```typescript
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
```

---

#### 📄 File: `./src/lib/api/exam.ts`

```typescript
// src/lib/api/exam.ts
import { apiClient } from './client';
import type { Exam, ExamAttempt } from '@/types/exam';
import type { ExamDownloadResponse } from '@/types/api';

export async function getAvailableExams() {
  const response = await apiClient.get<Exam[]>('/student/exams');
  return response.data;
}

export async function getExamById(examId: number) {
  const response = await apiClient.get<Exam>(`/student/exams/${examId}`);
  return response.data;
}

export async function prepareExam(examId: number) {
  const response = await apiClient.post<{ attempt_id: number }>(`/student/exams/${examId}/prepare`);
  return response.data;
}

export async function downloadExamData(examId: number) {
  const response = await apiClient.get<ExamDownloadResponse>(`/student/exams/${examId}/download`);
  return response.data;
}

export async function getExamAttempt(attemptId: number) {
  const response = await apiClient.get<ExamAttempt>(`/student/attempts/${attemptId}`);
  return response.data;
}

export async function submitExam(attemptId: number, data: any) {
  const response = await apiClient.post(`/student/attempts/${attemptId}/submit`, data);
  return response.data;
}

export async function saveAnswers(attemptId: number, answers: any[]) {
  const response = await apiClient.post(`/student/attempts/${attemptId}/answers`, {
    answers,
  });
  return response.data;
}

export async function saveActivityLogs(attemptId: number, events: any[]) {
  const response = await apiClient.post(`/student/attempts/${attemptId}/activity`, {
    events,
  });
  return response.data;
}
```

---

#### 📄 File: `./src/lib/api/grading.ts`

```typescript

```

---

#### 📄 File: `./src/lib/api/media.ts`

```typescript

```

---

#### 📄 File: `./src/lib/api/monitoring.ts`

```typescript

```

---

#### 📄 File: `./src/lib/api/question.ts`

```typescript

```

---

#### 📄 File: `./src/lib/api/student.ts`

```typescript

```

---

#### 📄 File: `./src/lib/api/sync.ts`

```typescript

```

---

#### 📄 File: `./src/lib/config/app.ts`

```typescript

```

---

#### 📄 File: `./src/lib/config/theme.ts`

```typescript

```

---

#### 📄 File: `./src/lib/constants/api.ts`

```typescript

```

---

#### 📄 File: `./src/lib/constants/exam.ts`

```typescript

```

---

#### 📄 File: `./src/lib/constants/media.ts`

```typescript

```

---

#### 📄 File: `./src/lib/constants/storage.ts`

```typescript

```

---

#### 📄 File: `./src/lib/constants/validation.ts`

```typescript

```

---

#### 📄 File: `./src/lib/db/encryption.ts`

```typescript
// src/lib/db/encryption.ts
import CryptoJS from 'crypto-js';

// Secret key - in production, this should be derived from user credentials
// For now, we use a fixed key (NOT SECURE FOR PRODUCTION)
const SECRET_KEY = 'exam-app-secret-key-2024';

/**
 * Encrypt data using AES
 */
export function encrypt(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES
 */
export function decrypt(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash data using SHA256
 */
export function hash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Generate random IV for encryption
 */
export function generateIV(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}
```

---

#### 📄 File: `./src/lib/db/indexedDB.ts`

```typescript

```

---

#### 📄 File: `./src/lib/db/migrations.ts`

```typescript

```

---

#### 📄 File: `./src/lib/db/queries.ts`

```typescript
// src/lib/db/queries.ts
import { db } from './schema';
import type { ExamAnswer } from '@/types/answer';
import type { ActivityLog } from '@/types/activity';
import type { SyncQueueItem } from '@/types/sync';

/**
 * Get all answers for an attempt
 */
export async function getAnswersByAttempt(attemptId: number): Promise<ExamAnswer[]> {
  return await db.exam_answers
    .where('attempt_id')
    .equals(attemptId)
    .toArray();
}

/**
 * Get unsynced answers
 */
export async function getUnsyncedAnswers(): Promise<ExamAnswer[]> {
  return await db.exam_answers
    .where('synced')
    .equals(0)
    .toArray();
}

/**
 * Mark answer as synced
 */
export async function markAnswerSynced(answerId: number): Promise<void> {
  await db.exam_answers.update(answerId, { synced: true });
}

/**
 * Get activity logs for an attempt
 */
export async function getActivityLogsByAttempt(attemptId: number): Promise<ActivityLog[]> {
  return await db.activity_logs
    .where('attempt_id')
    .equals(attemptId)
    .sortBy('timestamp');
}

/**
 * Get unsynced activity logs
 */
export async function getUnsyncedActivityLogs(): Promise<ActivityLog[]> {
  return await db.activity_logs
    .where('synced')
    .equals(0)
    .toArray();
}

/**
 * Get pending sync queue items
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return await db.sync_queue
    .where('status')
    .equals('pending')
    .or('status')
    .equals('failed')
    .filter(item => item.retry_count < item.max_retries)
    .sortBy('priority');
}

/**
 * Get sync queue items by attempt
 */
export async function getSyncItemsByAttempt(attemptId: number): Promise<SyncQueueItem[]> {
  return await db.sync_queue
    .where('attempt_id')
    .equals(attemptId)
    .toArray();
}

/**
 * Clear all data (for logout)
 */
export async function clearAllData(): Promise<void> {
  await db.exam_answers.clear();
  await db.activity_logs.clear();
  await db.sync_queue.clear();
  await db.exam_states.clear();
  await db.downloaded_exams.clear();
  await db.media_files.clear();
}

/**
 * Get database size estimate
 */
export async function getDatabaseSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}
```

---

#### 📄 File: `./src/lib/db/schema.ts`

```typescript
// src/lib/db/schema.ts
import Dexie, { Table } from 'dexie';
import type { School, User } from '@/types/user';
import type { DownloadedExam, MediaFile } from '@/types/exam';
import type { ExamAnswer } from '@/types/answer';
import type { ActivityLog } from '@/types/activity';
import type { SyncQueueItem } from '@/types/sync';
import type { ExamState } from '@/types/exam';

// Database class
export class ExamDatabase extends Dexie {
  schools!: Table<School, number>;
  users!: Table<User, number>;
  downloaded_exams!: Table<DownloadedExam, number>;
  media_files!: Table<MediaFile, string>;
  exam_answers!: Table<ExamAnswer, number>;
  activity_logs!: Table<ActivityLog, number>;
  sync_queue!: Table<SyncQueueItem, number>;
  exam_states!: Table<ExamState, number>;

  constructor() {
    super('ExamDB');

    this.version(1).stores({
      schools: 'id, subdomain',
      users: 'id, school_id, username',
      downloaded_exams: 'exam_id, attempt_id, downloaded_at',
      media_files: 'id, url, downloaded',
      exam_answers: '++id, attempt_id, question_id, synced',
      activity_logs: '++id, attempt_id, timestamp, synced',
      sync_queue: '++id, attempt_id, type, status, priority',
      exam_states: 'attempt_id',
    });
  }
}

export const db = new ExamDatabase();
```

---

#### 📄 File: `./src/lib/exam/activityLogger.ts`

```typescript
// src/lib/exam/activityLogger.ts
import { db } from '@/lib/db/schema';
import type { ActivityLog, ActivityEventType } from '@/types/activity';

export class ActivityLogger {
  private attemptId: number;

  constructor(attemptId: number) {
    this.attemptId = attemptId;
  }

  async log(eventType: ActivityEventType, eventData?: any): Promise<void> {
    const log: ActivityLog = {
      attempt_id: this.attemptId,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date(),
      synced: false,
    };

    await db.activity_logs.add(log);
  }

  async getLogs(): Promise<ActivityLog[]> {
    return await db.activity_logs
      .where('attempt_id')
      .equals(this.attemptId)
      .sortBy('timestamp');
  }

  async getUnsyncedLogs(): Promise<ActivityLog[]> {
    return await db.activity_logs
      .where('attempt_id')
      .equals(this.attemptId)
      .and(log => !log.synced)
      .sortBy('timestamp');
  }

  async markSynced(logIds: number[]): Promise<void> {
    for (const id of logIds) {
      await db.activity_logs.update(id, { synced: true });
    }
  }
}
```

---

#### 📄 File: `./src/lib/exam/autoSave.ts`

```typescript
// src/lib/exam/autoSave.ts
export class AutoSaveManager {
  private attemptId: number;
  private intervalId: number | null = null;
  private isPaused: boolean = false;
  private onSaveCallback: (() => Promise<void>) | null = null;

  constructor(attemptId: number) {
    this.attemptId = attemptId;
  }

  start(intervalMs: number, onSave: () => Promise<void>): void {
    this.onSaveCallback = onSave;
    this.isPaused = false;

    this.intervalId = window.setInterval(async () => {
      if (!this.isPaused && this.onSaveCallback) {
        try {
          await this.onSaveCallback();
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, intervalMs);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async saveNow(): Promise<void> {
    if (this.onSaveCallback) {
      await this.onSaveCallback();
    }
  }
}
```

---

#### 📄 File: `./src/lib/exam/controller.ts`

```typescript
// src/lib/exam/controller.ts
import { db } from '@/lib/db/schema';
import type { Exam, ExamState } from '@/types/exam';
import type { Question } from '@/types/question';
import type { ExamAnswer } from '@/types/answer';

export class ExamController {
  private exam: Exam;
  private questions: Question[];
  private attemptId: number;
  private currentQuestionIndex: number = 0;
  private answers: Map<number, ExamAnswer> = new Map();
  private flags: Set<number> = new Set();

  constructor(exam: Exam, questions: Question[], attemptId: number) {
    this.exam = exam;
    this.questions = questions;
    this.attemptId = attemptId;
  }

  async start(): Promise<void> {
    await this.saveState();
  }

  async loadState(): Promise<void> {
    const state = await db.exam_states.get(this.attemptId);
    
    if (state) {
      this.currentQuestionIndex = state.current_question_index;
      this.flags = new Set(state.flags);
      
      for (const [questionId, answer] of Object.entries(state.answers)) {
        this.answers.set(parseInt(questionId), answer as ExamAnswer);
      }
    }
    
    const savedAnswers = await db.exam_answers
      .where('attempt_id')
      .equals(this.attemptId)
      .toArray();
    
    savedAnswers.forEach(answer => {
      this.answers.set(answer.question_id, answer);
    });
  }

  async saveState(): Promise<void> {
    const answersObj: Record<number, any> = {};
    this.answers.forEach((answer, questionId) => {
      answersObj[questionId] = answer;
    });

    const state: ExamState = {
      attempt_id: this.attemptId,
      current_question_index: this.currentQuestionIndex,
      time_remaining_seconds: 0,
      started_at: new Date(),
      answers: answersObj,
      flags: Array.from(this.flags),
    };

    await db.exam_states.put(state);
  }

  getCurrentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  getQuestions(): Question[] {
    return this.questions;
  }

  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex;
  }

  getTotalQuestions(): number {
    return this.questions.length;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.saveState();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.saveState();
    }
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
      this.saveState();
    }
  }

  saveAnswer(questionId: number, answer: ExamAnswer): void {
    this.answers.set(questionId, answer);
    this.saveState();
  }

  getAnswer(questionId: number): ExamAnswer | undefined {
    return this.answers.get(questionId);
  }

  getAnswers(): ExamAnswer[] {
    return Array.from(this.answers.values());
  }

  toggleFlag(questionId: number): void {
    if (this.flags.has(questionId)) {
      this.flags.delete(questionId);
    } else {
      this.flags.add(questionId);
    }
    this.saveState();
  }

  isFlagged(questionId: number): boolean {
    return this.flags.has(questionId);
  }

  getAnsweredCount(): number {
    return this.answers.size;
  }

  isAnswered(questionId: number): boolean {
    return this.answers.has(questionId);
  }

  getAttemptId(): number {
    return this.attemptId;
  }

  getExam(): Exam {
    return this.exam;
  }
}
```

---

#### 📄 File: `./src/lib/exam/navigation.ts`

```typescript

```

---

#### 📄 File: `./src/lib/exam/randomizer.ts`

```typescript

```

---

#### 📄 File: `./src/lib/exam/stateManager.ts`

```typescript

```

---

#### 📄 File: `./src/lib/exam/timer.ts`

```typescript
// src/lib/exam/timer.ts
export class TimerController {
  private timeRemaining: number;
  private intervalId: number | null = null;
  private onTickCallback: ((timeRemaining: number) => void) | null = null;
  private isPaused: boolean = false;

  constructor(durationSeconds: number) {
    this.timeRemaining = durationSeconds;
  }

  start(onTick: (timeRemaining: number) => void): void {
    this.onTickCallback = onTick;
    this.isPaused = false;

    this.intervalId = window.setInterval(() => {
      if (!this.isPaused && this.timeRemaining > 0) {
        this.timeRemaining--;
        this.onTickCallback?.(this.timeRemaining);
      }

      if (this.timeRemaining <= 0) {
        this.stop();
      }
    }, 1000);

    this.onTickCallback(this.timeRemaining);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getTimeRemaining(): number {
    return this.timeRemaining;
  }

  setTimeRemaining(seconds: number): void {
    this.timeRemaining = seconds;
  }

  addTime(seconds: number): void {
    this.timeRemaining += seconds;
  }

  subtractTime(seconds: number): void {
    this.timeRemaining = Math.max(0, this.timeRemaining - seconds);
  }
}
```

---

#### 📄 File: `./src/lib/exam/validator.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useAuth.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useAutoSave.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useDeviceWarnings.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useExam.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useLocalStorage.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useMediaRecorder.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useOnlineStatus.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useTimer.ts`

```typescript

```

---

#### 📄 File: `./src/lib/hooks/useToast.ts`

```typescript

```

---

#### 📄 File: `./src/lib/media/compress.ts`

```typescript

```

---

#### 📄 File: `./src/lib/media/download.ts`

```typescript

```

---

#### 📄 File: `./src/lib/media/player.ts`

```typescript

```

---

#### 📄 File: `./src/lib/media/recorder.ts`

```typescript

```

---

#### 📄 File: `./src/lib/media/stream.ts`

```typescript

```

---

#### 📄 File: `./src/lib/media/upload.ts`

```typescript

```

---

#### 📄 File: `./src/lib/offline/cache.ts`

```typescript

```

---

#### 📄 File: `./src/lib/offline/checksum.ts`

```typescript
// src/lib/offline/checksum.ts
import CryptoJS from 'crypto-js';

export function generateChecksum(data: any): string {
  const jsonString = JSON.stringify(data);
  return CryptoJS.SHA256(jsonString).toString();
}

export async function sha256ArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validateChecksum(data: any, expectedChecksum: string): boolean {
  const actualChecksum = generateChecksum(data);
  return actualChecksum === expectedChecksum;
}

export async function generateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return await sha256ArrayBuffer(buffer);
}

export async function generateBlobChecksum(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return await sha256ArrayBuffer(buffer);
}
```

---

#### 📄 File: `./src/lib/offline/compress.ts`

```typescript
// src/lib/offline/compress.ts
import pako from 'pako';

export function compressData(data: string): Uint8Array {
  return pako.deflate(data);
}

export function decompressData(compressed: Uint8Array): string {
  return pako.inflate(compressed, { to: 'string' });
}

export function compressJSON(obj: any): Uint8Array {
  const jsonString = JSON.stringify(obj);
  return compressData(jsonString);
}

export function decompressJSON(compressed: Uint8Array): any {
  const jsonString = decompressData(compressed);
  return JSON.parse(jsonString);
}

export function base64Encode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data));
}

export function base64Decode(encoded: string): Uint8Array {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
```

---

#### 📄 File: `./src/lib/offline/download.ts`

```typescript
// src/lib/offline/download.ts
import { apiClient } from '@/lib/api/client';
import { db } from '@/lib/db/schema';
import { encrypt } from '@/lib/db/encryption';
import { generateChecksum, sha256ArrayBuffer } from './checksum';
import type { DownloadProgress } from '@/types/sync';
import type { MediaFile } from '@/types/exam';

export async function downloadExam(
  examId: number,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  try {
    onProgress?.({
      phase: 'preparing',
      current: 0,
      total: 1,
      percentage: 0,
    });

    const prepareResponse = await apiClient.post(`/student/exams/${examId}/prepare`);
    const { attempt_id } = prepareResponse.data;

    onProgress?.({
      phase: 'exam_data',
      current: 0,
      total: 1,
      percentage: 10,
    });

    const downloadResponse = await apiClient.get(`/student/exams/${examId}/download`);
    const { exam, questions, media_files, checksum } = downloadResponse.data;

    const calculatedChecksum = generateChecksum({ exam, questions });
    if (calculatedChecksum !== checksum) {
      throw new Error('Checksum validation failed');
    }

    const encryptedExam = encrypt(JSON.stringify(exam));
    const encryptedQuestions = encrypt(JSON.stringify(questions));

    await db.downloaded_exams.put({
      exam_id: examId,
      attempt_id: attempt_id,
      exam_data: encryptedExam,
      questions: encryptedQuestions,
      media_files: media_files,
      checksum: checksum,
      downloaded_at: new Date(),
      expires_at: new Date(exam.window_end_at),
    });

    onProgress?.({
      phase: 'media_files',
      current: 0,
      total: media_files.length,
      percentage: 20,
    });

    for (let i = 0; i < media_files.length; i++) {
      const mediaFile = media_files[i];

      onProgress?.({
        phase: 'media_files',
        current: i + 1,
        total: media_files.length,
        currentFile: mediaFile.url,
        percentage: 20 + ((i + 1) / media_files.length) * 70,
      });

      await downloadMediaFile(mediaFile);
    }

    onProgress?.({
      phase: 'complete',
      current: media_files.length,
      total: media_files.length,
      percentage: 100,
    });
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

async function downloadMediaFile(mediaFile: MediaFile): Promise<void> {
  try {
    const response = await fetch(mediaFile.url);
    const blob = await response.blob();

    const arrayBuffer = await blob.arrayBuffer();
    const calculatedChecksum = await sha256ArrayBuffer(arrayBuffer);

    if (calculatedChecksum !== mediaFile.checksum) {
      throw new Error(`Checksum mismatch for ${mediaFile.url}`);
    }

    await db.media_files.put({
      id: mediaFile.id,
      url: mediaFile.url,
      local_path: `blob:${mediaFile.id}`,
      checksum: mediaFile.checksum,
      size: blob.size,
      type: mediaFile.type,
      downloaded: true,
    });
  } catch (error) {
    console.error(`Failed to download ${mediaFile.url}:`, error);
    throw error;
  }
}

export async function deleteDownloadedExam(examId: number): Promise<void> {
  await db.downloaded_exams.where('exam_id').equals(examId).delete();
  
  const mediaFiles = await db.media_files.toArray();
  for (const file of mediaFiles) {
    await db.media_files.delete(file.id);
  }
}
```

---

#### 📄 File: `./src/lib/offline/queue.ts`

```typescript

```

---

#### 📄 File: `./src/lib/offline/sync.ts`

```typescript
// src/lib/offline/sync.ts
import { db } from '@/lib/db/schema';
import { apiClient } from '@/lib/api/client';
import type { SyncQueueItem, SyncProgress } from '@/types/sync';

export class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.stopSync();
    });
  }

  start(): void {
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, 30000);

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async processSyncQueue(): Promise<void> {
    if (this.isSyncing) return;

    this.isSyncing = true;

    try {
      const pendingItems = await db.sync_queue
        .where('status')
        .equals('pending')
        .or('status')
        .equals('failed')
        .filter(item => item.retry_count < item.max_retries)
        .sortBy('priority');

      for (const item of pendingItems.reverse()) {
        await this.processItem(item);
      }
    } catch (error) {
      console.error('Sync queue processing failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    try {
      await db.sync_queue.update(item.id!, { status: 'processing' });

      switch (item.type) {
        case 'answer':
          await this.syncAnswer(item);
          break;
        case 'media':
          await this.syncMedia(item);
          break;
        case 'activity':
          await this.syncActivity(item);
          break;
        case 'submission':
          await this.syncSubmission(item);
          break;
      }

      await db.sync_queue.update(item.id!, {
        status: 'completed',
        processed_at: new Date(),
      });

      window.dispatchEvent(
        new CustomEvent('sync:progress', {
          detail: { item, status: 'completed' },
        })
      );
    } catch (error: any) {
      console.error(`Failed to sync item ${item.id}:`, error);

      const newRetryCount = item.retry_count + 1;

      if (newRetryCount >= item.max_retries) {
        await db.sync_queue.update(item.id!, {
          status: 'failed',
          retry_count: newRetryCount,
          error_message: error.message,
        });

        window.dispatchEvent(
          new CustomEvent('sync:error', {
            detail: { item, error: error.message },
          })
        );
      } else {
        await db.sync_queue.update(item.id!, {
          status: 'pending',
          retry_count: newRetryCount,
          error_message: error.message,
        });
      }
    }
  }

  private async syncAnswer(item: SyncQueueItem): Promise<void> {
    const { attempt_id, answers } = item.data;
    await apiClient.post(`/student/attempts/${attempt_id}/answers`, { answers });
  }

  private async syncMedia(item: SyncQueueItem): Promise<void> {
    const { attempt_id, answer_id, media_blob, checksum } = item.data;
    
    const formData = new FormData();
    formData.append('file', media_blob);
    formData.append('checksum', checksum);
    
    await apiClient.post(`/student/attempts/${attempt_id}/answers/${answer_id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  private async syncActivity(item: SyncQueueItem): Promise<void> {
    const { attempt_id, events } = item.data;
    await apiClient.post(`/student/attempts/${attempt_id}/activity`, { events });
  }

  private async syncSubmission(item: SyncQueueItem): Promise<void> {
    const { attempt_id, submitted_at, answers, activity_logs } = item.data;
    await apiClient.post(`/student/attempts/${attempt_id}/submit`, {
      submitted_at,
      answers,
      activity_logs,
    });
  }

  async getSyncStatus(attemptId: number): Promise<SyncProgress> {
    const items = await db.sync_queue
      .where('attempt_id')
      .equals(attemptId)
      .toArray();

    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const failed = items.filter(i => i.status === 'failed').length;
    const pending = items.filter(i => i.status === 'pending' || i.status === 'processing').length;

    return {
      total,
      completed,
      failed,
      pending,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}

export const syncManager = new SyncManager();
```

---

#### 📄 File: `./src/lib/utils/crypto.ts`

```typescript

```

---

#### 📄 File: `./src/lib/utils/device.ts`

```typescript
// src/lib/utils/device.ts
import CryptoJS from 'crypto-js';

/**
 * Generate unique device fingerprint
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 3. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. Language
  components.push(navigator.language);

  // 5. Platform
  components.push(navigator.platform);

  // 6. Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency?.toString() || '0');

  // 7. Canvas fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('ExamApp', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('ExamApp', 4, 17);
    components.push(canvas.toDataURL());
  }

  // 8. WebGL fingerprint
  try {
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {
    // WebGL not supported
  }

  // Combine and hash
  const fingerprint = components.join('|||');
  return CryptoJS.SHA256(fingerprint).toString();
}

/**
 * Get device information
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cpuCores: navigator.hardwareConcurrency || 0,
  };
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  return /iPad|Android/i.test(navigator.userAgent) && !isMobile();
}

/**
 * Get battery status
 */
export async function getBatteryStatus(): Promise<{
  level: number;
  charging: boolean;
} | null> {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
      };
    } catch (error) {
      console.error('Failed to get battery status:', error);
      return null;
    }
  }
  return null;
}
```

---

#### 📄 File: `./src/lib/utils/error.ts`

```typescript

```

---

#### 📄 File: `./src/lib/utils/format.ts`

```typescript
// src/lib/utils/format.ts
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatScore(score: number, maxScore: number): string {
  return `${score}/${maxScore}`;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

---

#### 📄 File: `./src/lib/utils/logger.ts`

```typescript

```

---

#### 📄 File: `./src/lib/utils/network.ts`

```typescript
// src/lib/utils/network.ts
export function isOnline(): boolean {
  return navigator.onLine;
}

export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
}

export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export async function checkConnection(url: string = '/api/health'): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export function getConnectionType(): string {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.effectiveType || 'unknown';
}
```

---

#### 📄 File: `./src/lib/utils/storage.ts`

```typescript
// src/lib/utils/storage.ts
export async function checkStorageSpace(): Promise<{
  available: number;
  total: number;
  used: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      available: (estimate.quota || 0) - (estimate.usage || 0),
      total: estimate.quota || 0,
      used: estimate.usage || 0,
    };
  }
  
  return {
    available: 0,
    total: 0,
    used: 0,
  };
}

export async function getStorageUsageGB(): Promise<number> {
  const storage = await checkStorageSpace();
  return storage.used / (1024 ** 3);
}

export async function hasEnoughSpace(requiredBytes: number): Promise<boolean> {
  const storage = await checkStorageSpace();
  return storage.available >= requiredBytes;
}

export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    return await navigator.storage.persist();
  }
  return false;
}

export async function isPersisted(): Promise<boolean> {
  if ('storage' in navigator && 'persisted' in navigator.storage) {
    return await navigator.storage.persisted();
  }
  return false;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

---

#### 📄 File: `./src/lib/utils/time.ts`

```typescript
// src/lib/utils/time.ts
import { formatDistanceToNow, format, differenceInSeconds } from 'date-fns';

export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  
  return `${minutes} menit`;
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy');
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm');
}

export function getTimeRemaining(endDate: Date | string): number {
  return Math.max(0, differenceInSeconds(new Date(endDate), new Date()));
}

export function isWithinTimeWindow(startDate: Date | string, endDate: Date | string): boolean {
  const now = new Date();
  return now >= new Date(startDate) && now <= new Date(endDate);
}
```

---

#### 📄 File: `./src/lib/utils/validation.ts`

```typescript
// src/lib/utils/validation.ts
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20;
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

export function validateMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function validateMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}
```

---

### 📂 Sub-direktori: src/stores

#### 📄 File: `./src/stores/activity.ts`

```typescript
// src/stores/activity.ts
import { atom } from 'nanostores';
import type { ActivityLog } from '@/types/activity';

interface ActivityState {
  logs: ActivityLog[];
  pendingSync: number;
}

const initialState: ActivityState = {
  logs: [],
  pendingSync: 0,
};

export const $activityStore = atom<ActivityState>(initialState);

export function addActivityLog(log: ActivityLog): void {
  const state = $activityStore.get();
  $activityStore.set({
    logs: [...state.logs, log],
    pendingSync: state.pendingSync + 1,
  });
}

export function clearActivityLogs(): void {
  $activityStore.set(initialState);
}

export function decrementPendingSync(): void {
  const state = $activityStore.get();
  $activityStore.set({
    ...state,
    pendingSync: Math.max(0, state.pendingSync - 1),
  });
}
```

---

#### 📄 File: `./src/stores/answers.ts`

```typescript
// src/stores/answers.ts
import { atom } from 'nanostores';
import { db } from '@/lib/db/schema';
import type { ExamAnswer } from '@/types/answer';

interface AnswersState {
  answers: Record<number, ExamAnswer>;
  isDirty: boolean;
  lastSaved: Date | null;
}

const initialState: AnswersState = {
  answers: {},
  isDirty: false,
  lastSaved: null,
};

export const $answersStore = atom<AnswersState>(initialState);

export function setAnswer(questionId: number, answer: ExamAnswer): void {
  const state = $answersStore.get();
  $answersStore.set({
    ...state,
    answers: {
      ...state.answers,
      [questionId]: answer,
    },
    isDirty: true,
  });
}

export function getAnswer(questionId: number): ExamAnswer | undefined {
  return $answersStore.get().answers[questionId];
}

export function getAllAnswers(): ExamAnswer[] {
  return Object.values($answersStore.get().answers);
}

export function setAnswers(answers: Record<number, ExamAnswer>): void {
  $answersStore.set({
    ...$answersStore.get(),
    answers,
  });
}

export async function loadAnswers(attemptId: number): Promise<void> {
  const answers = await db.exam_answers
    .where('attempt_id')
    .equals(attemptId)
    .toArray();
  
  const answersMap: Record<number, ExamAnswer> = {};
  answers.forEach(answer => {
    answersMap[answer.question_id] = answer;
  });
  
  $answersStore.set({
    answers: answersMap,
    isDirty: false,
    lastSaved: new Date(),
  });
}

export async function saveAnswers(attemptId: number): Promise<void> {
  const state = $answersStore.get();
  
  if (!state.isDirty) {
    return;
  }
  
  const answers = Object.values(state.answers);
  
  await db.exam_answers.bulkPut(answers);
  
  $answersStore.set({
    ...state,
    isDirty: false,
    lastSaved: new Date(),
  });
}

export function markSaved(): void {
  $answersStore.set({
    ...$answersStore.get(),
    isDirty: false,
    lastSaved: new Date(),
  });
}

export function clearAnswers(): void {
  $answersStore.set(initialState);
}
```

---

#### 📄 File: `./src/stores/auth.ts`

```typescript
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
```

---

#### 📄 File: `./src/stores/exam.ts`

```typescript
// src/stores/exam.ts
import { atom, computed } from 'nanostores';
import type { Exam, ExamAttempt, ExamState } from '@/types/exam';
import type { Question } from '@/types/question';

interface CurrentExamState {
  exam: Exam | null;
  attempt: ExamAttempt | null;
  questions: Question[];
  currentQuestionIndex: number;
  flags: number[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CurrentExamState = {
  exam: null,
  attempt: null,
  questions: [],
  currentQuestionIndex: 0,
  flags: [],
  isLoading: false,
  error: null,
};

export const $examStore = atom<CurrentExamState>(initialState);

// Computed values
export const $currentQuestion = computed($examStore, (state) => {
  if (state.questions.length === 0) return null;
  return state.questions[state.currentQuestionIndex] || null;
});

export const $totalQuestions = computed($examStore, (state) => {
  return state.questions.length;
});

export const $hasNext = computed($examStore, (state) => {
  return state.currentQuestionIndex < state.questions.length - 1;
});

export const $hasPrevious = computed($examStore, (state) => {
  return state.currentQuestionIndex > 0;
});

// Actions
export function setExam(exam: Exam): void {
  $examStore.set({
    ...$examStore.get(),
    exam,
  });
}

export function setAttempt(attempt: ExamAttempt): void {
  $examStore.set({
    ...$examStore.get(),
    attempt,
  });
}

export function setQuestions(questions: Question[]): void {
  $examStore.set({
    ...$examStore.get(),
    questions,
  });
}

export function setCurrentQuestionIndex(index: number): void {
  const state = $examStore.get();
  if (index >= 0 && index < state.questions.length) {
    $examStore.set({
      ...state,
      currentQuestionIndex: index,
    });
  }
}

export function nextQuestion(): void {
  const state = $examStore.get();
  if (state.currentQuestionIndex < state.questions.length - 1) {
    setCurrentQuestionIndex(state.currentQuestionIndex + 1);
  }
}

export function previousQuestion(): void {
  const state = $examStore.get();
  if (state.currentQuestionIndex > 0) {
    setCurrentQuestionIndex(state.currentQuestionIndex - 1);
  }
}

export function goToQuestion(index: number): void {
  setCurrentQuestionIndex(index);
}

export function toggleFlag(questionId: number): void {
  const state = $examStore.get();
  const flags = [...state.flags];
  const index = flags.indexOf(questionId);
  
  if (index > -1) {
    flags.splice(index, 1);
  } else {
    flags.push(questionId);
  }
  
  $examStore.set({
    ...state,
    flags,
  });
}

export function isFlagged(questionId: number): boolean {
  return $examStore.get().flags.includes(questionId);
}

export function setLoading(isLoading: boolean): void {
  $examStore.set({
    ...$examStore.get(),
    isLoading,
  });
}

export function setError(error: string | null): void {
  $examStore.set({
    ...$examStore.get(),
    error,
  });
}

export function resetExam(): void {
  $examStore.set(initialState);
}
```

---

#### 📄 File: `./src/stores/offline.ts`

```typescript
// src/stores/offline.ts
import { atom } from 'nanostores';
import type { DownloadedExam } from '@/types/exam';

interface OfflineState {
  downloadedExams: DownloadedExam[];
  isDownloading: boolean;
  currentDownload: number | null;
  downloadProgress: number;
}

const initialState: OfflineState = {
  downloadedExams: [],
  isDownloading: false,
  currentDownload: null,
  downloadProgress: 0,
};

export const $offlineStore = atom<OfflineState>(initialState);

export function setDownloadedExams(exams: DownloadedExam[]): void {
  $offlineStore.set({
    ...$offlineStore.get(),
    downloadedExams: exams,
  });
}

export function addDownloadedExam(exam: DownloadedExam): void {
  const state = $offlineStore.get();
  $offlineStore.set({
    ...state,
    downloadedExams: [...state.downloadedExams, exam],
  });
}

export function setDownloading(isDownloading: boolean, examId?: number): void {
  $offlineStore.set({
    ...$offlineStore.get(),
    isDownloading,
    currentDownload: isDownloading ? examId || null : null,
    downloadProgress: isDownloading ? 0 : 100,
  });
}

export function setDownloadProgress(progress: number): void {
  $offlineStore.set({
    ...$offlineStore.get(),
    downloadProgress: progress,
  });
}

export function clearOfflineData(): void {
  $offlineStore.set(initialState);
}
```

---

#### 📄 File: `./src/stores/sync.ts`

```typescript
// src/stores/sync.ts
import { atom } from 'nanostores';
import type { SyncProgress } from '@/types/sync';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  progress: SyncProgress | null;
  lastSync: Date | null;
  error: string | null;
}

const initialState: SyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false,
  isSyncing: false,
  progress: null,
  lastSync: null,
  error: null,
};

export const $syncStore = atom<SyncState>(initialState);

export function setOnlineStatus(isOnline: boolean): void {
  $syncStore.set({
    ...$syncStore.get(),
    isOnline,
  });
}

export function setSyncing(isSyncing: boolean): void {
  $syncStore.set({
    ...$syncStore.get(),
    isSyncing,
  });
}

export function setSyncProgress(progress: SyncProgress): void {
  $syncStore.set({
    ...$syncStore.get(),
    progress,
  });
}

export function setSyncCompleted(): void {
  $syncStore.set({
    ...$syncStore.get(),
    isSyncing: false,
    progress: null,
    lastSync: new Date(),
    error: null,
  });
}

export function setSyncError(error: string): void {
  $syncStore.set({
    ...$syncStore.get(),
    isSyncing: false,
    error,
  });
}

export function clearSyncError(): void {
  $syncStore.set({
    ...$syncStore.get(),
    error: null,
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setOnlineStatus(true));
  window.addEventListener('offline', () => setOnlineStatus(false));
}
```

---

#### 📄 File: `./src/stores/timer.ts`

```typescript
// src/stores/timer.ts
import { atom } from 'nanostores';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedAt: number | null;
}

const initialState: TimerState = {
  timeRemaining: 0,
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedAt: null,
};

export const $timerStore = atom<TimerState>(initialState);

export function setTimeRemaining(seconds: number): void {
  $timerStore.set({
    ...$timerStore.get(),
    timeRemaining: seconds,
  });
}

export function startTimer(): void {
  $timerStore.set({
    ...$timerStore.get(),
    isRunning: true,
    isPaused: false,
    startTime: Date.now(),
  });
}

export function pauseTimer(): void {
  $timerStore.set({
    ...$timerStore.get(),
    isPaused: true,
    pausedAt: Date.now(),
  });
}

export function resumeTimer(): void {
  $timerStore.set({
    ...$timerStore.get(),
    isPaused: false,
    pausedAt: null,
  });
}

export function stopTimer(): void {
  $timerStore.set(initialState);
}

export function decrementTime(): void {
  const state = $timerStore.get();
  if (state.timeRemaining > 0) {
    $timerStore.set({
      ...state,
      timeRemaining: state.timeRemaining - 1,
    });
  }
}
```

---

#### 📄 File: `./src/stores/toast.ts`

```typescript
// src/stores/toast.ts
import { atom } from 'nanostores';
import type { ToastMessage } from '@/types/common';

interface ToastState {
  messages: ToastMessage[];
}

const initialState: ToastState = {
  messages: [],
};

export const $toastStore = atom<ToastState>(initialState);

export function showToast(
  type: ToastMessage['type'],
  message: string,
  duration: number = 3000
): void {
  const id = Date.now().toString();
  const toast: ToastMessage = { id, type, message, duration };
  
  const state = $toastStore.get();
  $toastStore.set({
    messages: [...state.messages, toast],
  });
  
  setTimeout(() => {
    removeToast(id);
  }, duration);
}

export function removeToast(id: string): void {
  const state = $toastStore.get();
  $toastStore.set({
    messages: state.messages.filter(m => m.id !== id),
  });
}

export function clearToasts(): void {
  $toastStore.set(initialState);
}
```

---

#### 📄 File: `./src/stores/ui.ts`

```typescript
// src/stores/ui.ts
import { persistentAtom } from '@nanostores/persistent';
import type { Theme, FontSize } from '@/types/common';

interface UIState {
  theme: Theme;
  fontSize: FontSize;
  highContrast: boolean;
  sidebarOpen: boolean;
}

const initialState: UIState = {
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  sidebarOpen: true,
};

export const $uiStore = persistentAtom<UIState>('ui-settings', initialState, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function setTheme(theme: Theme): void {
  $uiStore.set({ ...$uiStore.get(), theme });
  
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function setFontSize(fontSize: FontSize): void {
  $uiStore.set({ ...$uiStore.get(), fontSize });
  
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    if (fontSize === 'small') document.documentElement.classList.add('text-sm');
    if (fontSize === 'large') document.documentElement.classList.add('text-lg');
  }
}

export function toggleHighContrast(): void {
  const current = $uiStore.get();
  const newValue = !current.highContrast;
  $uiStore.set({ ...current, highContrast: newValue });
  
  if (typeof document !== 'undefined') {
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }
}

export function toggleSidebar(): void {
  const current = $uiStore.get();
  $uiStore.set({ ...current, sidebarOpen: !current.sidebarOpen });
}

export function setSidebarOpen(isOpen: boolean): void {
  $uiStore.set({ ...$uiStore.get(), sidebarOpen: isOpen });
}
```

---

### 📂 Sub-direktori: src/types

#### 📄 File: `./src/types/activity.ts`

```typescript
// src/types/activity.ts
export type ActivityEventType =
  | 'exam_started'
  | 'exam_paused'
  | 'exam_resumed'
  | 'exam_submitted'
  | 'question_viewed'
  | 'answer_changed'
  | 'tab_switched'
  | 'fullscreen_exited'
  | 'suspicious_activity'
  | 'media_played'
  | 'media_recorded';

export interface ActivityLog {
  id?: number;
  attempt_id: number;
  event_type: ActivityEventType;
  event_data?: any;
  timestamp: Date;
  synced: boolean;
}

export interface SuspiciousActivity {
  type: 'copy_attempt' | 'paste_attempt' | 'screenshot' | 'tab_switch' | 'fullscreen_exit';
  timestamp: Date;
  details?: string;
}
```

---

#### 📄 File: `./src/types/answer.ts`

```typescript
// src/types/answer.ts
export interface BaseAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  answered_at: Date;
  synced: boolean;
}

export interface MultipleChoiceAnswer extends BaseAnswer {
  answer_text?: string;
  selected_option_id: number;
}

export interface MultipleChoiceComplexAnswer extends BaseAnswer {
  answer_text?: string;
  selected_option_ids: number[];
}

export interface TrueFalseAnswer extends BaseAnswer {
  answer_text?: string;
  selected_value: boolean;
}

export interface MatchingAnswer extends BaseAnswer {
  answer_json: Record<number, number>; // left_id => right_id
}

export interface ShortAnswerAnswer extends BaseAnswer {
  answer_text: string;
}

export interface EssayAnswer extends BaseAnswer {
  answer_text?: string;
  answer_media_type?: 'audio' | 'video';
  answer_media_blob?: Blob;
  answer_media_url?: string;
  answer_media_duration?: number;
}

export type Answer =
  | MultipleChoiceAnswer
  | MultipleChoiceComplexAnswer
  | TrueFalseAnswer
  | MatchingAnswer
  | ShortAnswerAnswer
  | EssayAnswer;

export interface ExamAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
  answer_media_type?: 'audio' | 'video';
  answer_media_blob?: Blob;
  answered_at: Date;
  synced: boolean;
}

export interface GradedAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
  answer_media_url?: string;
  points_earned: number;
  points_possible: number;
  is_correct: boolean;
  graded_by?: number;
  graded_at?: string;
  feedback?: string;
}
```

---

#### 📄 File: `./src/types/api.ts`

```typescript
// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: import('./user').User;
  school: import('./user').School;
}

export interface ExamDownloadResponse {
  exam: import('./exam').Exam;
  questions: import('./question').Question[];
  media_files: import('./exam').MediaFile[];
  checksum: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  errors?: ValidationError[];
}
```

---

#### 📄 File: `./src/types/common.ts`

```typescript
// src/types/common.ts
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface DeviceWarning {
  type: 'storage' | 'battery' | 'network' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
```

---

#### 📄 File: `./src/types/exam.ts`

```typescript
// src/types/exam.ts
export interface Exam {
  id: number;
  school_id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  randomize_questions: boolean;
  randomize_options: boolean;
  show_results: boolean;
  allow_review: boolean;
  max_attempts: number;
  window_start_at: string;
  window_end_at: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ExamSession {
  id: number;
  exam_id: number;
  name: string;
  start_time: string;
  end_time: string;
  room_id?: number;
  proctors: number[];
  created_at: string;
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  user_id: number;
  session_id?: number;
  started_at: string;
  submitted_at?: string;
  time_remaining_seconds: number;
  status: 'not_started' | 'in_progress' | 'paused' | 'submitted' | 'graded';
  score?: number;
  total_score: number;
  device_fingerprint: string;
  ip_address?: string;
}

export interface ExamState {
  attempt_id: number;
  current_question_index: number;
  time_remaining_seconds: number;
  started_at: Date;
  paused_at?: Date;
  pause_reason?: string;
  answers: Record<number, any>; // question_id => answer
  flags: number[]; // question_id marked for review
}

export interface DownloadedExam {
  exam_id: number;
  attempt_id: number;
  exam_data: string; // Encrypted JSON
  questions: string; // Encrypted JSON
  media_files: MediaFile[];
  checksum: string;
  downloaded_at: Date;
  expires_at: Date;
}

export interface MediaFile {
  id: string;
  url: string;
  local_path: string;
  checksum: string;
  size: number;
  type: 'image' | 'audio' | 'video';
  downloaded: boolean;
}
```

---

#### 📄 File: `./src/types/media.ts`

```typescript
// src/types/media.ts
export type MediaRecorderType = 'audio' | 'video';
export type MediaRecorderState = 'inactive' | 'recording' | 'paused';

export interface MediaRecorderOptions {
  type: MediaRecorderType;
  maxDuration: number; // in seconds
  maxSize?: number; // in bytes
  mimeType?: string;
}

export interface RecordedMedia {
  blob: Blob;
  duration: number;
  type: MediaRecorderType;
  size: number;
  mimeType: string;
}

export interface MediaPlayerOptions {
  url: string;
  type: 'audio' | 'video';
  repeatable?: boolean;
  maxPlays?: number;
}

export interface MediaPlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playCount: number;
  maxPlays?: number;
}
```

---

#### 📄 File: `./src/types/question.ts`

```typescript
// src/types/question.ts
export type QuestionType =
  | 'multiple_choice'
  | 'multiple_choice_complex'
  | 'true_false'
  | 'matching'
  | 'short_answer'
  | 'essay';

export type MediaType = 'image' | 'audio' | 'video';

export interface BaseQuestion {
  id: number;
  exam_id: number;
  type: QuestionType;
  question_text: string;
  question_html?: string;
  points: number;
  order_number: number;
  media_url?: string;
  media_type?: MediaType;
  media_repeatable?: boolean;
  media_max_plays?: number;
  created_at: string;
  updated_at: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: QuestionOption[];
}

export interface MultipleChoiceComplexQuestion extends BaseQuestion {
  type: 'multiple_choice_complex';
  options: QuestionOption[];
  min_selections?: number;
  max_selections?: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correct_answer: boolean;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
  max_length?: number;
  case_sensitive?: boolean;
  correct_answers?: string[];
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  min_words?: number;
  max_words?: number;
  require_media?: boolean;
  media_type?: 'audio' | 'video';
  max_media_duration?: number; // in seconds
}

export type Question =
  | MultipleChoiceQuestion
  | MultipleChoiceComplexQuestion
  | TrueFalseQuestion
  | MatchingQuestion
  | ShortAnswerQuestion
  | EssayQuestion;

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  option_html?: string;
  is_correct: boolean;
  order_number: number;
  media_url?: string;
}

export interface MatchingPair {
  id: number;
  question_id: number;
  left_text: string;
  right_text: string;
  left_media_url?: string;
  right_media_url?: string;
  order_number: number;
}

export interface QuestionTag {
  id: number;
  name: string;
  color?: string;
}
```

---

#### 📄 File: `./src/types/sync.ts`

```typescript
// src/types/sync.ts
export type SyncItemType = 'answer' | 'media' | 'activity' | 'submission';
export type SyncStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SyncQueueItem {
  id?: number;
  attempt_id: number;
  type: SyncItemType;
  data: any;
  priority: number; // 1-5, 5 = highest
  retry_count: number;
  max_retries: number;
  status: SyncStatus;
  created_at: Date;
  processed_at?: Date;
  error_message?: string;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  percentage: number;
}

export interface DownloadProgress {
  phase: 'preparing' | 'exam_data' | 'media_files' | 'complete';
  current: number;
  total: number;
  currentFile?: string;
  percentage: number;
}

export interface UploadProgress {
  uploaded: number;
  total: number;
  percentage: number;
  currentChunk?: number;
  totalChunks?: number;
}
```

---

#### 📄 File: `./src/types/user.ts`

```typescript
// src/types/user.ts
export type UserRole = 'siswa' | 'guru' | 'pengawas' | 'operator' | 'superadmin';

export interface User {
  id: number;
  school_id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  photo_url?: string;
  device_fingerprint?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student extends User {
  role: 'siswa';
  student_id: string;
  class_id?: number;
  class_name?: string;
}

export interface Teacher extends User {
  role: 'guru';
  teacher_id: string;
  subjects?: string[];
}

export interface Proctor extends User {
  role: 'pengawas';
}

export interface Operator extends User {
  role: 'operator';
}

export interface SuperAdmin extends User {
  role: 'superadmin';
}
```

---

### 📂 Sub-direktori: src/styles

#### 📄 File: `./src/styles/animations.css`

```css

```

---

#### 📄 File: `./src/styles/arabic.css`

```css

```

---

#### 📄 File: `./src/styles/global.css`

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-base-100 text-base-content;
  }
  
  html {
    @apply scroll-smooth;
  }
}

@layer components {
  /* Custom scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    @apply w-2;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-base-200;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-base-300 rounded-full;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-base-content/20;
  }
  
  /* Exam container - no select */
  .exam-no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  /* Loading spinner */
  .spinner {
    @apply inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin;
  }
  
  /* High contrast mode */
  .high-contrast {
    @apply contrast-125;
  }
  
  .high-contrast * {
    @apply border-2;
  }
}

@layer utilities {
  /* Text utilities */
  .text-balance {
    text-wrap: balance;
  }
  
  /* Focus visible */
  .focus-visible-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
  }
  
  /* Truncate multiline */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Print styles */
@media print {
  body {
    @apply bg-white text-black;
  }
  
  .no-print {
    display: none !important;
  }
}
```

---

#### 📄 File: `./src/styles/print.css`

```css

```

---

#### 📄 File: `./src/styles/themes.css`

```css

```

---

### 📂 Sub-direktori: src/middleware

#### 📄 File: `./src/middleware/auth.ts`

```typescript

```

---

#### 📄 File: `./src/middleware/role.ts`

```typescript

```

---

#### 📄 File: `./src/middleware/tenant.ts`

```typescript

```

---

#### 📄 File: `./src/env.d.ts`

```typescript
/// <reference path="../.astro/types.d.ts" />
```

---

## 📁 Direktori: public

**Static assets** - Service worker, manifest, robots.txt

### 📄 File: `./public/manifest.json`

```json
{
  "name": "Exam System - Sistem Ujian Sekolah",
  "short_name": "ExamApp",
  "description": "Offline-First Examination System for Schools and Madrasah",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["education", "productivity"],
  "screenshots": [],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "Go to dashboard",
      "url": "/siswa/dashboard",
      "icons": [
        {
          "src": "/icons/icon-192.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Ujian Saya",
      "short_name": "Ujian",
      "description": "View my exams",
      "url": "/siswa/ujian",
      "icons": [
        {
          "src": "/icons/icon-192.png",
          "sizes": "192x192"
        }
      ]
    }
  ]
}
```

---

### 📄 File: `./public/robots.txt`

```
User-agent: *
Disallow: /api/
Disallow: /siswa/
Disallow: /guru/
Disallow: /pengawas/
Disallow: /operator/
Disallow: /superadmin/
Allow: /

```

---

### 📄 File: `./public/service-worker.js`

```javascript
// public/service-worker.js
const CACHE_NAME = 'exam-app-v1';
const OFFLINE_CACHE = 'exam-offline-v1';

const STATIC_ASSETS = [
  '/',
  '/login',
  '/offline',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API calls - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(OFFLINE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for failed API calls
            return new Response(
              JSON.stringify({ error: 'You are offline' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Cache for future use
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Message event - for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
```

---

## 📁 Direktori: ROOT

**Root configuration files** - Astro config, Tailwind config, package.json

### 📄 File: `./astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  
  output: 'hybrid', // SSR for dynamic pages, SSG for static
  
  adapter: node({
    mode: 'standalone',
  }),

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Code splitting for better performance
            'exam-engine': [
              './src/lib/exam/controller',
              './src/lib/exam/autoSave',
              './src/lib/exam/timer',
            ],
            'media': [
              './src/lib/media/recorder',
              './src/lib/media/player',
              './src/lib/media/upload',
            ],
            'offline': [
              './src/lib/offline/download',
              './src/lib/offline/sync',
              './src/lib/db/indexedDB',
            ],
            'charts': ['chart.js'],
          },
        },
      },
      // Optimize for mobile
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      include: ['dexie', 'axios', 'chart.js'],
    },
  },

  server: {
    port: 3000,
    host: true,
  },

  compressHTML: true,
});

```

---

### 📄 File: `./generate.sh`

````bash
#!/bin/bash
# generate-frontend-blueprint.sh - Generator Blueprint Otomatis untuk Astro Frontend
set -euo pipefail

OUT="frontend-blueprint.md"
ROOT="."

# Pola eksklusi disesuaikan dengan struktur Astro project
EXCLUDE_PATTERNS=( 
  "./.git/*" 
  "./.astro/*" 
  "./.yarn/*" 
  "./.vscode/*" 
  "./README.md" 
  "./.gitignore"
  "./.env"
  "./.env.example"
  "./.env.local"
  "./.env.production"
  "./.gitattributes"
  "./.yarnrc.yml"
  "./.DS_Store"
  "./node_modules/*" 
  "./dist/*"
  "./public/images/*"
  "./public/videos/*"
  "./public/icons/*"
  "./public/fonts/*"
  "./package-lock.json" 
  "./pnpm-lock.yaml"
  "./yarn.lock"
  "./.prettierrc"
  "./.eslintrc.js"
  "./.eslintrc.cjs"
  "./LICENSE"
  "./$OUT" 
  "./generate-backend-blueprint.sh"
  "./generate-frontend-blueprint.sh"
  # Eksklusi file media
  "*.png" "*.jpg" "*.jpeg" "*.webp" "*.ico" "*.gif" "*.svg" "*.avif"
  "*.woff" "*.woff2" "*.ttf" "*.otf" "*.eot"
  "*.mp3" "*.mp4" "*.wav" "*.avi" "*.mov"
  "*.db" "*.sqlite" "*.csv"
  "*.lock" "*.log"
)

# Fungsi untuk menentukan bahasa berdasarkan ekstensi file
lang_for_ext() {
  case "$1" in
    astro)      printf "astro" ;;
    tsx)        printf "tsx" ;;
    ts)         printf "typescript" ;;
    jsx)        printf "jsx" ;;
    js)         printf "javascript" ;;
    mjs)        printf "javascript" ;;
    cjs)        printf "javascript" ;;
    json)       printf "json" ;;
    md)         printf "markdown" ;;
    mdx)        printf "markdown" ;;
    html)       printf "html" ;;
    css)        printf "css" ;;
    scss)       printf "scss" ;;
    yml|yaml)   printf "yaml" ;;
    sh)         printf "bash" ;;
    conf)       printf "nginx" ;;
    Dockerfile) printf "dockerfile" ;;
    *)          printf "" ;;
  esac
}

# Fungsi untuk menghitung jumlah backticks maksimal dalam file
count_max_backticks() {
  local file="$1"
  local max=3
  
  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*(\`+) ]]; then
      local count=${#BASH_REMATCH[1]}
      if [ "$count" -ge "$max" ]; then
        max=$((count + 1))
      fi
    fi
  done < "$file"
  
  echo "$max"
}

# Inisialisasi file output dengan header
cat > "$OUT" << 'HEADER'
# Frontend Blueprint - Astro Exam System

> Auto-generated blueprint untuk frontend Astro
> Sistem Asesmen/Ujian Sekolah & Madrasah
> Offline-First Multi-Tenant Web Application

## 📋 Informasi Project

- **Framework**: Astro (SSR + SSG)
- **Styling**: TailwindCSS + DaisyUI
- **State**: Nanostores (with persistence)
- **Database**: IndexedDB (Dexie.js)
- **PWA**: Service Worker enabled
- **Target**: Android WebView optimized

---

HEADER

# Kumpulkan semua file
files=()
while IFS= read -r -d '' f; do
  skip=false
  for pat in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$f" == $pat ]]; then
      skip=true
      break
    fi
  done
  $skip && continue
  files+=("$f")
done < <(find "$ROOT" -type f -print0)

if [ "${#files[@]}" -eq 0 ]; then
  echo "Tidak ada file ditemukan untuk diproses."
  exit 0
fi

# Kelompokkan file berdasarkan direktori utama
declare -A groups
for f in "${files[@]}"; do
  p="${f#./}"
  if [[ "$p" == */* ]]; then
    top="${p%%/*}"
  else
    top="ROOT"
  fi
  rel="./${p}"
  if [ -z "${groups[$top]:-}" ]; then
    groups[$top]="$rel"
  else
    groups[$top]="${groups[$top]}"$'\n'"$rel"
  fi
done

# Urutan prioritas direktori untuk Astro Frontend
priority_dirs=(
  "src"
  "public"
  "ROOT"
)
processed_dirs=()

# Fungsi untuk memproses file
process_files() {
  local dir="$1"
  local files_list="$2"
  
  # Header direktori
  printf "## 📁 Direktori: %s\n\n" "$dir" >> "$OUT"
  
  # Deskripsi direktori
  case "$dir" in
    "src")
      printf "**Core application code** - Components, pages, layouts, lib, stores\n\n" >> "$OUT"
      ;;
    "public")
      printf "**Static assets** - Service worker, manifest, robots.txt\n\n" >> "$OUT"
      ;;
    "ROOT")
      printf "**Root configuration files** - Astro config, Tailwind config, package.json\n\n" >> "$OUT"
      ;;
  esac
  
  # Sub-direktori khusus untuk src/
  if [ "$dir" == "src" ]; then
    # Kelompokkan file src berdasarkan sub-direktori
    declare -A src_groups
    
    while IFS= read -r file; do
      if [[ "$file" =~ ^\./src/([^/]+)/ ]]; then
        subdir="${BASH_REMATCH[1]}"
        if [ -z "${src_groups[$subdir]:-}" ]; then
          src_groups[$subdir]="$file"
        else
          src_groups[$subdir]="${src_groups[$subdir]}"$'\n'"$file"
        fi
      else
        # File langsung di src/
        if [ -z "${src_groups[_root]:-}" ]; then
          src_groups[_root]="$file"
        else
          src_groups[_root]="${src_groups[_root]}"$'\n'"$file"
        fi
      fi
    done <<< "$files_list"
    
    # Urutan sub-direktori src
    src_priority=("components" "pages" "layouts" "lib" "stores" "types" "styles" "middleware" "_root")
    
    for subdir in "${src_priority[@]}"; do
      if [ -n "${src_groups[$subdir]:-}" ]; then
        if [ "$subdir" != "_root" ]; then
          printf "### 📂 Sub-direktori: src/%s\n\n" "$subdir" >> "$OUT"
        fi
        
        mapfile -t flist < <(printf '%s\n' "${src_groups[$subdir]}" | sort -V)
        
        for file in "${flist[@]}"; do
          case "$file" in
            "./$OUT" | "$OUT" | "./generate-frontend-blueprint.sh" | "generate-frontend-blueprint.sh") continue ;;
          esac
          
          filename="$(basename -- "$file")"
          if [[ "$filename" == *.* ]]; then
            ext="${filename##*.}"
          else
            ext="$filename"
          fi
          
          lang="$(lang_for_ext "$ext")"
          
          printf "#### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
          
          # Hitung jumlah backticks yang dibutuhkan
          backtick_count=$(count_max_backticks "$file")
          backticks=$(printf '`%.0s' $(seq 1 "$backtick_count"))
          
          if [ -n "$lang" ]; then
            printf '%s%s\n' "$backticks" "$lang" >> "$OUT"
          else
            printf '%s\n' "$backticks" >> "$OUT"
          fi
          
          sed 's/\r$//' "$file" >> "$OUT"
          printf '\n%s\n\n' "$backticks" >> "$OUT"
          printf -- "---\n\n" >> "$OUT"
        done
      fi
    done
    
    # Proses sub-direktori lainnya
    for subdir in "${!src_groups[@]}"; do
      skip=false
      for sp in "${src_priority[@]}"; do
        if [ "$subdir" == "$sp" ]; then
          skip=true
          break
        fi
      done
      $skip && continue
      
      printf "### 📂 Sub-direktori: src/%s\n\n" "$subdir" >> "$OUT"
      
      mapfile -t flist < <(printf '%s\n' "${src_groups[$subdir]}" | sort -V)
      
      for file in "${flist[@]}"; do
        case "$file" in
          "./$OUT" | "$OUT" | "./generate-frontend-blueprint.sh" | "generate-frontend-blueprint.sh") continue ;;
        esac
        
        filename="$(basename -- "$file")"
        if [[ "$filename" == *.* ]]; then
          ext="${filename##*.}"
        else
          ext="$filename"
        fi
        
        lang="$(lang_for_ext "$ext")"
        
        printf "#### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
        
        backtick_count=$(count_max_backticks "$file")
        backticks=$(printf '`%.0s' $(seq 1 "$backtick_count"))
        
        if [ -n "$lang" ]; then
          printf '%s%s\n' "$backticks" "$lang" >> "$OUT"
        else
          printf '%s\n' "$backticks" >> "$OUT"
        fi
        
        sed 's/\r$//' "$file" >> "$OUT"
        printf '\n%s\n\n' "$backticks" >> "$OUT"
        printf -- "---\n\n" >> "$OUT"
      done
    done
    
  else
    # Proses direktori non-src seperti biasa
    mapfile -t flist < <(printf '%s\n' "$files_list" | sort -V)
    
    for file in "${flist[@]}"; do
      case "$file" in
        "./$OUT" | "$OUT" | "./generate-frontend-blueprint.sh" | "generate-frontend-blueprint.sh") continue ;;
      esac
      
      filename="$(basename -- "$file")"
      if [[ "$filename" == *.* ]]; then
        ext="${filename##*.}"
      else
        ext="$filename"
      fi
      
      lang="$(lang_for_ext "$ext")"
      
      printf "### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
      
      backtick_count=$(count_max_backticks "$file")
      backticks=$(printf '`%.0s' $(seq 1 "$backtick_count"))
      
      if [ -n "$lang" ]; then
        printf '%s%s\n' "$backticks" "$lang" >> "$OUT"
      else
        printf '%s\n' "$backticks" >> "$OUT"
      fi
      
      sed 's/\r$//' "$file" >> "$OUT"
      printf '\n%s\n\n' "$backticks" >> "$OUT"
      printf -- "---\n\n" >> "$OUT"
    done
  fi
}

# Proses direktori berdasarkan prioritas
for priority in "${priority_dirs[@]}"; do
  if [ -n "${groups[$priority]:-}" ]; then
    process_files "$priority" "${groups[$priority]}"
    processed_dirs+=("$priority")
  fi
done

# Proses direktori lainnya yang tidak ada dalam prioritas
IFS=$'\n'
for top in $(printf '%s\n' "${!groups[@]}" | sort -V); do
  # Skip jika sudah diproses
  skip=false
  for pd in "${processed_dirs[@]}"; do
    if [ "$top" == "$pd" ]; then
      skip=true
      break
    fi
  done
  $skip && continue
  
  process_files "$top" "${groups[$top]}"
done

# Footer
cat >> "$OUT" << 'FOOTER'

---

## 📊 Summary

**Generated**: $(date)
**Total Directories**: ${#groups[@]}
**Total Files**: ${#files[@]}

## 🎯 Key Features

- ✅ Offline-first architecture
- ✅ IndexedDB for local storage
- ✅ Media recording (audio/video)
- ✅ Auto-save every 30 seconds
- ✅ Sync queue with retry
- ✅ Device fingerprinting
- ✅ Activity logging
- ✅ Dark mode support
- ✅ Accessibility features
- ✅ Arabic/Quran support
- ✅ PWA installable
- ✅ Android WebView optimized

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development
npm run dev

# Build for production
npm run build
```

## 📱 Critical Pages

1. **`/siswa/ujian/[id]`** - The exam page (MOST IMPORTANT!)
2. **`/siswa/ujian/download`** - Exam download manager
3. **`/login`** - Authentication with device lock

---
*Auto-generated by generate-frontend-blueprint.sh*
FOOTER

echo "✅ Selesai! File '$OUT' telah dibuat (Mode: Astro Frontend)"
echo "📁 Direktori yang diproses: ${#groups[@]}"
echo "📄 Total file: ${#files[@]}"
echo ""
echo "💡 Tips:"
echo "   - Upload file ini ke Claude untuk analisis kode"
echo "   - Gunakan untuk dokumentasi proyek"
echo "   - Bagikan dengan tim untuk onboarding"
````

---

### 📄 File: `./package.json`

```json
{
  "name": "exam-frontend",
  "version": "1.0.0",
  "description": "Offline-First Exam System Frontend - Multi-Tenant",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check",
    "lint": "eslint src --ext .ts,.astro",
    "lint:fix": "eslint src --ext .ts,.astro --fix",
    "format": "prettier --write \"src/**/*.{ts,astro,css}\"",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "@astrojs/node": "^8.0.0",
    "tailwindcss": "^3.4.0",
    "daisyui": "^4.6.0",
    "nanostores": "^0.10.0",
    "@nanostores/persistent": "^0.10.0",
    "@nanostores/router": "^0.15.0",
    "dexie": "^3.2.4",
    "axios": "^1.6.5",
    "chart.js": "^4.4.1",
    "date-fns": "^3.2.0",
    "crypto-js": "^4.2.0",
    "zod": "^3.22.4",
    "clsx": "^2.1.0",
    "pako": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/crypto-js": "^4.2.2",
    "@types/pako": "^2.0.3",
    "typescript": "^5.3.3",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint": "^8.56.0",
    "eslint-plugin-astro": "^0.31.3",
    "prettier": "^3.2.4",
    "prettier-plugin-astro": "^0.13.0",
    "prettier-plugin-tailwindcss": "^0.5.11"
  }
}
```

---

### 📄 File: `./tailwind.config.cjs`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
        quran: ['Scheherazade', 'Amiri', 'serif'],
      },
      
      fontSize: {
        // Support for font size adjustment
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },

      colors: {
        // Custom color palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },

      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },

      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },

  plugins: [
    require('daisyui'),
  ],

  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#3d4451',
          'base-100': '#ffffff',
          info: '#3abff8',
          success: '#36d399',
          warning: '#fbbd23',
          error: '#f87272',
        },
        dark: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#2a2e37',
          'base-100': '#1d232a',
          info: '#3abff8',
          success: '#36d399',
          warning: '#fbbd23',
          error: '#f87272',
        },
      },
    ],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
    logs: false,
    rtl: false,
  },
};

```

---

### 📄 File: `./todo-frontend.md`

````markdown
# FRONTEND DEVELOPMENT PROMPT - Sistem Asesmen Sekolah/Madrasah

## 🎯 PROJECT OVERVIEW

Bangun frontend aplikasi menggunakan **Astro** untuk sistem asesmen/ujian sekolah dan madrasah dengan arsitektur **offline-first** dan **multi-tenant**. Frontend ini akan dibungkus dalam **Android WebView** untuk distribusi sebagai aplikasi native.

---

## 📋 CORE REQUIREMENTS

### Tech Stack

- **Framework:** Astro (SSR/SSG)
- **Styling:** TailwindCSS + DaisyUI
- **State Management:** Nanostores
- **Offline Storage:** IndexedDB (Dexie.js)
- **PWA:** Service Worker
- **Media Recording:** MediaRecorder API
- **Build Target:** Android WebView (WebView-optimized bundle)

### Key Features

1. **Offline-First Architecture** - Download soal, offline exam, sync jawaban
2. **Multi-Tenant** - Subdomain-based tenant routing
3. **6 Question Types** dengan multimedia support
4. **Media Recording** - Audio/Video recording (max 5 min, max 1GB)
5. **Real-time Auto-save** - Save jawaban setiap 30 detik
6. **Timer & Countdown** - Per-user duration tracking
7. **Activity Logging** - Track semua user activity
8. **Responsive Design** - Mobile-first (Android focus)
9. **Accessibility** - Font size, dark mode, keyboard navigation
10. **Arabic/Islamic Features** - Quran display, tajwid marking

---

## 🗂️ PROJECT STRUCTURE

```
exam-frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Sidebar.astro
│   │   │   ├── Footer.astro
│   │   │   └── MainLayout.astro
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.astro
│   │   │   └── DeviceLockWarning.astro
│   │   │
│   │   ├── exam/
│   │   │   ├── QuestionTypes/
│   │   │   │   ├── MultipleChoice.astro
│   │   │   │   ├── MultipleChoiceComplex.astro
│   │   │   │   ├── TrueFalse.astro
│   │   │   │   ├── Matching.astro
│   │   │   │   ├── ShortAnswer.astro
│   │   │   │   └── Essay.astro
│   │   │   │
│   │   │   ├── MediaPlayer.astro          // Audio/Video player (repeatable)
│   │   │   ├── MediaRecorder.astro        // Recording component
│   │   │   ├── QuestionNavigation.astro   // Question list sidebar
│   │   │   ├── ExamTimer.astro            // Countdown timer
│   │   │   ├── AutoSaveIndicator.astro    // "Saving..." indicator
│   │   │   ├── ProgressBar.astro          // Progress tracker
│   │   │   └── ExamInstructions.astro     // Pre-exam instructions
│   │   │
│   │   ├── sync/
│   │   │   ├── DownloadProgress.astro     // Download progress bar
│   │   │   ├── SyncStatus.astro           // Sync status widget
│   │   │   ├── UploadQueue.astro          // Upload queue viewer
│   │   │   └── ChecksumValidator.astro    // Data integrity check
│   │   │
│   │   ├── monitoring/
│   │   │   ├── LiveMonitor.astro          // Real-time monitoring (pengawas)
│   │   │   ├── StudentProgressCard.astro  // Per-student progress
│   │   │   └── ActivityLogViewer.astro    // Activity log list
│   │   │
│   │   ├── grading/
│   │   │   ├── ManualGradingCard.astro    // Essay/media grading UI
│   │   │   ├── AudioPlayer.astro          // Play student recording
│   │   │   └── GradingRubric.astro        // Scoring rubric
│   │   │
│   │   ├── questions/
│   │   │   ├── QuestionEditor.astro       // Rich question editor
│   │   │   ├── MediaUpload.astro          // Media file uploader
│   │   │   ├── OptionsEditor.astro        // Multiple choice options
│   │   │   ├── MatchingEditor.astro       // Matching pairs editor
│   │   │   └── TagSelector.astro          // Tag multiselect
│   │   │
│   │   ├── analytics/
│   │   │   ├── DashboardStats.astro       // Dashboard widgets
│   │   │   ├── ExamStatistics.astro       // Exam analytics
│   │   │   ├── ItemAnalysisChart.astro    // Item analysis visualization
│   │   │   └── StudentProgress.astro      // Student progress chart
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Input.astro
│   │   │   ├── Select.astro
│   │   │   ├── Modal.astro
│   │   │   ├── Alert.astro
│   │   │   ├── Toast.astro
│   │   │   ├── Card.astro
│   │   │   ├── Table.astro
│   │   │   ├── Tabs.astro
│   │   │   └── Loading.astro
│   │   │
│   │   └── madrasah/
│   │       ├── QuranDisplay.astro         // Quran text with tajwid
│   │       ├── TajwidMarker.astro         // Highlight tajwid rules
│   │       ├── ArabicKeyboard.astro       // Virtual Arabic keyboard
│   │       └── HafalanRecorder.astro      // Hafalan recording UI
│   │
│   ├── pages/
│   │   ├── index.astro                    // Landing page
│   │   ├── login.astro                    // Login page
│   │   │
│   │   ├── siswa/
│   │   │   ├── dashboard.astro
│   │   │   ├── ujian/
│   │   │   │   ├── index.astro            // List ujian
│   │   │   │   ├── download.astro         // Download page
│   │   │   │   ├── [id].astro             // Exam page (THE MOST IMPORTANT!)
│   │   │   │   └── result.astro           // Hasil ujian
│   │   │   └── profile.astro
│   │   │
│   │   ├── guru/
│   │   │   ├── dashboard.astro
│   │   │   ├── soal/
│   │   │   │   ├── index.astro            // List soal
│   │   │   │   ├── create.astro           // Buat soal baru
│   │   │   │   ├── [id]/edit.astro        // Edit soal
│   │   │   │   └── import.astro           // Import Excel
│   │   │   ├── ujian/
│   │   │   │   ├── index.astro            // List ujian
│   │   │   │   ├── create.astro           // Buat ujian
│   │   │   │   ├── [id]/edit.astro        // Edit ujian
│   │   │   │   ├── [id]/preview.astro     // Preview ujian
│   │   │   │   └── [id]/statistics.astro  // Analytics
│   │   │   ├── grading/
│   │   │   │   ├── index.astro            // List pending grading
│   │   │   │   └── [attemptId].astro      // Grade siswa
│   │   │   └── hasil.astro                // Hasil per ujian
│   │   │
│   │   ├── pengawas/
│   │   │   ├── dashboard.astro
│   │   │   └── monitoring/
│   │   │       ├── live.astro             // Live monitoring
│   │   │       └── session/[id].astro     // Monitor session
│   │   │
│   │   ├── operator/
│   │   │   ├── dashboard.astro
│   │   │   ├── sesi/
│   │   │   │   ├── index.astro
│   │   │   │   ├── create.astro
│   │   │   │   └── [id]/edit.astro
│   │   │   ├── ruang/
│   │   │   │   ├── index.astro
│   │   │   │   ├── create.astro
│   │   │   │   └── [id]/edit.astro
│   │   │   ├── peserta/
│   │   │   │   ├── index.astro
│   │   │   │   └── import.astro
│   │   │   └── laporan.astro
│   │   │
│   │   └── superadmin/
│   │       ├── dashboard.astro
│   │       ├── schools/
│   │       │   ├── index.astro
│   │       │   ├── create.astro
│   │       │   └── [id]/edit.astro
│   │       ├── users.astro
│   │       ├── settings.astro
│   │       └── audit-logs.astro
│   │
│   ├── stores/
│   │   ├── auth.ts                        // Nanostores - Auth state
│   │   ├── exam.ts                        // Current exam state
│   │   ├── answers.ts                     // Answers state (persisted)
│   │   ├── sync.ts                        // Sync queue & status
│   │   ├── offline.ts                     // Offline data cache
│   │   ├── timer.ts                       // Exam timer state
│   │   ├── ui.ts                          // UI state (theme, font size, etc)
│   │   └── activity.ts                    // Activity log queue
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                  // Axios instance with interceptors
│   │   │   ├── auth.ts                    // Auth endpoints
│   │   │   ├── exam.ts                    // Exam endpoints
│   │   │   ├── question.ts                // Question endpoints
│   │   │   ├── sync.ts                    // Sync endpoints
│   │   │   └── grading.ts                 // Grading endpoints
│   │   │
│   │   ├── db/
│   │   │   ├── indexedDB.ts               // IndexedDB wrapper (Dexie)
│   │   │   ├── schema.ts                  // DB schema definition
│   │   │   ├── encryption.ts              // AES encryption/decryption
│   │   │   └── migrations.ts              // DB version migrations
│   │   │
│   │   ├── offline/
│   │   │   ├── download.ts                // Background download manager
│   │   │   ├── sync.ts                    // Sync manager
│   │   │   ├── queue.ts                   // Upload queue manager
│   │   │   ├── compress.ts                // Compression utils
│   │   │   └── checksum.ts                // Checksum validation
│   │   │
│   │   ├── exam/
│   │   │   ├── randomizer.ts              // Question & option randomizer
│   │   │   ├── validator.ts               // Answer validator
│   │   │   ├── autoSave.ts                // Auto-save manager
│   │   │   ├── timer.ts                   // Timer controller
│   │   │   └── navigation.ts              // Question navigation logic
│   │   │
│   │   ├── media/
│   │   │   ├── recorder.ts                // MediaRecorder wrapper
│   │   │   ├── player.ts                  // Media player controller
│   │   │   ├── upload.ts                  // Chunked upload
│   │   │   └── compress.ts                // Media compression
│   │   │
│   │   ├── utils/
│   │   │   ├── network.ts                 // Network detection
│   │   │   ├── device.ts                  // Device fingerprint
│   │   │   ├── time.ts                    // Time validation
│   │   │   ├── storage.ts                 // Storage management
│   │   │   ├── validation.ts              // Form validation
│   │   │   └── format.ts                  // Date/number formatting
│   │   │
│   │   └── hooks/
│   │       ├── useExam.ts                 // Exam state hook
│   │       ├── useTimer.ts                // Timer hook
│   │       ├── useAutoSave.ts             // Auto-save hook
│   │       ├── useMediaRecorder.ts        // Recording hook
│   │       ├── useOnlineStatus.ts         // Network status hook
│   │       └── useDeviceWarnings.ts       // Battery/storage warnings
│   │
│   ├── types/
│   │   ├── exam.ts                        // Exam types
│   │   ├── question.ts                    // Question types
│   │   ├── answer.ts                      // Answer types
│   │   ├── user.ts                        // User types
│   │   ├── sync.ts                        // Sync types
│   │   └── api.ts                         // API response types
│   │
│   ├── styles/
│   │   ├── global.css                     // Global styles
│   │   ├── arabic.css                     // Arabic/Quran fonts
│   │   └── print.css                      // Print styles (for export)
│   │
│   └── middleware/
│       ├── auth.ts                        // Auth middleware
│       └── role.ts                        // Role-based access
│
├── public/
│   ├── service-worker.js                  // PWA service worker
│   ├── manifest.json                      // PWA manifest
│   ├── fonts/
│   │   ├── Amiri-Regular.ttf              // Arabic font
│   │   └── Scheherazade-Regular.ttf       // Quranic font
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── astro.config.mjs
├── tailwind.config.cjs
├── tsconfig.json
└── package.json
```

---

## 🗄️ INDEXEDDB SCHEMA (Dexie.js)

```typescript
// src/lib/db/schema.ts
import Dexie, { Table } from "dexie";

// Interfaces
export interface School {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string;
}

export interface User {
  id: number;
  school_id: number;
  username: string;
  email: string;
  role: "siswa" | "guru" | "pengawas" | "operator" | "superadmin";
  full_name: string;
  photo_url?: string;
  device_fingerprint?: string;
}

export interface DownloadedExam {
  exam_id: number;
  attempt_id: number;
  exam_data: string; // Encrypted JSON
  questions: string; // Encrypted JSON
  media_files: MediaFile[];
  checksum: string;
  downloaded_at: Date;
  expires_at: Date;
}

export interface MediaFile {
  id: string;
  url: string;
  local_path: string; // IndexedDB blob reference
  checksum: string;
  size: number;
  type: "image" | "audio" | "video";
  downloaded: boolean;
}

export interface ExamAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
  answer_media_type?: "audio" | "video";
  answer_media_blob?: Blob;
  answered_at: Date;
  synced: boolean;
}

export interface ActivityLog {
  id?: number;
  attempt_id: number;
  event_type: string;
  event_data?: any;
  timestamp: Date;
  synced: boolean;
}

export interface SyncQueueItem {
  id?: number;
  attempt_id: number;
  type: "answer" | "media" | "activity" | "submission";
  data: any;
  priority: number; // 1-5, 5 = highest
  retry_count: number;
  max_retries: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: Date;
  processed_at?: Date;
  error_message?: string;
}

export interface ExamState {
  attempt_id: number;
  current_question_index: number;
  time_remaining_seconds: number;
  started_at: Date;
  paused_at?: Date;
  pause_reason?: string;
  answers: Record<number, any>; // question_id => answer
  flags: number[]; // question_id marked for review
}

// Database class
export class ExamDatabase extends Dexie {
  schools!: Table<School, number>;
  users!: Table<User, number>;
  downloaded_exams!: Table<DownloadedExam, number>;
  media_files!: Table<MediaFile, string>;
  exam_answers!: Table<ExamAnswer, number>;
  activity_logs!: Table<ActivityLog, number>;
  sync_queue!: Table<SyncQueueItem, number>;
  exam_states!: Table<ExamState, number>;

  constructor() {
    super("ExamDB");

    this.version(1).stores({
      schools: "id, subdomain",
      users: "id, school_id, username",
      downloaded_exams: "exam_id, attempt_id, downloaded_at",
      media_files: "id, url, downloaded",
      exam_answers: "++id, attempt_id, question_id, synced",
      activity_logs: "++id, attempt_id, timestamp, synced",
      sync_queue: "++id, attempt_id, type, status, priority",
      exam_states: "attempt_id",
    });
  }
}

export const db = new ExamDatabase();
```

---

## 🔐 AUTHENTICATION & DEVICE LOCKING

### Login Flow

```typescript
// src/lib/api/auth.ts
import { apiClient } from "./client";
import { generateDeviceFingerprint } from "../utils/device";
import { db } from "../db/schema";
import { $authStore } from "@/stores/auth";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  school: School;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  // Generate device fingerprint
  const deviceFingerprint = await generateDeviceFingerprint();

  // Login API call
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    ...credentials,
    device_fingerprint: deviceFingerprint,
  });

  const { access_token, refresh_token, user, school } = response.data;

  // Store tokens in localStorage (encrypted)
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  // Store user & school in IndexedDB
  await db.users.put(user);
  await db.schools.put(school);

  // Update auth store
  $authStore.set({
    isAuthenticated: true,
    user,
    school,
    accessToken: access_token,
  });

  return response.data;
}

export async function logout() {
  // Call logout API
  await apiClient.post("/auth/logout");

  // Clear localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Clear IndexedDB (keep downloaded exams for now)
  // await db.delete();

  // Reset auth store
  $authStore.set({
    isAuthenticated: false,
    user: null,
    school: null,
    accessToken: null,
  });

  // Redirect to login
  window.location.href = "/login";
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await apiClient.post<{ access_token: string }>(
    "/auth/refresh",
    {
      refresh_token: refreshToken,
    },
  );

  const { access_token } = response.data;

  // Update stored token
  localStorage.setItem("access_token", access_token);

  return access_token;
}
```

### Device Fingerprinting

```typescript
// src/lib/utils/device.ts
export async function generateDeviceFingerprint(): Promise<string> {
  const components = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 3. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. Language
  components.push(navigator.language);

  // 5. Platform
  components.push(navigator.platform);

  // 6. Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency?.toString() || "0");

  // 7. Canvas fingerprint
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("ExamApp", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("ExamApp", 4, 17);
    components.push(canvas.toDataURL());
  }

  // Combine and hash
  const fingerprint = components.join("|||");
  const hash = await sha256(fingerprint);

  return hash;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
```

---

## 📥 OFFLINE DOWNLOAD FLOW

### Download Manager

```typescript
// src/lib/offline/download.ts
import { apiClient } from "../api/client";
import { db } from "../db/schema";
import { encrypt } from "../db/encryption";
import { generateChecksum } from "./checksum";

export interface DownloadProgress {
  phase: "preparing" | "exam_data" | "media_files" | "complete";
  current: number;
  total: number;
  currentFile?: string;
  percentage: number;
}

export async function downloadExam(
  examId: number,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  try {
    // Phase 1: Prepare exam
    onProgress?.({
      phase: "preparing",
      current: 0,
      total: 1,
      percentage: 0,
    });

    const prepareResponse = await apiClient.post(
      `/student/exams/${examId}/prepare`,
    );
    const { attempt_id } = prepareResponse.data;

    // Phase 2: Download exam data
    onProgress?.({
      phase: "exam_data",
      current: 0,
      total: 1,
      percentage: 10,
    });

    const downloadResponse = await apiClient.get(
      `/student/exams/${examId}/download`,
    );
    const { exam, questions, media_files, checksum } = downloadResponse.data;

    // Validate checksum
    const calculatedChecksum = generateChecksum({ exam, questions });
    if (calculatedChecksum !== checksum) {
      throw new Error("Checksum validation failed");
    }

    // Encrypt sensitive data
    const encryptedExam = encrypt(JSON.stringify(exam));
    const encryptedQuestions = encrypt(JSON.stringify(questions));

    // Store in IndexedDB
    await db.downloaded_exams.put({
      exam_id: examId,
      attempt_id: attempt_id,
      exam_data: encryptedExam,
      questions: encryptedQuestions,
      media_files: media_files,
      checksum: checksum,
      downloaded_at: new Date(),
      expires_at: new Date(exam.window_end_at),
    });

    // Phase 3: Download media files
    onProgress?.({
      phase: "media_files",
      current: 0,
      total: media_files.length,
      percentage: 20,
    });

    for (let i = 0; i < media_files.length; i++) {
      const mediaFile = media_files[i];

      onProgress?.({
        phase: "media_files",
        current: i + 1,
        total: media_files.length,
        currentFile: mediaFile.url,
        percentage: 20 + ((i + 1) / media_files.length) * 70,
      });

      await downloadMediaFile(mediaFile);
    }

    // Complete
    onProgress?.({
      phase: "complete",
      current: media_files.length,
      total: media_files.length,
      percentage: 100,
    });
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

async function downloadMediaFile(mediaFile: MediaFile): Promise<void> {
  try {
    // Download file as blob
    const response = await fetch(mediaFile.url);
    const blob = await response.blob();

    // Validate checksum
    const arrayBuffer = await blob.arrayBuffer();
    const calculatedChecksum = await sha256ArrayBuffer(arrayBuffer);

    if (calculatedChecksum !== mediaFile.checksum) {
      throw new Error(`Checksum mismatch for ${mediaFile.url}`);
    }

    // Store blob in IndexedDB
    await db.media_files.put({
      id: mediaFile.id,
      url: mediaFile.url,
      local_path: `blob:${mediaFile.id}`, // Reference to blob
      checksum: mediaFile.checksum,
      size: blob.size,
      type: mediaFile.type,
      downloaded: true,
    });

    // Store actual blob (Dexie handles this automatically)
    // If needed, can store in separate blobs table
  } catch (error) {
    console.error(`Failed to download ${mediaFile.url}:`, error);
    throw error;
  }
}
```

---

## 📝 EXAM PAGE (THE MOST CRITICAL!)

```astro
---
// src/pages/siswa/ujian/[id].astro
import MainLayout from '@/components/layout/MainLayout.astro';
import QuestionNavigation from '@/components/exam/QuestionNavigation.astro';
import ExamTimer from '@/components/exam/ExamTimer.astro';
import AutoSaveIndicator from '@/components/exam/AutoSaveIndicator.astro';

// Question type components
import MultipleChoice from '@/components/exam/QuestionTypes/MultipleChoice.astro';
import MultipleChoiceComplex from '@/components/exam/QuestionTypes/MultipleChoiceComplex.astro';
import TrueFalse from '@/components/exam/QuestionTypes/TrueFalse.astro';
import Matching from '@/components/exam/QuestionTypes/Matching.astro';
import ShortAnswer from '@/components/exam/QuestionTypes/ShortAnswer.astro';
import Essay from '@/components/exam/QuestionTypes/Essay.astro';

const { id } = Astro.params;
---

<MainLayout title="Ujian" hideNav={true}>
  <div id="exam-container" class="h-screen flex flex-col overflow-hidden">

    <!-- Header: Timer & Auto-save -->
    <div class="bg-base-200 p-4 flex justify-between items-center">
      <ExamTimer />
      <AutoSaveIndicator />
      <button id="submit-btn" class="btn btn-primary">Submit Ujian</button>
    </div>

    <div class="flex flex-1 overflow-hidden">

      <!-- Sidebar: Question Navigation -->
      <aside class="w-64 bg-base-100 border-r overflow-y-auto">
        <QuestionNavigation />
      </aside>

      <!-- Main: Question Display -->
      <main id="question-area" class="flex-1 overflow-y-auto p-6">
        <!-- Question will be dynamically rendered here -->
        <div id="current-question"></div>
      </main>

    </div>

  </div>

  <!-- Modals -->
  <div id="pause-modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Ujian Dijeda</h3>
      <p class="py-4">Ujian dijeda karena Anda keluar dari tampilan ujian.</p>
      <div class="modal-action">
        <button class="btn btn-primary" id="resume-btn">Lanjutkan Ujian</button>
      </div>
    </div>
  </div>

  <div id="submit-confirm-modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Konfirmasi Submit</h3>
      <p class="py-4">
        Anda telah menjawab <span id="answered-count">0</span> dari <span id="total-count">0</span> soal.
        <br>Yakin ingin submit ujian?
      </p>
      <div class="modal-action">
        <button class="btn" id="cancel-submit">Batal</button>
        <button class="btn btn-primary" id="confirm-submit">Ya, Submit</button>
      </div>
    </div>
  </div>

  <script>
    // Import dependencies
    import { db } from '@/lib/db/schema';
    import { decrypt } from '@/lib/db/encryption';
    import { ExamController } from '@/lib/exam/controller';
    import { AutoSaveManager } from '@/lib/exam/autoSave';
    import { TimerController } from '@/lib/exam/timer';
    import { ActivityLogger } from '@/lib/exam/activityLogger';

    // Initialize
    const examId = parseInt(window.location.pathname.split('/').pop()!);
    let examController: ExamController;
    let autoSaveManager: AutoSaveManager;
    let timerController: TimerController;
    let activityLogger: ActivityLogger;

    async function initExam() {
      try {
        // Load exam from IndexedDB
        const downloadedExam = await db.downloaded_exams.get(examId);
        if (!downloadedExam) {
          alert('Ujian belum didownload. Silakan download terlebih dahulu.');
          window.location.href = '/siswa/ujian';
          return;
        }

        // Decrypt exam data
        const exam = JSON.parse(decrypt(downloadedExam.exam_data));
        const questions = JSON.parse(decrypt(downloadedExam.questions));

        // Initialize controllers
        examController = new ExamController(exam, questions, downloadedExam.attempt_id);
        autoSaveManager = new AutoSaveManager(downloadedExam.attempt_id);
        timerController = new TimerController(exam.duration_minutes * 60);
        activityLogger = new ActivityLogger(downloadedExam.attempt_id);

        // Load saved state (if exam was paused)
        await examController.loadState();

        // Start exam
        await examController.start();
        await activityLogger.log('exam_started', { timestamp: new Date() });

        // Start timer
        timerController.start((timeRemaining) => {
          updateTimerDisplay(timeRemaining);

          // Auto-submit when time runs out
          if (timeRemaining === 0) {
            handleAutoSubmit();
          }

          // Warnings
          if (timeRemaining === 600) { // 10 minutes
            showTimeWarning('10 menit lagi!');
          }
          if (timeRemaining === 300) { // 5 minutes
            showTimeWarning('5 menit lagi!');
          }
          if (timeRemaining === 60) { // 1 minute
            showTimeWarning('1 menit lagi!');
          }
        });

        // Start auto-save (every 30 seconds)
        autoSaveManager.start(30000, async () => {
          const answers = examController.getAnswers();
          await db.exam_answers.bulkPut(answers);
          showAutoSaveIndicator();
        });

        // Render first question
        renderCurrentQuestion();

        // Setup event listeners
        setupEventListeners();

        // Detect activity
        setupActivityDetection();

      } catch (error) {
        console.error('Failed to initialize exam:', error);
        alert('Gagal memuat ujian. Silakan coba lagi.');
      }
    }

    function renderCurrentQuestion() {
      const question = examController.getCurrentQuestion();
      const questionArea = document.getElementById('current-question')!;

      // Clear previous content
      questionArea.innerHTML = '';

      // Render question based on type
      let componentHTML = '';

      switch (question.type) {
        case 'multiple_choice':
          componentHTML = renderMultipleChoice(question);
          break;
        case 'multiple_choice_complex':
          componentHTML = renderMultipleChoiceComplex(question);
          break;
        case 'true_false':
          componentHTML = renderTrueFalse(question);
          break;
        case 'matching':
          componentHTML = renderMatching(question);
          break;
        case 'short_answer':
          componentHTML = renderShortAnswer(question);
          break;
        case 'essay':
          componentHTML = renderEssay(question);
          break;
      }

      questionArea.innerHTML = componentHTML;

      // Load saved answer if exists
      const savedAnswer = examController.getAnswer(question.id);
      if (savedAnswer) {
        populateAnswer(question.type, savedAnswer);
      }

      // Setup answer change listeners
      setupAnswerListeners(question);

      // Log activity
      activityLogger.log('question_viewed', { question_id: question.id });
    }

    function setupAnswerListeners(question: any) {
      // Listen for answer changes
      const answerElements = document.querySelectorAll('[data-answer-input]');

      answerElements.forEach(element => {
        element.addEventListener('change', async () => {
          const answer = collectAnswer(question.type);
          examController.saveAnswer(question.id, answer);
          await activityLogger.log('answer_changed', {
            question_id: question.id,
            timestamp: new Date()
          });
        });
      });
    }

    function setupEventListeners() {
      // Navigation buttons
      document.getElementById('prev-btn')?.addEventListener('click', () => {
        examController.previousQuestion();
        renderCurrentQuestion();
      });

      document.getElementById('next-btn')?.addEventListener('click', () => {
        examController.nextQuestion();
        renderCurrentQuestion();
      });

      // Submit button
      document.getElementById('submit-btn')?.addEventListener('click', () => {
        showSubmitConfirmation();
      });

      document.getElementById('confirm-submit')?.addEventListener('click', async () => {
        await handleSubmit();
      });

      // Question navigation (sidebar)
      document.querySelectorAll('[data-question-index]').forEach(el => {
        el.addEventListener('click', (e) => {
          const index = parseInt((e.target as HTMLElement).dataset.questionIndex!);
          examController.goToQuestion(index);
          renderCurrentQuestion();
        });
      });
    }

    function setupActivityDetection() {
      // Detect tab/window switch
      document.addEventListener('visibilitychange', async () => {
        if (document.hidden) {
          await activityLogger.log('tab_switched', { timestamp: new Date() });

          // Pause exam
          timerController.pause();
          autoSaveManager.pause();
          showPauseModal('Anda keluar dari tampilan ujian');
        }
      });

      // Detect fullscreen exit
      document.addEventListener('fullscreenchange', async () => {
        if (!document.fullscreenElement) {
          await activityLogger.log('fullscreen_exited', { timestamp: new Date() });

          // Pause exam
          timerController.pause();
          showPauseModal('Anda keluar dari fullscreen');
        }
      });

      // Prevent copy-paste
      document.addEventListener('copy', (e) => {
        e.preventDefault();
        activityLogger.log('suspicious_activity', {
          type: 'copy_attempt',
          timestamp: new Date()
        });
      });

      document.addEventListener('paste', (e) => {
        e.preventDefault();
        activityLogger.log('suspicious_activity', {
          type: 'paste_attempt',
          timestamp: new Date()
        });
      });

      // Detect right-click
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }

    function showPauseModal(reason: string) {
      const modal = document.getElementById('pause-modal') as HTMLDialogElement;
      modal.querySelector('p')!.textContent = `Ujian dijeda. Alasan: ${reason}`;
      modal.showModal();

      // Resume button
      document.getElementById('resume-btn')?.addEventListener('click', async () => {
        await activityLogger.log('resume_triggered', { timestamp: new Date() });
        timerController.resume();
        autoSaveManager.resume();
        modal.close();
      }, { once: true });
    }

    async function handleSubmit() {
      try {
        // Stop timer & auto-save
        timerController.stop();
        autoSaveManager.stop();

        // Get all answers
        const answers = examController.getAnswers();

        // Save to IndexedDB
        await db.exam_answers.bulkPut(answers);

        // Mark as submitted (will be synced when online)
        const attemptId = examController.getAttemptId();
        await db.sync_queue.add({
          attempt_id: attemptId,
          type: 'submission',
          data: {
            submitted_at: new Date(),
            answers: answers,
            activity_logs: await activityLogger.getLogs(),
          },
          priority: 5, // Highest priority
          retry_count: 0,
          max_retries: 10,
          status: 'pending',
          created_at: new Date(),
        });

        // Log submission
        await activityLogger.log('exam_submitted', {
          timestamp: new Date(),
          answer_count: answers.length
        });

        // Show success message
        alert('Ujian berhasil disubmit! Data akan disinkronkan saat online.');

        // Redirect to result page
        window.location.href = `/siswa/ujian/result?attemptId=${attemptId}`;

      } catch (error) {
        console.error('Submit failed:', error);
        alert('Gagal submit ujian. Data telah disimpan dan akan dicoba lagi.');
      }
    }

    async function handleAutoSubmit() {
      alert('Waktu habis! Ujian akan disubmit otomatis.');
      await handleSubmit();
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initExam);
    } else {
      initExam();
    }
  </script>

</MainLayout>
```

---

## 📤 SYNC & UPLOAD FLOW

```typescript
// src/lib/offline/sync.ts
import { db, SyncQueueItem } from "../db/schema";
import { apiClient } from "../api/client";
import { uploadMediaChunked } from "../media/upload";

export class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;

  constructor() {
    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.stopSync();
    });
  }

  start() {
    // Check every 30 seconds if there's anything to sync
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, 30000);

    // Also try immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async processSyncQueue() {
    if (this.isSyncing) return;

    this.isSyncing = true;

    try {
      // Get pending items, sorted by priority (high to low)
      const pendingItems = await db.sync_queue
        .where("status")
        .equals("pending")
        .or("status")
        .equals("failed")
        .filter((item) => item.retry_count < item.max_retries)
        .sortBy("priority");

      for (const item of pendingItems.reverse()) {
        // High priority first
        await this.processItem(item);
      }
    } catch (error) {
      console.error("Sync queue processing failed:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processItem(item: SyncQueueItem) {
    try {
      // Update status to processing
      await db.sync_queue.update(item.id!, { status: "processing" });

      switch (item.type) {
        case "answer":
          await this.syncAnswer(item);
          break;
        case "media":
          await this.syncMedia(item);
          break;
        case "activity":
          await this.syncActivity(item);
          break;
        case "submission":
          await this.syncSubmission(item);
          break;
      }

      // Mark as completed
      await db.sync_queue.update(item.id!, {
        status: "completed",
        processed_at: new Date(),
      });

      // Emit sync progress event
      window.dispatchEvent(
        new CustomEvent("sync:progress", {
          detail: { item, status: "completed" },
        }),
      );
    } catch (error: any) {
      console.error(`Failed to sync item ${item.id}:`, error);

      // Increment retry count
      const newRetryCount = item.retry_count + 1;

      if (newRetryCount >= item.max_retries) {
        // Max retries reached, mark as failed
        await db.sync_queue.update(item.id!, {
          status: "failed",
          retry_count: newRetryCount,
          error_message: error.message,
        });

        // Emit error event
        window.dispatchEvent(
          new CustomEvent("sync:error", {
            detail: { item, error: error.message },
          }),
        );
      } else {
        // Reset to pending for retry
        await db.sync_queue.update(item.id!, {
          status: "pending",
          retry_count: newRetryCount,
          error_message: error.message,
        });
      }
    }
  }

  private async syncAnswer(item: SyncQueueItem) {
    const { attempt_id, answers } = item.data;

    await apiClient.post(`/student/attempts/${attempt_id}/answers`, {
      answers: answers,
    });
  }

  private async syncMedia(item: SyncQueueItem) {
    const { attempt_id, answer_id, media_blob, checksum } = item.data;

    // Chunked upload
    await uploadMediaChunked(
      attempt_id,
      answer_id,
      media_blob,
      checksum,
      (progress) => {
        window.dispatchEvent(
          new CustomEvent("sync:media-progress", {
            detail: { item, progress },
          }),
        );
      },
    );
  }

  private async syncActivity(item: SyncQueueItem) {
    const { attempt_id, events } = item.data;

    await apiClient.post(`/student/attempts/${attempt_id}/activity`, {
      events: events,
    });
  }

  private async syncSubmission(item: SyncQueueItem) {
    const { attempt_id, submitted_at, answers, activity_logs } = item.data;

    await apiClient.post(`/student/attempts/${attempt_id}/submit`, {
      submitted_at: submitted_at,
      answers: answers,
      activity_logs: activity_logs,
    });
  }

  async getSyncStatus(attemptId: number) {
    const items = await db.sync_queue
      .where("attempt_id")
      .equals(attemptId)
      .toArray();

    const total = items.length;
    const completed = items.filter((i) => i.status === "completed").length;
    const failed = items.filter((i) => i.status === "failed").length;
    const pending = items.filter(
      (i) => i.status === "pending" || i.status === "processing",
    ).length;

    return {
      total,
      completed,
      failed,
      pending,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}

// Initialize global sync manager
export const syncManager = new SyncManager();
```

---

## 🎤 MEDIA RECORDER COMPONENT

```astro
---
// src/components/exam/MediaRecorder.astro
interface Props {
  type: 'audio' | 'video';
  maxDuration: number; // seconds
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

const { type, maxDuration = 300 } = Astro.props; // Default 5 minutes
---

<div class="media-recorder card bg-base-200 p-4">
  <div class="flex items-center justify-between mb-4">
    <h3 class="font-bold">{type === 'audio' ? 'Rekam Audio' : 'Rekam Video'}</h3>
    <div class="text-lg font-mono" id="rec-timer">00:00</div>
  </div>

  {type === 'video' && (
    <video id="preview" class="w-full h-64 bg-black rounded mb-4" autoplay muted></video>
  )}

  {type === 'audio' && (
    <div class="h-32 flex items-center justify-center bg-base-300 rounded mb-4">
      <div id="audio-visualizer" class="flex gap-1">
        <!-- Audio bars will be rendered here -->
      </div>
    </div>
  )}

  <div class="flex gap-2 justify-center">
    <button id="start-rec" class="btn btn-error">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="6"/>
      </svg>
      Mulai Rekam
    </button>

    <button id="stop-rec" class="btn btn-primary" disabled>
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <rect x="6" y="6" width="8" height="8"/>
      </svg>
      Stop
    </button>

    <button id="retry-rec" class="btn btn-ghost" disabled>Ulangi</button>
  </div>

  <div id="playback-area" class="mt-4 hidden">
    <h4 class="font-semibold mb-2">Preview Rekaman</h4>
    {type === 'audio' ? (
      <audio id="playback-audio" class="w-full" controls></audio>
    ) : (
      <video id="playback-video" class="w-full rounded" controls></video>
    )}

    <div class="mt-2 flex gap-2 justify-end">
      <button id="confirm-rec" class="btn btn-success">Gunakan Rekaman Ini</button>
    </div>
  </div>
</div>

<script define:vars={{ type, maxDuration }}>
  let mediaRecorder;
  let recordedChunks = [];
  let stream;
  let startTime;
  let timerInterval;
  let recordingBlob;

  const startBtn = document.getElementById('start-rec');
  const stopBtn = document.getElementById('stop-rec');
  const retryBtn = document.getElementById('retry-rec');
  const confirmBtn = document.getElementById('confirm-rec');
  const timerEl = document.getElementById('rec-timer');
  const playbackArea = document.getElementById('playback-area');

  startBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
  retryBtn.addEventListener('click', retryRecording);
  confirmBtn.addEventListener('click', confirmRecording);

  async function startRecording() {
    try {
      // Request permissions
      const constraints = type === 'audio'
        ? { audio: true }
        : { audio: true, video: { facingMode: 'user' } };

      stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Setup preview
      if (type === 'video') {
        document.getElementById('preview').srcObject = stream;
      }

      // Setup MediaRecorder
      const options = type === 'audio'
        ? { mimeType: 'audio/webm;codecs=opus' }
        : { mimeType: 'video/webm;codecs=vp9' };

      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;

      // Start recording
      recordedChunks = [];
      mediaRecorder.start();
      startTime = Date.now();

      // Update UI
      startBtn.disabled = true;
      stopBtn.disabled = false;
      retryBtn.disabled = true;
      playbackArea.classList.add('hidden');

      // Start timer
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);

      // Auto-stop at max duration
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          stopRecording();
          alert(`Durasi maksimal ${maxDuration / 60} menit tercapai.`);
        }
      }, maxDuration * 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Gagal memulai rekaman. Pastikan izin mikrofon/kamera sudah diberikan.');
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Stop timer
      clearInterval(timerInterval);

      // Update UI
      startBtn.disabled = false;
      stopBtn.disabled = true;
      retryBtn.disabled = false;
    }
  }

  function handleRecordingStop() {
    // Create blob
    const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
    recordingBlob = new Blob(recordedChunks, { type: mimeType });

    // Calculate duration
    const duration = (Date.now() - startTime) / 1000;

    // Show playback
    const playbackEl = type === 'audio'
      ? document.getElementById('playback-audio')
      : document.getElementById('playback-video');

    playbackEl.src = URL.createObjectURL(recordingBlob);
    playbackArea.classList.remove('hidden');
  }

  function retryRecording() {
    // Reset
    recordedChunks = [];
    recordingBlob = null;
    timerEl.textContent = '00:00';
    playbackArea.classList.add('hidden');

    // Start new recording
    startRecording();
  }

  function confirmRecording() {
    if (!recordingBlob) return;

    const duration = (Date.now() - startTime) / 1000;

    // Call parent callback
    if (window.onRecordingComplete) {
      window.onRecordingComplete(recordingBlob, duration);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('recording-complete', {
      detail: { blob: recordingBlob, duration, type }
    }));
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Warning colors
    const remaining = maxDuration - elapsed;
    if (remaining <= 60) {
      timerEl.classList.add('text-error');
    } else if (remaining <= 120) {
      timerEl.classList.add('text-warning');
    }
  }
</script>

<style>
  #audio-visualizer {
    width: 200px;
    height: 80px;
  }

  #audio-visualizer > div {
    width: 4px;
    background: currentColor;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { height: 20%; }
    50% { height: 100%; }
  }
</style>
```

---

## 🌙 DARK MODE & ACCESSIBILITY

```typescript
// src/stores/ui.ts
import { atom } from "nanostores";

interface UIState {
  theme: "light" | "dark";
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
}

export const $uiStore = atom<UIState>({
  theme: "light",
  fontSize: "medium",
  highContrast: false,
});

// Load from localStorage
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("ui-settings");
  if (saved) {
    $uiStore.set(JSON.parse(saved));
  }
}

// Save to localStorage on change
$uiStore.subscribe((state) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("ui-settings", JSON.stringify(state));

    // Apply theme
    document.documentElement.setAttribute("data-theme", state.theme);

    // Apply font size
    document.documentElement.classList.remove(
      "text-sm",
      "text-base",
      "text-lg",
    );
    if (state.fontSize === "small")
      document.documentElement.classList.add("text-sm");
    if (state.fontSize === "large")
      document.documentElement.classList.add("text-lg");

    // Apply high contrast
    if (state.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }
});

export function setTheme(theme: "light" | "dark") {
  $uiStore.set({ ...$uiStore.get(), theme });
}

export function setFontSize(fontSize: "small" | "medium" | "large") {
  $uiStore.set({ ...$uiStore.get(), fontSize });
}

export function toggleHighContrast() {
  const current = $uiStore.get();
  $uiStore.set({ ...current, highContrast: !current.highContrast });
}
```

---

## 🕌 MADRASAH FEATURES

### Quran Display

```astro
---
// src/components/madrasah/QuranDisplay.astro
interface Props {
  surah: string;
  ayahStart: number;
  ayahEnd: number;
  showTajwid?: boolean;
  showTransliteration?: boolean;
}

const { surah, ayahStart, ayahEnd, showTajwid = true, showTransliteration = false } = Astro.props;
---

<div class="quran-display" dir="rtl">
  <div class="surah-header text-center mb-4">
    <h2 class="text-2xl font-arabic">{surah}</h2>
    <p class="text-sm text-base-content/70">Ayat {ayahStart} - {ayahEnd}</p>
  </div>

  <div id="ayat-container" class="space-y-4">
    <!-- Ayat akan dimuat via JS -->
  </div>

  <div class="audio-player mt-4">
    <audio id="murattal-player" class="w-full" controls>
      <source src={`/api/quran/audio/${surah}/${ayahStart}`} type="audio/mpeg">
    </audio>
  </div>
</div>

<script define:vars={{ surah, ayahStart, ayahEnd, showTajwid }}>
  async function loadAyat() {
    try {
      // Fetch ayat from API or local storage
      const response = await fetch(`/api/quran/${surah}/${ayahStart}/${ayahEnd}`);
      const ayatData = await response.json();

      const container = document.getElementById('ayat-container');

      ayatData.forEach(ayat => {
        const ayatDiv = document.createElement('div');
        ayatDiv.className = 'ayat-item p-4 bg-base-200 rounded';

        // Arabic text with tajwid
        let arabicText = ayat.text;
        if (showTajwid) {
          arabicText = applyTajwidColors(arabicText);
        }

        ayatDiv.innerHTML = `
          <div class="flex items-start gap-3">
            <span class="badge badge-primary">${ayat.number}</span>
            <p class="text-3xl font-arabic leading-loose flex-1">${arabicText}</p>
          </div>
          ${showTransliteration ? `
            <p class="text-sm text-base-content/70 mt-2 italic">${ayat.transliteration}</p>
          ` : ''}
          <p class="text-sm mt-2">${ayat.translation}</p>
        `;

        container.appendChild(ayatDiv);
      });

    } catch (error) {
      console.error('Failed to load ayat:', error);
    }
  }

  function applyTajwidColors(text) {
    // Apply tajwid color coding
    // Ikhfa (yellow), Idgham (green), Qalqalah (red), etc.
    // This requires tajwid rules database

    // Simplified example:
    return text
      .replace(/([نم])\s*([بم])/g, '<span class="tajwid-ikhfa">$1 $2</span>')
      .replace(/([نملر])\s*([نملر])/g, '<span class="tajwid-idgham">$1 $2</span>');
  }

  loadAyat();
</script>

<style>
  .font-arabic {
    font-family: 'Amiri', 'Traditional Arabic', serif;
  }

  .tajwid-ikhfa {
    background: rgba(255, 235, 59, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
  }

  .tajwid-idgham {
    background: rgba(76, 175, 80, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
  }

  .tajwid-qalqalah {
    background: rgba(244, 67, 54, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
  }
</style>
```

---

## 📊 ANALYTICS & CHARTS

```typescript
// src/lib/analytics/charts.ts
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function createScoreDistributionChart(
  canvasId: string,
  scores: number[],
) {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

  // Create distribution bins
  const bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const distribution = bins.map((bin, i) => {
    if (i === bins.length - 1) return 0;
    return scores.filter((s) => s >= bin && s < bins[i + 1]).length;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: bins.slice(0, -1).map((b, i) => `${b}-${bins[i + 1]}`),
      datasets: [
        {
          label: "Jumlah Siswa",
          data: distribution,
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Distribusi Nilai",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

export function createItemAnalysisChart(
  canvasId: string,
  questions: { difficulty: number; discrimination: number; label: string }[],
) {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

  new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Soal",
          data: questions.map((q) => ({
            x: q.difficulty,
            y: q.discrimination,
          })),
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          pointRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Item Analysis (Difficulty vs Discrimination)",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const q = questions[context.dataIndex];
              return `${q.label}: D=${q.difficulty.toFixed(2)}, Disc=${q.discrimination.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Difficulty Index (P)",
          },
          min: 0,
          max: 1,
        },
        y: {
          title: {
            display: true,
            text: "Discrimination Index (D)",
          },
          min: -1,
          max: 1,
        },
      },
    },
  });
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Code Splitting

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],

  output: "hybrid", // SSR for dynamic pages, SSG for static

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "exam-engine": [
              "./src/lib/exam/controller",
              "./src/lib/exam/autoSave",
              "./src/lib/exam/timer",
            ],
            media: [
              "./src/lib/media/recorder",
              "./src/lib/media/player",
              "./src/lib/media/upload",
            ],
            offline: [
              "./src/lib/offline/download",
              "./src/lib/offline/sync",
              "./src/lib/db/indexedDB",
            ],
          },
        },
      },
    },
  },
});
```

### Image Optimization

```astro
---
import { Image } from 'astro:assets';
import questionImage from '@/assets/question.jpg';
---

<Image
  src={questionImage}
  alt="Question image"
  width={800}
  height={600}
  format="webp"
  loading="lazy"
/>
```

### Service Worker (PWA)

```javascript
// public/service-worker.js
const CACHE_NAME = "exam-app-v1";
const OFFLINE_CACHE = "exam-offline-v1";

const STATIC_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
  "/fonts/Amiri-Regular.ttf",
  // Add more static assets
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - network first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(OFFLINE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        }),
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Cache for future use
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    }),
  );
});
```

---

## 🚨 ERROR HANDLING & WARNINGS

```typescript
// src/lib/utils/warnings.ts
export async function checkDeviceRequirements() {
  const warnings = [];

  // 1. Check storage
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const availableGB = (estimate.quota - estimate.usage) / 1024 ** 3;

    if (availableGB < 2) {
      warnings.push({
        type: "storage",
        severity: "error",
        message: `Storage tersisa hanya ${availableGB.toFixed(2)} GB. Minimal 2 GB diperlukan. Silakan kosongkan storage.`,
      });
    }
  }

  // 2. Check battery
  if ("getBattery" in navigator) {
    const battery = await (navigator as any).getBattery();

    if (battery.level < 0.2 && !battery.charging) {
      warnings.push({
        type: "battery",
        severity: "warning",
        message: `Baterai tersisa ${(battery.level * 100).toFixed(0)}%. Charge device Anda.`,
      });
    }
  }

  // 3. Check internet (for download phase)
  if (!navigator.onLine) {
    warnings.push({
      type: "network",
      severity: "error",
      message:
        "Tidak ada koneksi internet. Silakan hubungkan ke WiFi untuk download soal.",
    });
  }

  // 4. Check browser compatibility
  if (!("indexedDB" in window)) {
    warnings.push({
      type: "compatibility",
      severity: "error",
      message:
        "Browser Anda tidak mendukung fitur offline. Gunakan browser terbaru.",
    });
  }

  if (!("mediaDevices" in navigator)) {
    warnings.push({
      type: "compatibility",
      severity: "error",
      message:
        "Browser Anda tidak mendukung rekaman media. Gunakan browser terbaru.",
    });
  }

  return warnings;
}

export function showWarningModal(warnings: any[]) {
  const modal = document.createElement("div");
  modal.className = "modal modal-open";

  const hasErrors = warnings.some((w) => w.severity === "error");

  modal.innerHTML = `
    <div class="modal-box">
      <h3 class="font-bold text-lg">${hasErrors ? "Perhatian!" : "Peringatan"}</h3>
      <div class="py-4 space-y-2">
        ${warnings
          .map(
            (w) => `
          <div class="alert ${w.severity === "error" ? "alert-error" : "alert-warning"}">
            <span>${w.message}</span>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="modal-action">
        ${
          hasErrors
            ? `
          <button class="btn" onclick="window.location.href='/siswa/dashboard'">Kembali</button>
        `
            : `
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Lanjutkan</button>
        `
        }
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}
```

---

## 🎨 TAILWIND & DAISYUI CONFIG

```javascript
// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["Amiri", "Traditional Arabic", "serif"],
        quran: ["Scheherazade", "serif"],
      },
      fontSize: {
        // Support for zoom in/out
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#10b981",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#10b981",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
};
```

---

## 📱 ANDROID WEBVIEW INTEGRATION

### MainActivity.java (Example)

```java
package com.example.examapp;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.webkit.JavascriptInterface;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);

        // Enable JavaScript
        webView.getSettings().setJavaScriptEnabled(true);

        // Enable DOM storage (for IndexedDB)
        webView.getSettings().setDomStorageEnabled(true);

        // Enable database
        webView.getSettings().setDatabaseEnabled(true);

        // Enable geolocation
        webView.getSettings().setGeolocationEnabled(true);

        // Enable media playback
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);

        // Set user agent
        webView.getSettings().setUserAgentString(
            webView.getSettings().getUserAgentString() + " ExamApp/1.0"
        );

        // Set WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return false; // Let WebView handle the URL
            }
        });

        // Set WebChromeClient for permissions
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // Auto-grant mic/camera permissions for exam
                request.grant(request.getResources());
            }
        });

        // Add JavaScript interface for native features
        webView.addJavascriptInterface(new NativeBridge(), "Android");

        // Load app
        webView.loadUrl("https://exam.app");
    }

    public class NativeBridge {
        @JavascriptInterface
        public String getDeviceInfo() {
            JSONObject info = new JSONObject();
            info.put("model", Build.MODEL);
            info.put("os", "Android " + Build.VERSION.RELEASE);
            info.put("manufacturer", Build.MANUFACTURER);
            return info.toString();
        }

        @JavascriptInterface
        public boolean checkStorageSpace() {
            StatFs stat = new StatFs(Environment.getDataDirectory().getPath());
            long availableBytes = stat.getAvailableBlocksLong() * stat.getBlockSizeLong();
            long availableGB = availableBytes / (1024 * 1024 * 1024);
            return availableGB >= 2;
        }

        @JavascriptInterface
        public int getBatteryLevel() {
            IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent battery = registerReceiver(null, filter);
            int level = battery.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
            int scale = battery.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
            return (int) ((level / (float) scale) * 100);
        }
    }
}
```

---

## ✅ DEPLOYMENT CHECKLIST

### Build Configuration

```bash
# package.json
{
  "name": "exam-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "daisyui": "^4.0.0",
    "nanostores": "^0.10.0",
    "@nanostores/react": "^0.7.0",
    "dexie": "^3.2.0",
    "axios": "^1.6.0",
    "chart.js": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

### Environment Variables

```bash
# .env.production
PUBLIC_API_URL=https://api.exam.app
PUBLIC_SCHOOL_SUBDOMAIN=your-school
PUBLIC_APP_VERSION=1.0.0
```

### Build & Deploy

```bash
# Build for production
npm run build

# Output will be in /dist

# Test production build
npm run preview

# Deploy to server
rsync -avz --delete dist/ user@server:/var/www/exam-frontend/
```

---

## 🎯 SUCCESS CRITERIA

Frontend is production-ready when:

1. ✅ All pages implemented and responsive
2. ✅ Offline download & sync working flawlessly
3. ✅ Exam page fully functional (all question types)
4. ✅ Media recorder working (audio & video)
5. ✅ Auto-save working reliably
6. ✅ Timer accurate and persistent
7. ✅ Activity logging complete
8. ✅ Dark mode & accessibility features working
9. ✅ Load time < 3s on 3G
10. ✅ Bundle size < 1MB (initial load)
11. ✅ PWA installable
12. ✅ Works offline 100%
13. ✅ Compatible with Android WebView
14. ✅ No console errors
15. ✅ Security best practices followed

---

## 📚 ADDITIONAL NOTES

### Best Practices

1. **Always encrypt** exam data in IndexedDB
2. **Always validate** checksums for downloaded content
3. **Always log** user activities during exam
4. **Always save** exam state (resume-able)
5. **Always show** sync status to user
6. **Never** send sensitive data unencrypted
7. **Never** store tokens in localStorage unencrypted
8. **Never** trust client time (validate with server)

### Testing Checklist

- [ ] Test on various Android devices (5 min, 7 inch, 10 inch)
- [ ] Test offline mode (airplane mode)
- [ ] Test with slow network (3G)
- [ ] Test with limited storage (<2GB)
- [ ] Test battery drain during exam
- [ ] Test app kill & resume
- [ ] Test media recording quality
- [ ] Test chunked upload for large files
- [ ] Test sync retry mechanism
- [ ] Test time validation
- [ ] Test device lock (single device)
- [ ] Test all question types
- [ ] Test dark mode
- [ ] Test font size adjustment
- [ ] Test Arabic/Quran display

---

## 🚀 PRIORITY IMPLEMENTATION ORDER

### Phase 1: MVP (Essential)

1. Authentication & device lock
2. Exam download system
3. Basic exam page (at least multiple choice)
4. Timer & auto-save
5. Offline storage (IndexedDB)
6. Basic sync mechanism
7. Answer submission

### Phase 2: Core Features

8. All 6 question types
9. Media player (for question media)
10. Media recorder (audio/video answers)
11. Activity logging
12. Question navigation
13. Chunked upload
14. Retry mechanism

### Phase 3: Advanced

15. Analytics dashboard
16. Grading interface
17. Monitoring (for pengawas)
18. Import/export features
19. Madrasah features (Quran, tajwid)
20. Dark mode & accessibility

### Phase 4: Polish

21. Performance optimization
22. PWA features
23. Error handling improvements
24. UI/UX refinements
25. Documentation

---

## 🎉 FINAL NOTES

This is a **complex, mission-critical frontend** for an exam system. The most important aspects are:

1. **Reliability** - Must work 100% offline
2. **Data integrity** - Never lose student answers
3. **Security** - Protect exam content
4. **Performance** - Smooth on low-end devices
5. **User experience** - Stress-free for students

Take your time to implement features correctly. Test thoroughly before deployment. The exam experience will make or break this system!

**GOOD LUCK BUILDING! 🚀**

````

---

### 📄 File: `./tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@lib/*": ["src/lib/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/lib/utils/*"],
      "@api/*": ["src/lib/api/*"],
      "@db/*": ["src/lib/db/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "types": ["astro/client"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---


---

## 📊 Summary

**Generated**: $(date)
**Total Directories**: ${#groups[@]}
**Total Files**: ${#files[@]}

## 🎯 Key Features

- ✅ Offline-first architecture
- ✅ IndexedDB for local storage
- ✅ Media recording (audio/video)
- ✅ Auto-save every 30 seconds
- ✅ Sync queue with retry
- ✅ Device fingerprinting
- ✅ Activity logging
- ✅ Dark mode support
- ✅ Accessibility features
- ✅ Arabic/Quran support
- ✅ PWA installable
- ✅ Android WebView optimized

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development
npm run dev

# Build for production
npm run build
```

## 📱 Critical Pages

1. **`/siswa/ujian/[id]`** - The exam page (MOST IMPORTANT!)
2. **`/siswa/ujian/download`** - Exam download manager
3. **`/login`** - Authentication with device lock

---
*Auto-generated by generate-frontend-blueprint.sh*
