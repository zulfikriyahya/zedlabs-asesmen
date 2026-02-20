# Exam Frontend

Sistem ujian offline-first multi-tenant untuk sekolah dan madrasah, dibangun dengan Next.js 15 App Router.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router), TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3, DaisyUI 4 |
| State Management | Zustand 4 (in-memory only, tidak dipersist) |
| Offline Storage | Dexie 3 (IndexedDB) |
| Offline Sync | PowerSync |
| HTTP Client | ky 1 |
| Validasi | Zod 3 |
| Form | React Hook Form 7 + @hookform/resolvers |
| Enkripsi | Web Crypto API (AES-256-GCM) |
| Chart | Chart.js 4 + react-chartjs-2 |
| Real-time | Socket.IO Client 4 |
| Tanggal | date-fns 3 |
| Security | next-safe (CSP) |
| Testing | Vitest 1, Playwright 1 |

---

## Arsitektur

```
Browser (Offline-capable PWA)
        │
        ├── Next.js 15 App Router
        │    ├── src/middleware.ts           ← auth + RBAC + subdomain tenant
        │    ├── src/app/(auth)/             ← login
        │    ├── src/app/(siswa)/            ← ruang ujian, review, result
        │    ├── src/app/(guru)/             ← bank soal, paket ujian, penilaian
        │    ├── src/app/(operator)/         ← sesi, ruang, peserta, laporan
        │    ├── src/app/(pengawas)/         ← live monitoring
        │    └── src/app/(superadmin)/       ← manajemen sekolah, audit log
        │
        ├── Zustand Stores (in-memory only)
        │    ├── authStore     ← user, accessToken
        │    ├── examStore     ← paket soal aktif, question order, attempt
        │    ├── answerStore   ← jawaban per questionId, sync status
        │    ├── timerStore    ← remaining seconds, expired flag
        │    ├── syncStore     ← pending count, syncing flag
        │    ├── activityStore ← tab blur / paste count
        │    └── uiStore       ← toasts, sidebar, theme, online status
        │
        ├── Dexie (IndexedDB)
        │    ├── examPackages  ← paket soal terenkripsi (ciphertext)
        │    ├── answers       ← jawaban lokal sebelum sync
        │    ├── activityLogs  ← log aktivitas mencurigakan
        │    ├── syncQueue     ← antrian operasi yang belum dikirim
        │    └── mediaBlobs    ← rekaman audio/video sebelum upload
        │
        └── PowerSync
             └── Sinkronisasi dua arah dengan backend saat online
```

---

## Alur Offline (Kritis)

```
Login → DeviceGuard (fingerprint SHA-256)
→ POST /api/student/download (tokenCode + idempotencyKey)
→ Server: upsert ExamAttempt + schedule timeout BullMQ
→ Client: simpan paket terenkripsi ke IndexedDB (Dexie: examPackages)
→ Dekripsi di memori (lib/crypto/aes-gcm.ts, Web Crypto API)
→ Key enkripsi HANYA di memori — tidak pernah ke Zustand,
  localStorage, sessionStorage, atau IndexedDB
→ Kerjakan ujian → auto-save debounce → IndexedDB (Dexie: answers)
→ Rekam audio/video → chunked blob ke IndexedDB (Dexie: mediaBlobs)
→ PowerSync flush syncQueue → POST /api/student/answers (idempotencyKey)
→ Review jawaban → POST /api/student/submit
```

---

## Struktur Proyek

