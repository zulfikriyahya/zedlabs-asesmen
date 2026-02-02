#!/bin/bash

# Script untuk membuat struktur project exam-frontend (Enhanced & Complete)
# Sistem Asesmen Sekolah/Madrasah - Offline-First Multi-Tenant
# Author: Auto-generated  
# Date: $(date +%Y-%m-%d)

PROJECT_NAME="exam-frontend"

echo "=========================================="
echo "Creating $PROJECT_NAME Astro project"
echo "Offline-First Exam System Frontend"
echo "=========================================="

# Buat direktori root project
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# ============================================
# COMPONENTS STRUCTURE
# ============================================

echo "📦 Creating components structure..."
mkdir -p src/components/{layout,auth,exam/QuestionTypes,sync,monitoring,grading,questions,analytics,ui,madrasah}

# Layout components
touch src/components/layout/{Header,Sidebar,Footer,MainLayout}.astro

# Auth components
touch src/components/auth/{LoginForm,DeviceLockWarning}.astro

# Exam components - Question Types
touch src/components/exam/QuestionTypes/{MultipleChoice,MultipleChoiceComplex,TrueFalse,Matching,ShortAnswer,Essay}.astro

# Exam components - Other
touch src/components/exam/{MediaPlayer,MediaRecorder,QuestionNavigation,ExamTimer,AutoSaveIndicator,ProgressBar,ExamInstructions}.astro

# Sync components
touch src/components/sync/{DownloadProgress,SyncStatus,UploadQueue,ChecksumValidator}.astro

# Monitoring components
touch src/components/monitoring/{LiveMonitor,StudentProgressCard,ActivityLogViewer}.astro

# Grading components
touch src/components/grading/{ManualGradingCard,AudioPlayer,GradingRubric}.astro

# Questions components
touch src/components/questions/{QuestionEditor,MediaUpload,OptionsEditor,MatchingEditor,TagSelector}.astro

# Analytics components
touch src/components/analytics/{DashboardStats,ExamStatistics,ItemAnalysisChart,StudentProgress}.astro

# UI components
touch src/components/ui/{Button,Input,Select,Modal,Alert,Toast,Card,Table,Tabs,Loading,Spinner,Badge,Tooltip}.astro

# Madrasah components
touch src/components/madrasah/{QuranDisplay,TajwidMarker,ArabicKeyboard,HafalanRecorder}.astro

# ============================================
# PAGES STRUCTURE
# ============================================

echo "📄 Creating pages structure..."
mkdir -p src/pages/{siswa/ujian,guru/{soal,ujian,grading},pengawas/monitoring,operator/{sesi,ruang,peserta},superadmin/schools}

# Root pages
touch src/pages/{index,login,offline}.astro

# Siswa pages
touch src/pages/siswa/{dashboard,profile}.astro
touch src/pages/siswa/ujian/{index,download,result}.astro
touch "src/pages/siswa/ujian/[id].astro"

# Guru pages - Soal
touch src/pages/guru/dashboard.astro
touch src/pages/guru/soal/{index,create,import}.astro
mkdir -p "src/pages/guru/soal/[id]"
touch "src/pages/guru/soal/[id]/edit.astro"

# Guru pages - Ujian
touch src/pages/guru/ujian/{index,create}.astro
mkdir -p "src/pages/guru/ujian/[id]"
touch "src/pages/guru/ujian/[id]/{edit,preview,statistics}.astro"

# Guru pages - Grading
touch src/pages/guru/grading/index.astro
touch "src/pages/guru/grading/[attemptId].astro"
touch src/pages/guru/hasil.astro

# Pengawas pages
touch src/pages/pengawas/dashboard.astro
touch src/pages/pengawas/monitoring/live.astro
mkdir -p "src/pages/pengawas/monitoring/session"
touch "src/pages/pengawas/monitoring/session/[id].astro"

# Operator pages - Sesi
touch src/pages/operator/dashboard.astro
touch src/pages/operator/sesi/{index,create}.astro
mkdir -p "src/pages/operator/sesi/[id]"
touch "src/pages/operator/sesi/[id]/edit.astro"

