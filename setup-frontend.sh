#!/bin/bash

# Setup exam-frontend — Next.js 15 App Router (PWA)
# Sistem Ujian Offline-First Multi-Tenant
# Stack: Next.js 15 + TypeScript + Tailwind + DaisyUI
#        Zustand + Dexie + PowerSync + ky + Zod + Web Crypto API

set -euo pipefail

PROJECT_NAME="exam-frontend"

echo "=========================================="
echo "Creating $PROJECT_NAME Next.js project"
echo "Offline-First Exam System Frontend"
echo "=========================================="

mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# ============================================
# APP ROUTER — ROUTE GROUPS
# ============================================

echo "Creating App Router structure..."

mkdir -p src/app
touch src/app/{layout.tsx,page.tsx,not-found.tsx,loading.tsx,global.css}

# (auth)
mkdir -p "src/app/(auth)/login"
touch "src/app/(auth)/layout.tsx"
touch "src/app/(auth)/login/page.tsx"

# (siswa)
mkdir -p "src/app/(siswa)/dashboard"
mkdir -p "src/app/(siswa)/profile"
mkdir -p "src/app/(siswa)/ujian/download"
mkdir -p "src/app/(siswa)/ujian/[sessionId]/review"
mkdir -p "src/app/(siswa)/ujian/[sessionId]/result"
touch "src/app/(siswa)/layout.tsx"
touch "src/app/(siswa)/dashboard/page.tsx"
touch "src/app/(siswa)/profile/page.tsx"
touch "src/app/(siswa)/ujian/page.tsx"
touch "src/app/(siswa)/ujian/download/page.tsx"
touch "src/app/(siswa)/ujian/[sessionId]/page.tsx"
touch "src/app/(siswa)/ujian/[sessionId]/review/page.tsx"
touch "src/app/(siswa)/ujian/[sessionId]/result/page.tsx"

# (guru)
mkdir -p "src/app/(guru)/dashboard"
mkdir -p "src/app/(guru)/hasil"
mkdir -p "src/app/(guru)/soal/create"
mkdir -p "src/app/(guru)/soal/import"
mkdir -p "src/app/(guru)/soal/[id]/edit"
mkdir -p "src/app/(guru)/ujian/create"
mkdir -p "src/app/(guru)/ujian/[id]/edit"
mkdir -p "src/app/(guru)/ujian/[id]/preview"
mkdir -p "src/app/(guru)/ujian/[id]/statistics"
mkdir -p "src/app/(guru)/grading/[attemptId]"
touch "src/app/(guru)/layout.tsx"
touch "src/app/(guru)/dashboard/page.tsx"
touch "src/app/(guru)/hasil/page.tsx"
touch "src/app/(guru)/soal/page.tsx"
touch "src/app/(guru)/soal/create/page.tsx"
touch "src/app/(guru)/soal/import/page.tsx"
touch "src/app/(guru)/soal/[id]/edit/page.tsx"
touch "src/app/(guru)/ujian/page.tsx"
touch "src/app/(guru)/ujian/create/page.tsx"
touch "src/app/(guru)/ujian/[id]/edit/page.tsx"
touch "src/app/(guru)/ujian/[id]/preview/page.tsx"
touch "src/app/(guru)/ujian/[id]/statistics/page.tsx"
touch "src/app/(guru)/grading/page.tsx"
touch "src/app/(guru)/grading/[attemptId]/page.tsx"

# (pengawas)
mkdir -p "src/app/(pengawas)/dashboard"
mkdir -p "src/app/(pengawas)/monitoring/live"
mkdir -p "src/app/(pengawas)/monitoring/[sessionId]"
touch "src/app/(pengawas)/layout.tsx"
touch "src/app/(pengawas)/dashboard/page.tsx"
touch "src/app/(pengawas)/monitoring/live/page.tsx"
touch "src/app/(pengawas)/monitoring/[sessionId]/page.tsx"