```
exam-frontend/
├── src/
│   ├── app/
│   │   ├── api/                    # Next.js route handlers
│   │   │   ├── auth/               # login, logout, refresh
│   │   │   ├── download/           # proxy ke backend /student/download
│   │   │   ├── health/
│   │   │   ├── media/
│   │   │   └── sync/
│   │   ├── (auth)/login/
│   │   ├── (guru)/                 # dashboard, soal, ujian, grading, hasil
│   │   ├── (operator)/             # dashboard, ruang, sesi, peserta, laporan
│   │   ├── (pengawas)/             # dashboard, monitoring/[sessionId]
│   │   ├── (siswa)/                # dashboard, profile, ujian/[sessionId]/{review,result}
│   │   └── (superadmin)/           # audit-logs, dashboard, schools, users, settings
│   ├── components/
│   │   ├── analytics/              # DashboardStats, ExamStatistics, ItemAnalysisChart, StudentProgress
│   │   ├── auth/                   # LoginForm, DeviceLockWarning
│   │   ├── exam/                   # ActivityLogger, AutoSaveIndicator, ExamTimer, QuestionNavigation
│   │   │   └── question-types/     # Essay, Matching, MultipleChoice, ShortAnswer, TrueFalse
│   │   ├── grading/                # EssaySimilarityBadge, GradingRubric, ManualGradingCard
│   │   ├── layout/                 # Header, Footer, Sidebar, MainLayout
│   │   ├── madrasah/               # ArabicKeyboard, HafalanRecorder, QuranDisplay, TajwidMarker
│   │   ├── monitoring/             # ActivityLogViewer, LiveMonitor, StudentProgressCard
│   │   ├── questions/              # MatchingEditor, MediaUpload, OptionsEditor, QuestionEditor, TagSelector
│   │   ├── sync/                   # ChecksumValidator, DownloadProgress, SyncStatus, UploadQueue
│   │   └── ui/                     # Alert, Badge, Button, Card, Confirm, Input, Loading,
│   │                               # Modal, Select, Spinner, Table, Tabs, Toast, Tooltip
│   ├── hooks/
│   │   ├── use-auth.ts             # refresh token, redirect per role
│   │   ├── use-auto-save.ts        # debounce save jawaban ke IndexedDB
│   │   ├── use-device-warnings.ts  # cek Web Crypto + storage availability
│   │   ├── use-exam.ts             # selector currentQuestion + progress
│   │   ├── use-media-recorder.ts   # MediaRecorder API wrapper
│   │   ├── use-online-status.ts    # navigator.onLine listener
│   │   ├── use-powersync.ts        # flush sync queue via PowerSync
│   │   ├── use-sync-status.ts      # status sinkronisasi gabungan
│   │   ├── use-timer.ts            # tick setiap detik, panggil onExpire
│   │   └── use-toast.ts            # helper success/error/warning/info
│   ├── lib/
│   │   ├── api/                    # client.ts (ky + interceptor token refresh), per-domain API files
│   │   ├── crypto/                 # aes-gcm.ts, checksum.ts, key-manager.ts
│   │   ├── db/                     # Dexie schema, migrations, queries
│   │   ├── exam/                   # activity-logger, auto-save, controller,
│   │   │                           # navigation, package-decoder, randomizer, timer, validator
│   │   ├── media/                  # chunked-upload, compress, player, recorder, upload
│   │   ├── middleware/             # auth, role, tenant helpers
│   │   ├── offline/                # cache, checksum, download, queue, sync
│   │   └── utils/                  # compression, device, error, format, logger, network, time
│   ├── middleware.ts               # Next.js middleware: auth check + RBAC + subdomain header
│   ├── schemas/                    # Zod: answer, auth, exam, question, sync, user
│   ├── stores/                     # Zustand (in-memory): activity, answer, auth, exam, sync, timer, ui
│   ├── styles/                     # animations.css, arabic.css, print.css
│   ├── tests/
│   │   ├── integration/            # dexie.spec.ts, sync.spec.ts
│   │   ├── unit/                   # hooks, lib, stores
│   │   └── setup.ts
│   └── types/                      # activity, answer, api, common, exam, media, question, sync, user
├── tests/e2e/                      # Playwright: auth, exam-flow, grading, media-recording, offline-sync
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## Halaman & Routes

| Route | Role | Deskripsi |
|-------|------|-----------|
| `/login` | Semua | Login dengan verifikasi device fingerprint |
| `/(siswa)/dashboard` | STUDENT | Riwayat ujian + akses cepat |
| `/(siswa)/ujian/download` | STUDENT | Input token ujian |
| `/(siswa)/ujian/[sessionId]` | STUDENT | Ruang ujian utama (timer, auto-save, lazy question types) |
| `/(siswa)/ujian/[sessionId]/review` | STUDENT | Review jawaban sebelum submit |
| `/(siswa)/ujian/[sessionId]/result` | STUDENT | Nilai dan rincian jawaban |
| `/(siswa)/profile` | STUDENT | Profil pengguna |
| `/(guru)/dashboard` | TEACHER | Statistik soal, paket, penilaian pending |
| `/(guru)/soal` | TEACHER | Bank soal (list, create, edit, import, approve) |
| `/(guru)/ujian` | TEACHER | Paket ujian (list, create, edit, preview, statistik) |
| `/(guru)/grading` | TEACHER | Manual grading esai |
| `/(guru)/hasil` | TEACHER | Hasil ujian per sesi |
| `/(operator)/dashboard` | OPERATOR | Statistik sesi & peserta |
| `/(operator)/ruang` | OPERATOR | CRUD ruang ujian |
| `/(operator)/sesi` | OPERATOR | CRUD sesi ujian, aktivasi, monitoring |
| `/(operator)/peserta` | OPERATOR | Manajemen & import peserta |
| `/(operator)/laporan` | OPERATOR | Generate laporan PDF/Excel |
| `/(pengawas)/dashboard` | SUPERVISOR | Shortcut ke live monitor |
| `/(pengawas)/monitoring/live` | SUPERVISOR | Daftar sesi aktif |
| `/(pengawas)/monitoring/[sessionId]` | SUPERVISOR | Live monitoring per sesi via Socket.IO |
| `/(superadmin)/dashboard` | SUPERADMIN | Statistik global |
| `/(superadmin)/schools` | SUPERADMIN | CRUD tenant/sekolah |
| `/(superadmin)/users` | SUPERADMIN | Manajemen pengguna lintas tenant |
| `/(superadmin)/audit-logs` | SUPERADMIN | Log audit append-only |
| `/(superadmin)/settings` | SUPERADMIN | Info konfigurasi sistem |

---

## Komponen Tipe Soal

Semua tipe soal di-lazy load via `dynamic(() => import(...))`:

| Tipe | Komponen | Deskripsi |
|------|----------|-----------|
| `MULTIPLE_CHOICE` | `MultipleChoice` | Radio button dengan highlight pilihan terpilih |
| `COMPLEX_MULTIPLE_CHOICE` | `MultipleChoiceComplex` | Checkbox, lebih dari satu jawaban benar |
| `TRUE_FALSE` | `TrueFalse` | Dua tombol toggle Benar / Salah |
| `MATCHING` | `Matching` | Tabel radio matrix kiri–kanan |
| `SHORT_ANSWER` | `ShortAnswer` | Input teks maks. 500 karakter |
| `ESSAY` | `Essay` | Textarea auto-resize maks. 5000 karakter |

---

## Fitur Madrasah

| Komponen | Fungsi |
|----------|--------|
| `ArabicKeyboard` | Virtual keyboard Arab dengan harakat, tanda baca, dan frasa khusus (basmalah, shalawat) |
| `HafalanRecorder` | Rekaman hafalan multi-bagian (per surah/ayat) dengan referensi teks Arab |
| `QuranDisplay` | Tampilan teks Al-Quran per ayat dengan terjemahan dan highlight ayat kunci |
| `TajwidMarker` | Penanda hukum tajwid interaktif (9 hukum) dengan palet warna standar internasional |

---

## Auto-Save & Sync Flow

```
Perubahan jawaban
  → setAnswer(questionId, value)    ← optimistic update UI (Zustand)
  → debouncedSave(1500ms)           ← mencegah overwrite saat mengetik
  → upsertAnswer(IndexedDB)         ← persist lokal (Dexie: answers)
  → enqueueSyncItem(syncQueue)      ← antrian ke server
  → PowerSync flush (saat online)   ← POST /api/student/answers
  → markAnswerSynced()              ← update flag di IndexedDB
