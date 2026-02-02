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