# (operator)
mkdir -p "src/app/(operator)/dashboard"
mkdir -p "src/app/(operator)/laporan"
mkdir -p "src/app/(operator)/sesi/create"
mkdir -p "src/app/(operator)/sesi/[id]/edit"
mkdir -p "src/app/(operator)/ruang/create"
mkdir -p "src/app/(operator)/ruang/[id]/edit"
mkdir -p "src/app/(operator)/peserta/import"
touch "src/app/(operator)/layout.tsx"
touch "src/app/(operator)/dashboard/page.tsx"
touch "src/app/(operator)/laporan/page.tsx"
touch "src/app/(operator)/sesi/page.tsx"
touch "src/app/(operator)/sesi/create/page.tsx"
touch "src/app/(operator)/sesi/[id]/edit/page.tsx"
touch "src/app/(operator)/ruang/page.tsx"
touch "src/app/(operator)/ruang/create/page.tsx"
touch "src/app/(operator)/ruang/[id]/edit/page.tsx"
touch "src/app/(operator)/peserta/page.tsx"
touch "src/app/(operator)/peserta/import/page.tsx"

# (superadmin)
mkdir -p "src/app/(superadmin)/dashboard"
mkdir -p "src/app/(superadmin)/users"
mkdir -p "src/app/(superadmin)/settings"
mkdir -p "src/app/(superadmin)/audit-logs"
mkdir -p "src/app/(superadmin)/schools/create"
mkdir -p "src/app/(superadmin)/schools/[id]/edit"
touch "src/app/(superadmin)/layout.tsx"
touch "src/app/(superadmin)/dashboard/page.tsx"
touch "src/app/(superadmin)/users/page.tsx"
touch "src/app/(superadmin)/settings/page.tsx"
touch "src/app/(superadmin)/audit-logs/page.tsx"
touch "src/app/(superadmin)/schools/page.tsx"
touch "src/app/(superadmin)/schools/create/page.tsx"
touch "src/app/(superadmin)/schools/[id]/edit/page.tsx"

# API Route Handlers
mkdir -p src/app/api/auth/{login,logout,refresh}
mkdir -p src/app/api/{health,sync,download,media}
touch src/app/api/health/route.ts
touch src/app/api/auth/login/route.ts
touch src/app/api/auth/logout/route.ts
touch src/app/api/auth/refresh/route.ts
touch src/app/api/sync/route.ts
touch src/app/api/download/route.ts
touch src/app/api/media/route.ts

# ============================================
# COMPONENTS
# ============================================

echo "Creating components..."

mkdir -p src/components/{layout,auth,exam,sync,monitoring,grading,questions,analytics,ui,madrasah}

touch src/components/layout/{Header,Sidebar,Footer,MainLayout}.tsx
touch src/components/auth/{LoginForm,DeviceLockWarning}.tsx

mkdir -p src/components/exam/question-types
touch src/components/exam/question-types/{MultipleChoice,MultipleChoiceComplex,TrueFalse,Matching,ShortAnswer,Essay}.tsx
touch src/components/exam/{MediaPlayer,MediaRecorder,QuestionNavigation,ExamTimer,AutoSaveIndicator,ProgressBar,ExamInstructions,ActivityLogger}.tsx

touch src/components/sync/{DownloadProgress,SyncStatus,UploadQueue,ChecksumValidator}.tsx
touch src/components/monitoring/{LiveMonitor,StudentProgressCard,ActivityLogViewer}.tsx
touch src/components/grading/{ManualGradingCard,GradingRubric,EssaySimilarityBadge}.tsx
touch src/components/questions/{QuestionEditor,MediaUpload,OptionsEditor,MatchingEditor,TagSelector}.tsx
touch src/components/analytics/{DashboardStats,ExamStatistics,ItemAnalysisChart,StudentProgress}.tsx
touch src/components/ui/{Button,Input,Select,Modal,Alert,Toast,Card,Table,Tabs,Loading,Spinner,Badge,Tooltip,Confirm}.tsx
touch src/components/madrasah/{QuranDisplay,TajwidMarker,ArabicKeyboard,HafalanRecorder}.tsx

# ============================================
# STORES (ZUSTAND)
# ============================================

echo "Creating Zustand stores..."

mkdir -p src/stores
touch src/stores/{auth.store.ts,exam.store.ts,answer.store.ts,sync.store.ts,timer.store.ts,ui.store.ts,activity.store.ts,index.ts}

# ============================================
# LIB
# ============================================

echo "Creating lib..."

# API (ky client + per-domain functions)
mkdir -p src/lib/api
touch src/lib/api/{client.ts,auth.api.ts,exam-packages.api.ts,questions.api.ts,sessions.api.ts,submissions.api.ts,sync.api.ts,grading.api.ts,monitoring.api.ts,analytics.api.ts,media.api.ts}

# Database (IndexedDB via Dexie)
mkdir -p src/lib/db
touch src/lib/db/{schema.ts,db.ts,queries.ts,migrations.ts}