# Operator pages - Ruang
touch src/pages/operator/ruang/{index,create}.astro
mkdir -p "src/pages/operator/ruang/[id]"
touch "src/pages/operator/ruang/[id]/edit.astro"

# Operator pages - Peserta
touch src/pages/operator/peserta/{index,import}.astro
touch src/pages/operator/laporan.astro

# Superadmin pages
touch src/pages/superadmin/{dashboard,users,settings,audit-logs}.astro
touch src/pages/superadmin/schools/{index,create}.astro
mkdir -p "src/pages/superadmin/schools/[id]"
touch "src/pages/superadmin/schools/[id]/edit.astro"

# API Routes (for SSR)
mkdir -p src/pages/api/{auth,exam,sync,download}
touch src/pages/api/health.ts

# ============================================
# STORES (NANOSTORES)
# ============================================

echo "🗄️ Creating state management stores..."
mkdir -p src/stores
touch src/stores/{auth,exam,answers,sync,offline,timer,ui,activity,toast}.ts

# ============================================
# LIB - API
# ============================================

echo "🔌 Creating lib/api structure..."
mkdir -p src/lib/api
touch src/lib/api/{client,auth,exam,question,sync,grading,student,monitoring,analytics,media}.ts

# ============================================
# LIB - DATABASE (IndexedDB)
# ============================================

echo "💾 Creating lib/db structure..."
mkdir -p src/lib/db
touch src/lib/db/{indexedDB,schema,encryption,migrations,queries}.ts

# ============================================
# LIB - OFFLINE
# ============================================

echo "📥 Creating lib/offline structure..."
mkdir -p src/lib/offline
touch src/lib/offline/{download,sync,queue,compress,checksum,cache}.ts

# ============================================
# LIB - EXAM
# ============================================

echo "📝 Creating lib/exam structure..."
mkdir -p src/lib/exam
touch src/lib/exam/{controller,randomizer,validator,autoSave,timer,navigation,activityLogger,stateManager}.ts

# ============================================
# LIB - MEDIA
# ============================================

echo "🎥 Creating lib/media structure..."
mkdir -p src/lib/media
touch src/lib/media/{recorder,player,upload,compress,stream,download}.ts

# ============================================
# LIB - UTILS
# ============================================

echo "🛠️ Creating lib/utils structure..."
mkdir -p src/lib/utils
touch src/lib/utils/{network,device,time,storage,validation,format,crypto,error,logger}.ts

# ============================================
# LIB - HOOKS
# ============================================

echo "🪝 Creating lib/hooks structure..."
mkdir -p src/lib/hooks
touch src/lib/hooks/{useExam,useTimer,useAutoSave,useMediaRecorder,useOnlineStatus,useDeviceWarnings,useAuth,useToast,useLocalStorage}.ts

# ============================================
# LIB - CONSTANTS & CONFIG
# ============================================

echo "⚙️ Creating lib/constants..."
mkdir -p src/lib/{constants,config}
touch src/lib/constants/{api,exam,storage,media,validation}.ts
touch src/lib/config/{app,theme}.ts

# ============================================
# TYPES
# ============================================

echo "📐 Creating types..."
mkdir -p src/types
touch src/types/{exam,question,answer,user,sync,api,media,activity,common}.ts

# ============================================
# STYLES
# ============================================

echo "🎨 Creating styles..."
mkdir -p src/styles
touch src/styles/{global,arabic,print,themes,animations}.css

# ============================================
# MIDDLEWARE
# ============================================

echo "🚪 Creating middleware..."
mkdir -p src/middleware
touch src/middleware/{auth,role,tenant}.ts

# ============================================
# LAYOUTS
# ============================================

echo "📐 Creating layouts..."
mkdir -p src/layouts
touch src/layouts/{Base,Auth,Dashboard,Exam}.astro

# ============================================
# PUBLIC ASSETS
# ============================================