```

---

## Model Keamanan

| Layer | Mekanisme |
|-------|-----------|
| Auth | JWT access (15m) di memory + refresh (7d) di httpOnly cookie; auto-refresh via interceptor ky saat 401 |
| Device | Fingerprint SHA-256 (userAgent + screen + timezone) dikirim saat login & download |
| Enkripsi soal | AES-256-GCM via Web Crypto API; `CryptoKey` non-extractable, hanya di memori |
| Key lifecycle | `keyManager` hapus key saat submit / logout / `beforeunload` |
| Idempotency | Setiap jawaban dan submission membawa UUID v4 `idempotencyKey` |
| RBAC | `middleware.ts` decode JWT (tanpa verify) → cek prefix route vs role |
| Activity log | Tab blur, paste, idle dicatat ke IndexedDB → sync ke server → monitoring real-time |

> **Penting:** Key enkripsi tidak pernah masuk ke Zustand, localStorage, sessionStorage, maupun IndexedDB. Key hanya hidup di `Map` dalam `key-manager.ts` selama sesi berlangsung.

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_APP_URL=https://exam.example.com
NEXT_PUBLIC_API_URL=https://api.example.com/api
NEXT_PUBLIC_TENANT_DOMAIN=exam.example.com

# Optional
NEXT_PUBLIC_POWERSYNC_URL=https://sync.example.com
NEXT_PUBLIC_MINIO_ENDPOINT=minio.example.com
NEXT_PUBLIC_ENABLE_RECORDING=true
NEXT_PUBLIC_AUTOSAVE_INTERVAL=30000
NEXT_PUBLIC_MAX_RECORDING_DURATION=300
NEXT_PUBLIC_MAX_RECORDING_SIZE=1073741824
NEXT_PUBLIC_MIN_STORAGE_MB=2048
```

---

## Development

```bash
npm run dev          # development server
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier
```

---

## Testing

```bash
npm test             # unit & integration (Vitest)
npm run test:watch   # watch mode
npm run test:cov     # coverage report
npm run test:e2e     # Playwright (pastikan dev server berjalan)
npm run test:e2e:ui  # Playwright UI interaktif
```

### Skenario E2E
- `auth.spec.ts` — Login, logout, redirect per role
- `exam-flow.spec.ts` — Download → kerjakan → submit → result
- `grading.spec.ts` — Manual grading esai
- `media-recording.spec.ts` — Rekam, simpan, upload
- `offline-sync.spec.ts` — Airplane mode → kerjakan → online → sync

---

## Build & Deployment

```bash
npm run build
npm start
```

### Checklist Deployment
- [ ] `NEXT_PUBLIC_API_URL` mengarah ke backend production
- [ ] Subdomain wildcard `*.exam.example.com` → server yang sama
- [ ] CSP tidak memblokir Web Crypto API, PowerSync, atau domain MinIO
- [ ] Service Worker PowerSync tidak konflik dengan cache Next.js
- [ ] Verifikasi `access_token` tidak di httpOnly cookie; `refresh_token` di httpOnly cookie
- [ ] Verifikasi key enkripsi tidak tersimpan di IndexedDB setelah submit
- [ ] Auto-save diuji pada kondisi IndexedDB hampir penuh
- [ ] Offline flow end-to-end: download → airplane mode → ujian → sync
- [ ] Recording diuji pada Android low-end (RAM 2–3 GB)
