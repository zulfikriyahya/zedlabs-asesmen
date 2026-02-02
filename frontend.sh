#!/bin/bash

# Script untuk membuat struktur project exam-frontend
# Author: Auto-generated
# Date: $(date +%Y-%m-%d)

PROJECT_NAME="exam-frontend"

echo "=========================================="
echo "Creating $PROJECT_NAME project structure"
echo "=========================================="

# Buat direktori root project
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Buat struktur direktori src/components
echo "Creating components structure..."
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
touch src/components/ui/{Button,Input,Select,Modal,Alert,Toast,Card,Table,Tabs,Loading}.astro

# Madrasah components
touch src/components/madrasah/{QuranDisplay,TajwidMarker,ArabicKeyboard,HafalanRecorder}.astro

# Buat struktur pages
echo "Creating pages structure..."
mkdir -p src/pages/{siswa/ujian,guru/{soal,ujian,grading},pengawas/monitoring,operator/{sesi,ruang,peserta},superadmin/schools}

# Root pages
touch src/pages/{index,login}.astro

# Siswa pages
touch src/pages/siswa/{dashboard,profile}.astro
touch src/pages/siswa/ujian/{index,download,result}.astro
touch "src/pages/siswa/ujian/[id].astro"

# Guru pages
touch src/pages/guru/dashboard.astro
touch src/pages/guru/soal/{index,create,import}.astro
touch "src/pages/guru/soal/[id]/edit.astro"
mkdir -p "src/pages/guru/soal/[id]"
touch "src/pages/guru/soal/[id]/edit.astro"

touch src/pages/guru/ujian/{index,create}.astro
mkdir -p "src/pages/guru/ujian/[id]"
touch "src/pages/guru/ujian/[id]/{edit,preview,statistics}.astro"

touch src/pages/guru/grading/index.astro
touch "src/pages/guru/grading/[attemptId].astro"
touch src/pages/guru/hasil.astro

# Pengawas pages
touch src/pages/pengawas/dashboard.astro
touch src/pages/pengawas/monitoring/live.astro
mkdir -p "src/pages/pengawas/monitoring/session"
touch "src/pages/pengawas/monitoring/session/[id].astro"

# Operator pages
touch src/pages/operator/dashboard.astro
touch src/pages/operator/sesi/{index,create}.astro
mkdir -p "src/pages/operator/sesi/[id]"
touch "src/pages/operator/sesi/[id]/edit.astro"

touch src/pages/operator/ruang/{index,create}.astro
mkdir -p "src/pages/operator/ruang/[id]"
touch "src/pages/operator/ruang/[id]/edit.astro"

touch src/pages/operator/peserta/{index,import}.astro
touch src/pages/operator/laporan.astro

# Superadmin pages
touch src/pages/superadmin/{dashboard,users,settings,audit-logs}.astro
touch src/pages/superadmin/schools/{index,create}.astro
mkdir -p "src/pages/superadmin/schools/[id]"
touch "src/pages/superadmin/schools/[id]/edit.astro"

# Buat struktur stores
echo "Creating stores..."
mkdir -p src/stores
touch src/stores/{auth,exam,answers,sync,offline,timer,ui,activity}.ts

# Buat struktur lib
echo "Creating lib structure..."
mkdir -p src/lib/{api,db,offline,exam,media,utils,hooks}

# API
touch src/lib/api/{client,auth,exam,question,sync,grading}.ts

# Database
touch src/lib/db/{indexedDB,schema,encryption,migrations}.ts

# Offline
touch src/lib/offline/{download,sync,queue,compress,checksum}.ts

# Exam
touch src/lib/exam/{randomizer,validator,autoSave,timer,navigation}.ts

# Media
touch src/lib/media/{recorder,player,upload,compress}.ts

# Utils
touch src/lib/utils/{network,device,time,storage,validation,format}.ts

# Hooks
touch src/lib/hooks/{useExam,useTimer,useAutoSave,useMediaRecorder,useOnlineStatus,useDeviceWarnings}.ts

# Buat struktur types
echo "Creating types..."
mkdir -p src/types
touch src/types/{exam,question,answer,user,sync,api}.ts

# Buat struktur styles
echo "Creating styles..."
mkdir -p src/styles
touch src/styles/{global,arabic,print}.css

# Buat middleware
echo "Creating middleware..."
mkdir -p src/middleware
touch src/middleware/{auth,role}.ts

# Buat struktur public
echo "Creating public assets..."
mkdir -p public/{fonts,icons}
touch public/{service-worker.js,manifest.json}

# Buat file konfigurasi root
echo "Creating config files..."
touch astro.config.mjs
touch tailwind.config.cjs
touch tsconfig.json
touch package.json
touch .gitignore
touch README.md

# Buat .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.npm/
.yarn/

# Build outputs
dist/
.astro/

# Environment files
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary files
*.tmp
.cache/
EOF

# Buat package.json dasar
cat > package.json << 'EOF'
{
  "name": "exam-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "@nanostores/persistent": "^0.9.0",
    "nanostores": "^0.9.0",
    "axios": "^1.6.0",
    "dexie": "^3.2.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0"
  }
}
EOF

# Buat astro.config.mjs dasar
cat > astro.config.mjs << 'EOF'
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  }
});
EOF

# Buat tsconfig.json dasar
cat > tsconfig.json << 'EOF'
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
EOF

# Buat tailwind.config.cjs dasar
cat > tailwind.config.cjs << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
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
        },
      },
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        quran: ['Scheherazade', 'serif'],
      },
    },
  },
  plugins: [],
};
EOF

# Buat README.md
cat > README.md << 'EOF'
# Exam Frontend

Web-based examination system frontend built with Astro.

## Features

- 📝 Multiple question types support
- 🔒 Offline-first architecture
- 🎯 Real-time monitoring
- 📊 Analytics and reporting
- 🎙️ Media recording capabilities
- 📖 Madrasah-specific features (Quran, Hafalan)

## Project Structure

```
exam-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Route pages
│   ├── lib/            # Utilities and helpers
│   ├── stores/         # State management (Nanostores)
│   ├── types/          # TypeScript type definitions
│   └── styles/         # Global styles
├── public/             # Static assets
└── [config files]
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Framework**: Astro
- **Styling**: Tailwind CSS
- **State Management**: Nanostores
- **Database**: IndexedDB (Dexie)
- **API Client**: Axios
- **TypeScript**: Type safety

## User Roles

- **Siswa** (Student): Take exams, view results
- **Guru** (Teacher): Create questions, manage exams, grading
- **Pengawas** (Proctor): Monitor exam sessions
- **Operator**: Manage sessions, rooms, participants
- **Superadmin**: System administration

## License

Private/Proprietary
EOF

echo ""
echo "=========================================="
echo "✅ Project structure created successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo "Project location: $(pwd)"
echo ""

# Tampilkan tree structure (jika tree terinstall)
if command -v tree &> /dev/null; then
    echo "Project structure:"
    tree -L 3 -I 'node_modules'
fi