# Exam System — Offline-First Multi-Tenant

Sistem ujian berbasis web untuk sekolah dan madrasah dengan kemampuan offline penuh dan isolasi data per institusi.

---

## Overview

Dua layer utama:

- **Offline-first** — peserta mengunduh paket soal, mengerjakan tanpa koneksi, sinkronisasi jawaban saat online kembali.
- **Multi-tenant** — setiap institusi memiliki data terisolasi via subdomain dan Row-Level Security PostgreSQL.

---

## Monorepo Structure

```
.
├── exam-frontend/     # Next.js 15 App Router (PWA)
├── exam-backend/      # NestJS 10 REST API
├── SKILLS.md          # Engineering standards & panduan pengerjaan
└── README.md
```

---

## Tech Stack

### Frontend (`exam-frontend`)

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 15 (App Router), TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3, DaisyUI 4 |
| State | Zustand 4 (in-memory only, tidak dipersist) |
| Offline Storage | Dexie 3 (IndexedDB) |
| Offline Sync | PowerSync |
| HTTP | ky 1 |
| Validasi | Zod 3 |
| Form | React Hook Form 7 + @hookform/resolvers |
| Enkripsi | Web Crypto API (AES-256-GCM) |
| Chart | Chart.js 4 + react-chartjs-2 |
| Real-time | Socket.IO Client 4 |
| Tanggal | date-fns 3 |
| Security | next-safe (CSP) |
| Testing | Vitest 1, Playwright 1 |

### Backend (`exam-backend`)

| Kategori | Teknologi |
|----------|-----------|
| Framework | NestJS 10, TypeScript 5 (strict mode) |
| ORM & DB | Prisma 5, PostgreSQL 16, PgBouncer (transaction mode, port 6432) |
| Cache & Queue | Redis 7 (ioredis), BullMQ 5 |
| Real-time | Socket.IO 4 (`/monitoring` namespace) |
| Auth | JWT (passport-jwt), refresh token rotation, bcrypt |
| Security | helmet, @nestjs/throttler, AES-256-GCM |
| Storage | MinIO (S3-compatible, presigned URL, private bucket) |
| Media | Sharp, fluent-ffmpeg, Puppeteer (PDF), ExcelJS |
| Monitoring | Winston + DailyRotateFile, Sentry (@sentry/node), @nestjs/terminus |
| Docs | Swagger / OpenAPI (`/docs`, non-production only) |
| Testing | Jest, Playwright, k6 |

---

## Architecture Overview

```
Browser (Offline-capable PWA)
        │
        ├── Next.js 15 App Router
        │    ├── [tenant].exam.app/                ← subdomain routing
        │    ├── /(siswa)/ujian/[sessionId]/        ← ruang ujian
        │    ├── /(siswa)/ujian/[sessionId]/review  ← review jawaban
        │    └── /(guru|operator|pengawas)/         ← dashboard per role
        │
        ├── Zustand Stores (in-memory only)
        │    ├── authStore     (user, accessToken)
        │    ├── examStore     (paket soal, question order, attempt)
        │    ├── answerStore   (jawaban per questionId, sync status)
        │    ├── timerStore    (remaining seconds, expired flag)
        │    ├── syncStore     (pending count, syncing flag)
        │    ├── activityStore (tab blur / paste count)
        │    └── uiStore       (toasts, sidebar, theme, online status)
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

        │
        ▼ (HTTPS)

   Nginx / Caddy  ←── TLS termination, rate limiting
        │
        ▼
  NestJS API (PM2 Cluster)
   ├── AuthModule         — JWT, RBAC, device fingerprint
   ├── SubmissionsModule  — download paket, submit jawaban, auto-grade
   ├── SyncModule         — offline recovery, chunked upload, PowerSync
   ├── SessionsModule     — sesi ujian, assign peserta, aktivasi
   ├── ExamPackagesModule — paket soal, item analysis
   ├── QuestionsModule    — CRUD soal 6 tipe, bulk import
   ├── GradingModule      — auto-grade & manual grading
   ├── MediaModule        — upload, presigned URL, kompresi
   ├── MonitoringModule   — Socket.IO gateway, live status
   ├── AuditLogsModule    — append-only audit trail
   ├── AnalyticsModule    — dashboard, statistik sesi
   ├── ReportsModule      — export Excel/PDF via BullMQ
   └── HealthModule       — @nestjs/terminus health check
        │
        ├── PostgreSQL 16 (RLS enabled) ←── PgBouncer :6432
        ├── Redis 7 (BullMQ + idempotency cache)
        └── MinIO (media storage, private bucket)
```