# Offline orchestration
mkdir -p src/lib/offline
touch src/lib/offline/{download.ts,sync.ts,queue.ts,checksum.ts,cache.ts}

# Exam state machine & utilities
mkdir -p src/lib/exam
touch src/lib/exam/{controller.ts,randomizer.ts,validator.ts,auto-save.ts,timer.ts,navigation.ts,activity-logger.ts,package-decoder.ts}

# Web Crypto API wrapper
mkdir -p src/lib/crypto
touch src/lib/crypto/{aes-gcm.ts,key-manager.ts,checksum.ts}

# Media
mkdir -p src/lib/media
touch src/lib/media/{recorder.ts,player.ts,upload.ts,compress.ts,chunked-upload.ts}

# Utilities
mkdir -p src/lib/utils
touch src/lib/utils/{network.ts,device.ts,time.ts,format.ts,error.ts,logger.ts,compression.ts}

# ============================================
# HOOKS
# ============================================

echo "Creating hooks..."

mkdir -p src/hooks
touch src/hooks/{use-exam.ts,use-timer.ts,use-auto-save.ts,use-media-recorder.ts,use-online-status.ts,use-device-warnings.ts,use-auth.ts,use-toast.ts,use-sync-status.ts,use-powersync.ts}

# ============================================
# TYPES & SCHEMAS
# ============================================

echo "Creating types and schemas..."

mkdir -p src/types
touch src/types/{exam.ts,question.ts,answer.ts,user.ts,sync.ts,api.ts,media.ts,activity.ts,common.ts,index.ts}

mkdir -p src/schemas
touch src/schemas/{auth.schema.ts,exam.schema.ts,question.schema.ts,answer.schema.ts,sync.schema.ts,user.schema.ts}

# ============================================
# MIDDLEWARE
# ============================================

touch src/middleware.ts
mkdir -p src/lib/middleware
touch src/lib/middleware/{auth.middleware.ts,tenant.middleware.ts,role.middleware.ts}

# ============================================
# STYLES
# ============================================

mkdir -p src/styles
touch src/styles/{arabic.css,print.css,animations.css}

# ============================================
# PUBLIC ASSETS
# ============================================

mkdir -p public/{fonts,icons,images}
touch public/{manifest.json,robots.txt}

# ============================================
# TESTS
# ============================================

echo "Creating test structure..."

mkdir -p src/tests/{unit,integration}
mkdir -p src/tests/unit/{stores,hooks,lib}
touch src/tests/unit/stores/{auth.store.spec.ts,exam.store.spec.ts,answer.store.spec.ts}
touch src/tests/unit/hooks/{use-timer.spec.ts,use-auto-save.spec.ts,use-online-status.spec.ts}
touch src/tests/unit/lib/{aes-gcm.spec.ts,checksum.spec.ts,compression.spec.ts,auto-save.spec.ts}
touch src/tests/integration/{dexie.spec.ts,sync.spec.ts}
touch src/tests/setup.ts

mkdir -p tests/e2e
touch tests/e2e/{auth.spec.ts,exam-flow.spec.ts,offline-sync.spec.ts,grading.spec.ts,media-recording.spec.ts}

# ============================================
# PACKAGE.JSON
# ============================================

echo "Creating package.json..."

cat > package.json << 'EOF'
{
  "name": "exam-frontend",
  "version": "1.0.0",
  "description": "Offline-First Exam System Frontend — Multi-Tenant",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:cov": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "daisyui": "^4.6.0",
    "zustand": "^4.5.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.7",
    "@powersync/react": "^1.0.0",
    "@powersync/web": "^1.0.0",
    "ky": "^1.2.0",
    "zod": "^3.22.4",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^3.2.0",
    "clsx": "^2.1.0",
    "next-safe": "^3.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^20.11.5",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.2.4",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "vitest": "^1.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "@testing-library/react": "^14.2.0",
    "@testing-library/user-event": "^14.5.2",
    "@playwright/test": "^1.41.0"
  }
}
EOF

# ============================================
# NEXT.CONFIG
# ============================================

cat > next.config.ts << 'EOF'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_MINIO_ENDPOINT ?? '',
        pathname: '/exam-assets/**',
      },
    ],
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false, // gunakan native Web Crypto, bukan Node crypto
    }
    return config
  },
  experimental: {
    optimizePackageImports: ['chart.js', 'dexie'],
  },
}

export default nextConfig
EOF