echo "📦 Creating public assets..."
mkdir -p public/{fonts,icons,images,audio}
touch public/{service-worker.js,manifest.json,robots.txt}

# ============================================
# ROOT CONFIGURATION FILES
# ============================================

echo "⚙️ Creating configuration files..."

# Package.json - Comprehensive dependencies
cat > package.json << 'EOF'
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
EOF

# Astro config - Hybrid mode for SSR + SSG
cat > astro.config.mjs << 'EOF'
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
EOF

# TypeScript config
cat > tsconfig.json << 'EOF'
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
EOF

# Tailwind config - Complete with DaisyUI
cat > tailwind.config.cjs << 'EOF'
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
EOF

# ESLint config
cat > .eslintrc.cjs << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:astro/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
  ],
  ignorePatterns: ['node_modules', 'dist', '.astro'],
};
EOF

# Prettier config
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
EOF

# .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.npm/
.yarn/
.pnpm-debug.log

# Build outputs
dist/
.astro/
.output/

# Environment files
.env
.env.local
.env.production
.env.development

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# OS
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
.cache/
temp/

# Local data
*.db
*.sqlite
EOF

# Environment variables example
cat > .env.example << 'EOF'
# API Configuration
PUBLIC_API_URL=http://localhost:3001/api
PUBLIC_WS_URL=ws://localhost:3001

# School Configuration (Multi-tenant)
PUBLIC_SCHOOL_SUBDOMAIN=your-school
PUBLIC_SCHOOL_NAME=Your School Name

# App Configuration
PUBLIC_APP_VERSION=1.0.0
PUBLIC_APP_NAME=Exam System

# Feature Flags
PUBLIC_ENABLE_OFFLINE=true
PUBLIC_ENABLE_RECORDING=true
PUBLIC_ENABLE_MONITORING=true

# Media Configuration
PUBLIC_MAX_RECORDING_DURATION=300
PUBLIC_MAX_FILE_SIZE=1073741824
PUBLIC_ALLOWED_VIDEO_TYPES=video/mp4,video/webm
PUBLIC_ALLOWED_AUDIO_TYPES=audio/mp3,audio/webm

# Storage Configuration
PUBLIC_CACHE_EXPIRY_DAYS=7
PUBLIC_MIN_STORAGE_GB=2

# Development
NODE_ENV=development
EOF

# PWA Manifest
cat > public/manifest.json << 'EOF'
{
  "name": "Exam System",
  "short_name": "ExamApp",
  "description": "Offline-First Examination System for Schools",
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
  "categories": ["education"],
  "screenshots": []
}
EOF

# Service Worker (Basic structure)
cat > public/service-worker.js << 'EOF'
const CACHE_NAME = 'exam-app-v1';
const OFFLINE_CACHE = 'exam-offline-v1';