---

## Offline Flow

```
1. DOWNLOAD
   Login → verifikasi device fingerprint (SHA-256)
   → POST /api/student/download (tokenCode + idempotencyKey)
   → Server: upsert ExamAttempt + schedule timeout BullMQ
   → Client: simpan paket terenkripsi ke IndexedDB (Dexie: examPackages)

2. EXAM (online atau offline)
   Buka paket → dekripsi di memori (lib/crypto/aes-gcm.ts, Web Crypto API)
   → Key hanya hidup di Map keyManager — tidak pernah ke Zustand / localStorage / IndexedDB
   → Jawab soal → auto-save debounce → IndexedDB (Dexie: answers)
   → Rekam audio/video → chunked blob ke IndexedDB (Dexie: mediaBlobs)

3. SYNC
   Koneksi tersedia → PowerSync flush syncQueue → POST /api/student/answers
   → idempotencyKey mencegah duplikasi saat retry
   → Server konfirmasi → flag synced di IndexedDB

4. SUBMIT
   Review jawaban → POST /api/student/submit
   → BullMQ: auto-grade soal objektif
   → Esai: gradingStatus = MANUAL_REQUIRED → guru grade manual
   → Publish → siswa lihat hasil
```

---

## Security Model

| Layer | Mekanisme |
|-------|-----------|
| Transport | HTTPS + Helmet (CSP, HSTS) |
| Auth | JWT access (15m) di memory + refresh (7d) di httpOnly cookie, dengan rotation |
| Tenant isolation | `tenantId` wajib di setiap Prisma query; RLS PostgreSQL sebagai safety net |
| RBAC | 6 role: SUPERADMIN > ADMIN > TEACHER > OPERATOR > SUPERVISOR > STUDENT |
| Device | DeviceGuard — fingerprint SHA-256, bisa di-lock per perangkat |
| Enkripsi soal | `correctAnswer` disimpan AES-256-GCM; key tidak pernah ke client |
| Key lifecycle | `keyManager` hapus key saat submit / logout / `beforeunload` |
| Idempotency | Unique constraint `idempotencyKey` di `ExamAttempt` dan `ExamAnswer` |
| Rate limiting | STRICT (5/60s), MODERATE (30/60s), RELAXED (120/60s) |
| Audit | Tabel `audit_logs` append-only — login, start exam, submit, grade, publish |
| Presigned URL | Semua aset media via signed URL MinIO dengan TTL terbatas |

---

## Features

### Soal & Ujian
- 6 tipe soal: pilihan ganda, pilihan ganda kompleks, benar/salah, menjodohkan, isian singkat, uraian/esai.
- Multimedia pada soal dan jawaban: gambar, audio, video.
- Perekaman jawaban audio/video (maks. 5 menit / 1 GB per file).
- Auto-save debounce ke IndexedDB — tidak overwrite saat pengguna masih mengetik.
- Timer per peserta dengan notifikasi sisa waktu; force-submit otomatis via BullMQ.

### Antarmuka & Aksesibilitas
- Mobile-first, dioptimalkan untuk Android (termasuk low-end RAM 2–3 GB).
- Kontrol ukuran font, dark mode, navigasi keyboard.
- Fitur Arab/Islam: teks Al-Quran per ayat, penanda tajwid 9 hukum, keyboard Arab virtual.