# ============================================
# TSCONFIG
# ============================================

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@stores/*": ["src/stores/*"],
      "@lib/*": ["src/lib/*"],
      "@types/*": ["src/types/*"],
      "@schemas/*": ["src/schemas/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "dist"]
}
EOF

# ============================================
# TAILWIND CONFIG
# ============================================

cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
        quran: ['Scheherazade New', 'Amiri', 'serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
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
    logs: false,
    rtl: false,
  },
}

export default config
EOF

# ============================================
# POSTCSS
# ============================================

cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# ============================================
# ESLINT
# ============================================

cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-floating-promises": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
EOF

# ============================================
# PRETTIER
# ============================================

cat > .prettierrc << 'EOF'
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

# ============================================
# VITEST CONFIG
# ============================================

cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@stores': resolve(__dirname, './src/stores'),
      '@lib': resolve(__dirname, './src/lib'),
      '@types': resolve(__dirname, './src/types'),
      '@schemas': resolve(__dirname, './src/schemas'),
    },
  },
})
EOF

# ============================================
# PLAYWRIGHT CONFIG
# ============================================

cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'android-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'android-tablet', use: { ...devices['Galaxy Tab S4'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
EOF

# ============================================
# TEST SETUP
# ============================================

cat > src/tests/setup.ts << 'EOF'
import '@testing-library/jest-dom'

Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      generateKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      digest: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
    },
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
      return arr
    },
  },
})

vi.mock('dexie', () => ({
  default: vi.fn().mockImplementation(() => ({
    version: vi.fn().mockReturnThis(),
    stores: vi.fn().mockReturnThis(),
    open: vi.fn(),
  })),
}))

vi.mock('@powersync/react', () => ({
  usePowerSync: vi.fn(),
  PowerSyncContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}))
EOF

# ============================================
# ENV FILES
# ============================================

cat > .env.example << 'EOF'
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_POWERSYNC_URL=https://sync.example.com
NEXT_PUBLIC_MINIO_ENDPOINT=minio.example.com
NEXT_PUBLIC_TENANT_DOMAIN=exam.example.com

NEXT_PUBLIC_ENABLE_RECORDING=true
NEXT_PUBLIC_AUTOSAVE_INTERVAL=30000
NEXT_PUBLIC_MAX_RECORDING_DURATION=300
NEXT_PUBLIC_MAX_RECORDING_SIZE=1073741824
NEXT_PUBLIC_MIN_STORAGE_MB=2048
EOF

cat > .env.local << 'EOF'
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_POWERSYNC_URL=http://localhost:6006
NEXT_PUBLIC_MINIO_ENDPOINT=localhost:9000
NEXT_PUBLIC_TENANT_DOMAIN=localhost:3000
EOF

# ============================================
# PWA MANIFEST
# ============================================

cat > public/manifest.json << 'EOF'
{
  "name": "Sistem Ujian",
  "short_name": "Ujian",
  "description": "Sistem Ujian Offline-First untuk Sekolah dan Madrasah",
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
  "categories": ["education"]
}
EOF

# ============================================
# ROBOTS.TXT
# ============================================

cat > public/robots.txt << 'EOF'
User-agent: *
Disallow: /api/
Disallow: /(siswa)/
Disallow: /(guru)/
Disallow: /(pengawas)/
Disallow: /(operator)/
Disallow: /(superadmin)/
Allow: /
EOF

# ============================================
# GITIGNORE
# ============================================

cat > .gitignore << 'EOF'
node_modules/
.next/
out/
dist/
.env
.env.production
coverage/
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
playwright-report/
test-results/
EOF

echo ""
echo "=========================================="
echo "exam-frontend structure created!"
echo "=========================================="
echo ""
echo "  cd $PROJECT_NAME"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "App  : http://localhost:3000"
echo "API  : http://localhost:3001/api (backend)"
echo "MinIO: http://localhost:9001"
echo ""
echo "Critical files to implement first:"
echo "  1. src/app/(siswa)/ujian/[sessionId]/page.tsx — halaman ujian utama"
echo "  2. src/lib/exam/controller.ts                 — state machine ujian"
echo "  3. src/lib/exam/package-decoder.ts            — dekripsi paket soal"
echo "  4. src/lib/db/schema.ts                       — skema IndexedDB"
echo "  5. src/lib/offline/download.ts                — download manager"
echo "  6. src/lib/offline/sync.ts                    — sync orchestrator"
echo "  7. src/lib/crypto/aes-gcm.ts                  — enkripsi/dekripsi"