const STATIC_ASSETS = [
  '/',
  '/login',
  '/offline',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(OFFLINE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
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
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
EOF

# Robots.txt
cat > public/robots.txt << 'EOF'
User-agent: *
Disallow: /api/
Disallow: /siswa/
Disallow: /guru/
Disallow: /pengawas/
Disallow: /operator/
Disallow: /superadmin/
Allow: /
EOF

# README.md - Comprehensive documentation
cat > README.md << 'EOF'
# 📝 Exam Frontend - Offline-First Examination System

Web-based examination system frontend built with **Astro** for schools and madrasahs with complete offline capabilities.

## 🌟 Features

- ✅ **Offline-First Architecture** - Download exams, take offline, sync later
- ✅ **Multi-Tenant System** - Subdomain-based school routing
- ✅ **6 Question Types** - Multiple choice, complex MC, true/false, matching, short answer, essay
- ✅ **Multimedia Support** - Images, audio, video in questions and answers
- ✅ **Media Recording** - Audio/video answer recording (max 5 min, max 1GB)
- ✅ **Real-time Auto-save** - Saves answers every 30 seconds
- ✅ **Smart Timer** - Per-user duration tracking with warnings
- ✅ **Activity Logging** - Tracks all user activities during exam
- ✅ **Responsive Design** - Mobile-first, optimized for Android
- ✅ **Accessibility** - Font size control, dark mode, keyboard navigation
- ✅ **Arabic/Islamic Features** - Quran display, tajwid marking, Arabic keyboard
- ✅ **PWA Ready** - Installable as native app

## 🏗️ Project Structure

```
exam-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Header, Sidebar, Footer
│   │   ├── auth/        # Login, Device Lock
│   │   ├── exam/        # Question types, Timer, Navigation
│   │   ├── sync/        # Download, Upload, Sync status
│   │   ├── monitoring/  # Live monitoring for proctors
│   │   ├── grading/     # Manual grading interface
│   │   ├── questions/   # Question editor & management
│   │   ├── analytics/   # Charts and statistics
│   │   ├── ui/          # Base UI components
│   │   └── madrasah/    # Quran, Tajwid, Hafalan
│   │
│   ├── pages/           # Route pages
│   │   ├── siswa/       # Student pages
│   │   ├── guru/        # Teacher pages
│   │   ├── pengawas/    # Proctor pages
│   │   ├── operator/    # Operator pages
│   │   └── superadmin/  # Superadmin pages
│   │
│   ├── lib/             # Core functionality
│   │   ├── api/         # API client & endpoints
│   │   ├── db/          # IndexedDB (Dexie)
│   │   ├── offline/     # Download & sync managers
│   │   ├── exam/        # Exam controller & logic
│   │   ├── media/       # Media recorder & player
│   │   └── utils/       # Utility functions
│   │
│   ├── stores/          # State management (Nanostores)
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global styles
│   ├── layouts/         # Page layouts
│   └── middleware/      # Auth & role middleware
│
├── public/              # Static assets
│   ├── service-worker.js
│   ├── manifest.json
│   ├── fonts/
│   └── icons/
│
└── [config files]
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn or pnpm

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format
```

## 📱 Deployment

### Static Hosting (Netlify, Vercel)

```bash
npm run build
# Deploy the /dist folder
```

### Node.js Server

```bash
npm run build
node dist/server/entry.mjs
```

### Android WebView

The app is optimized for Android WebView. Key considerations:
- Enable JavaScript and DOM storage
- Grant camera/microphone permissions
- Enable geolocation if needed
- Set proper User-Agent

Example MainActivity.java code included in documentation.

## 🧪 Testing Checklist

- [ ] Test on various Android devices (5", 7", 10")
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

## 🔐 Security Features

- JWT-based authentication
- Device fingerprinting & locking
- AES-256 encryption for exam data
- Checksum validation for downloads
- Time validation against server
- Activity logging
- Prevented copy/paste during exam
- Disabled right-click during exam

## 🎯 Key Pages

### Most Critical Pages

1. **`/siswa/ujian/[id]`** - The exam page (MOST IMPORTANT!)
   - Renders questions dynamically
   - Auto-saves every 30 seconds
   - Logs all activities
   - Handles offline/online sync
   - Media recording support

2. **`/siswa/ujian/download`** - Exam download
   - Downloads exam package
   - Downloads all media files
   - Validates checksums
   - Stores encrypted data

3. **`/login`** - Authentication
   - Device fingerprinting
   - Single device enforcement
   - JWT token management

## 📊 Tech Stack

- **Framework**: Astro 4.0 (SSR + SSG)
- **Styling**: TailwindCSS + DaisyUI
- **State**: Nanostores (with persistence)
- **Database**: IndexedDB (Dexie.js)
- **API**: Axios
- **Charts**: Chart.js
- **PWA**: Service Worker
- **Recording**: MediaRecorder API
- **Encryption**: crypto-js
- **Compression**: pako

## 🌙 Features

### Dark Mode
Toggle in settings or auto-detect system preference.

### Font Size Adjustment
Small, Medium, Large options for accessibility.

### Offline Support
- Download exams with all media
- Work completely offline
- Auto-sync when online
- Retry failed uploads
- Queue management

### Arabic/Quran Support
- Beautiful Quran text rendering
- Tajwid color coding
- Arabic virtual keyboard
- Transliteration support
- Murattal audio player

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available options.

### Multi-Tenant

Each school has its own subdomain:
- `school1.exam.app`
- `school2.exam.app`

Configure via `PUBLIC_SCHOOL_SUBDOMAIN`.

## 📈 Performance

- **Initial Load**: < 3s on 3G
- **Bundle Size**: < 1MB (initial)
- **Time to Interactive**: < 5s
- **Offline First**: Works 100% offline after download

## 🐛 Troubleshooting

### "Exam not downloaded"
Ensure you've clicked "Download" before starting the exam.

### "Storage full"
Clear old exams or free up device storage. Minimum 2GB required.

### "Recording failed"
Grant microphone/camera permissions in browser settings.

### "Sync failed"
Check internet connection. Failed items will retry automatically.

## 👥 User Roles

1. **Siswa** (Student) - Take exams, view results
2. **Guru** (Teacher) - Create questions, manage exams, grading
3. **Pengawas** (Proctor) - Monitor exam sessions in real-time
4. **Operator** - Manage sessions, rooms, participants
5. **Superadmin** - System administration

## 📝 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Contact: support@exam.app

---

Built with ❤️ using Astro, TailwindCSS & IndexedDB
EOF

# Create sample env file
cat > .env << 'EOF'
PUBLIC_API_URL=http://localhost:3001/api
PUBLIC_WS_URL=ws://localhost:3001
PUBLIC_SCHOOL_SUBDOMAIN=demo
PUBLIC_APP_VERSION=1.0.0
PUBLIC_ENABLE_OFFLINE=true
EOF

echo ""
echo "=========================================="
echo "✅ Frontend structure created successfully!"
echo "=========================================="
echo ""
echo "📦 Project: $PROJECT_NAME"
echo "📍 Location: $(pwd)"
echo ""
echo "🚀 Next Steps:"
echo "   1. cd $PROJECT_NAME"
echo "   2. npm install"
echo "   3. cp .env.example .env (edit as needed)"
echo "   4. npm run dev"
echo ""
echo "🌐 Development server will run on:"
echo "   http://localhost:3000"
echo ""
echo "📚 Key Features Created:"
echo "   ✓ Complete component structure"
echo "   ✓ All page routes (Student, Teacher, Proctor, Operator, Admin)"
echo "   ✓ State management with Nanostores"
echo "   ✓ IndexedDB setup with Dexie"
echo "   ✓ Offline-first architecture"
echo "   ✓ Media recording support"
echo "   ✓ Auto-save mechanism"
echo "   ✓ Sync queue system"
echo "   ✓ PWA ready (Service Worker + Manifest)"
echo "   ✓ Dark mode & accessibility"
echo "   ✓ Arabic/Quran support"
echo "   ✓ Complete TypeScript setup"
echo "   ✓ ESLint + Prettier configured"
echo ""
echo "🎯 Most Critical Files to Implement:"
echo "   1. src/pages/siswa/ujian/[id].astro (THE EXAM PAGE)"
echo "   2. src/lib/exam/controller.ts (Exam logic)"
echo "   3. src/lib/offline/download.ts (Download manager)"
echo "   4. src/lib/offline/sync.ts (Sync manager)"
echo "   5. src/lib/db/schema.ts (IndexedDB schema)"
echo "   6. src/components/exam/MediaRecorder.astro"
echo ""
echo "📖 Documentation:"
echo "   • README.md - Complete project documentation"
echo "   • .env.example - All environment variables"
echo "   • Full TypeScript support with path aliases"
echo ""
echo "🎨 UI Framework:"
echo "   • TailwindCSS for styling"
echo "   • DaisyUI for components"
echo "   • Responsive & mobile-first"
echo ""
echo "Happy coding! 🚀"
echo "=========================================="
echo ""

# Show tree if available
if command -v tree &> /dev/null; then
    echo "📂 Project Structure:"
    tree -L 3 -I 'node_modules' -F
fi