### Backend Services
- Auto-grading soal objektif; manual grading + deteksi kemiripan esai (`string-similarity`).
- Ekspor laporan Excel (ExcelJS) dan PDF (Puppeteer) via BullMQ → MinIO.
- Real-time monitoring via Socket.IO (`/monitoring` namespace).
- Item analysis dan statistik ujian per sesi.

---

## Halaman Frontend

| Route | Role | Deskripsi |
|-------|------|-----------|
| `/login` | Semua | Login dengan verifikasi device fingerprint |
| `/(siswa)/dashboard` | STUDENT | Riwayat ujian + akses cepat |
| `/(siswa)/ujian/download` | STUDENT | Input token ujian |
| `/(siswa)/ujian/[sessionId]` | STUDENT | Ruang ujian utama |
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

## Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_APP_URL=https://exam.example.com
NEXT_PUBLIC_API_URL=https://api.example.com/api
NEXT_PUBLIC_TENANT_DOMAIN=exam.example.com
NEXT_PUBLIC_POWERSYNC_URL=https://sync.example.com
NEXT_PUBLIC_MINIO_ENDPOINT=minio.example.com
NEXT_PUBLIC_ENABLE_RECORDING=true
NEXT_PUBLIC_AUTOSAVE_INTERVAL=30000
NEXT_PUBLIC_MAX_RECORDING_DURATION=300
NEXT_PUBLIC_MAX_RECORDING_SIZE=1073741824
NEXT_PUBLIC_MIN_STORAGE_MB=2048
```

### Backend (`.env`)

```env
NODE_ENV=production
PORT=3000
APP_URL=https://api.example.com
DATABASE_URL=postgresql://user:pass@pgbouncer:6432/exam_db
DATABASE_DIRECT_URL=postgresql://user:pass@postgres:5432/exam_db
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ENCRYPTION_KEY=            # 64 hex chars: openssl rand -hex 32
MINIO_ENDPOINT=
MINIO_PORT=9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=exam-assets
MINIO_PRESIGNED_TTL=3600
SENTRY_DSN=
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## Deployment Checklist

### Infrastructure
- [ ] PostgreSQL RLS diaktifkan (`npm run db:rls`) dan diverifikasi per tenant
- [ ] PgBouncer mode transaction pooling, port 6432
- [ ] MinIO bucket policy **private**; akses hanya via presigned URL
- [ ] Subdomain wildcard `*.exam.example.com` diarahkan ke server yang sama
- [ ] Backup otomatis PostgreSQL terjadwal dan restore diverifikasi

### Backend
- [ ] `ENCRYPTION_KEY` — 64 hex chars, bukan default
- [ ] `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET` — min 32 chars, random, berbeda satu sama lain
- [ ] `DATABASE_URL` → PgBouncer (port 6432); `DATABASE_DIRECT_URL` → Postgres (port 5432)
- [ ] Sentry DSN dikonfigurasi; test error terkirim
- [ ] `NODE_ENV=production` di-set (disable Swagger, enable file log rotation)
- [ ] `prisma migrate deploy` + `db:rls` dijalankan di pipeline CI/CD

### Frontend
- [ ] `NEXT_PUBLIC_API_URL` mengarah ke backend production
- [ ] CSP tidak memblokir Web Crypto API, PowerSync, atau domain MinIO
- [ ] Service Worker PowerSync tidak konflik dengan cache Next.js
- [ ] Verifikasi `access_token` tidak di httpOnly cookie; `refresh_token` di httpOnly cookie
- [ ] Verifikasi key enkripsi tidak tersimpan di IndexedDB setelah submit

### Quality Gate
- [ ] Playwright E2E lulus di staging (termasuk skenario offline via mock service worker)
- [ ] Auto-save diuji pada kondisi IndexedDB hampir penuh
- [ ] Recording diuji pada Android low-end (RAM 2–3 GB)
- [ ] Offline flow end-to-end: download → airplane mode → ujian → sync
