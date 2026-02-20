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
├── exam-backend/      # NestJS REST API
├── generate.sh        # Generator blueprint DRAFT_FE.md & DRAFT_BE.md
├── README.md
└── SKILLS.md
```

---

## Tech Stack

### Frontend (`exam-frontend`)

| Kategori        | Teknologi                            |
|-----------------|--------------------------------------|
| Framework       | Next.js 15 (App Router), TypeScript  |
| Styling         | Tailwind CSS, DaisyUI                |
| State           | Zustand (persisted)                  |
| Offline Storage | Dexie (IndexedDB)                    |
| Offline Sync    | PowerSync                            |
| HTTP            | ky                                   |
| Validasi        | Zod                                  |
| Enkripsi        | Web Crypto API (AES-GCM)             |
| Kompresi        | CompressionStream (native)           |
| Chart           | Chart.js                             |
| Tanggal         | date-fns                             |
| Security        | next-safe (CSP)                      |

### Backend (`exam-backend`)

| Kategori      | Teknologi                                 |
|---------------|-------------------------------------------|
| Framework     | NestJS, TypeScript                        |
| ORM & DB      | Prisma, PostgreSQL, PgBouncer             |
| Cache & Queue | Redis (Sentinel/Cluster), BullMQ          |
| Real-time     | Socket.IO                                 |
| Auth          | JWT, Passport, refresh token rotation     |
| Security      | helmet, @nestjs/throttler                 |
| Storage       | MinIO (presigned URL)                     |
| Media         | Sharp, fluent-ffmpeg, Puppeteer, ExcelJS  |
| Monitoring    | Winston, Sentry, @nestjs/terminus         |
| Docs          | Swagger                                   |
| Utility       | date-fns-tz, string-similarity, Zod       |

### Testing

| Scope            | Teknologi  |
|------------------|------------|
| Unit Frontend    | Vitest     |
| Unit Backend     | Jest       |
| E2E              | Playwright |
| Load             | k6         |

---

## Architecture Overview

```
Browser (Offline-capable PWA)
        │
        ├── Next.js App Router
        │    ├── [tenant].exam.app/               ← subdomain routing
        │    ├── /(siswa)/ujian/[sessionId]/       ← ruang ujian
        │    ├── /(siswa)/ujian/[sessionId]/review ← review jawaban
        │    └── /(guru|operator|pengawas)/        ← dashboard per role
        │
        ├── Zustand Store
        │    ├── authStore    (session, token, device)
        │    ├── examStore    (paket soal, timer, status)
        │    ├── answerStore  (jawaban, auto-save state)
        │    └── syncStore    (antrian sync, status koneksi)
        │
        ├── Dexie (IndexedDB)
        │    ├── examPackages  (soal terenkripsi)
        │    ├── answers       (jawaban peserta)
        │    ├── activityLogs  (log aktivitas)
        │    └── syncQueue     (antrian submission)
        │
        └── PowerSync
             └── Sinkronisasi dua arah dengan backend saat online

        │
        ▼ (HTTPS)

   Nginx / Caddy  ←── TLS termination, rate limiting
        │
        ▼
  NestJS API Server
   ├── Auth Module         (JWT, RBAC, device lock)
   ├── Exam Module         (paket soal, sesi ujian)
   ├── Submission Module   (idempotency, auto-grade)
   ├── Sync Module         (BullMQ, dead letter queue)
   ├── Media Module        (MinIO, presigned URL)
   ├── Analytics Module    (item analysis, laporan)
   └── Health Module       (@nestjs/terminus)
        │
        ├── PostgreSQL (RLS enabled) ←── PgBouncer
        ├── Redis Sentinel/Cluster
        └── MinIO
```

---

## Offline Flow

```
1. DOWNLOAD
   Login → verifikasi device → download paket soal terenkripsi
   → simpan ke IndexedDB via Dexie

2. EXAM (online atau offline)
   Buka paket → dekripsi di memori (Web Crypto API, AES-GCM)
   → jawab soal → auto-save ke IndexedDB setiap 30 detik
   → rekam audio/video → simpan blob ke IndexedDB (chunked)

3. SYNC
   Koneksi tersedia → PowerSync push jawaban ke backend
   → idempotency key mencegah duplikasi
   → konfirmasi dari server → sesi ditandai selesai di IndexedDB
```

---

## Security Model

| Layer           | Mekanisme                                                                                      |
|-----------------|-----------------------------------------------------------------------------------------------|
| Multi-tenant    | `tenantId` wajib di setiap query Prisma; RLS PostgreSQL sebagai safety net lapis kedua        |
| Enkripsi soal   | AES-GCM via Web Crypto API; key hanya di memori selama sesi, tidak pernah dipersist           |
| Device locking  | Fingerprint diverifikasi backend saat download dan sync; perangkat tidak terdaftar ditolak    |
| Presigned URL   | Semua aset media via signed URL MinIO dengan TTL terbatas                                      |
| Idempotency     | Setiap submission membawa idempotency key; backend validasi sebelum masuk antrian             |
| Audit log       | Tabel append-only: mulai ujian, submit jawaban, perubahan nilai, akses admin                  |
| Refresh token   | Rotation setiap refresh; token lama di-invalidate di Redis                                    |
| CSP             | `next-safe` mengkonfigurasi Content Security Policy ketat, tidak memblokir Web Crypto/PowerSync|
| Activity log    | Perpindahan tab, blur window, paste, dan aksi mencurigakan dicatat ke IndexedDB → backend     |

---

## Features

### Soal & Ujian
- 6 tipe soal: pilihan ganda, pilihan ganda kompleks, benar/salah, menjodohkan, isian singkat, uraian/esai
- Multimedia pada soal dan jawaban: gambar, audio, video
- Perekaman jawaban audio/video (maks. 5 menit / 1 GB per file)
- Auto-save dengan debounce ke IndexedDB
- Timer per peserta dengan notifikasi sisa waktu

### Antarmuka & Aksesibilitas
- Mobile-first, dioptimalkan untuk Android
- Kontrol ukuran font, dark mode, navigasi keyboard
- Fitur Arab/Islam: teks Al-Quran, penanda tajwid, keyboard Arab
- Responsive untuk tablet dan desktop

### Backend Services
- Auto-grading soal objektif; manual grading untuk uraian/esai
- Deteksi kemiripan jawaban esai (`string-similarity`)
- Ekspor laporan Excel (ExcelJS) dan PDF (Puppeteer)
- Real-time monitoring ujian via Socket.IO
- Item analysis dan statistik ujian

---

## API Modules

| Module        | Prefix           | Deskripsi                              |
|---------------|------------------|----------------------------------------|
| Auth          | `/auth`          | Login, refresh token, logout           |
| Tenants       | `/tenants`       | Manajemen institusi                    |
| Users         | `/users`         | Manajemen pengguna dan role            |
| Exam Packages | `/exam-packages` | Pembuatan dan pengelolaan paket soal   |
| Questions     | `/questions`     | CRUD soal dengan 6 tipe                |
| Sessions      | `/sessions`      | Sesi ujian dan peserta                 |
| Submissions   | `/submissions`   | Pengiriman jawaban dengan idempotency  |
| Sync          | `/sync`          | Endpoint sinkronisasi offline          |
| Grading       | `/grading`       | Auto dan manual grading                |
| Analytics     | `/analytics`     | Item analysis dan statistik            |
| Reports       | `/reports`       | Ekspor Excel dan PDF                   |
| Media         | `/media`         | Upload dan presigned URL               |
| Health        | `/health`        | Health check untuk load balancer       |

---

## Queue Jobs (BullMQ)

| Queue          | Job                   | Deskripsi                          |
|----------------|-----------------------|------------------------------------|
| `submission`   | `process-submission`  | Validasi dan simpan jawaban        |
| `submission`   | `auto-grade`          | Penilaian otomatis soal objektif   |
| `sync`         | `process-sync-batch`  | Proses batch sinkronisasi offline  |
| `media`        | `transcode-video`     | Transcode video jawaban            |
| `media`        | `compress-image`      | Kompresi gambar soal               |
| `report`       | `generate-pdf`        | Generate laporan PDF via Puppeteer |
| `report`       | `generate-excel`      | Generate laporan Excel via ExcelJS |
| `notification` | `send-realtime`       | Kirim event ke Socket.IO           |

Semua queue dikonfigurasi dengan dead letter queue dan `removeOnFail: false`.

---

## Halaman Frontend

| Route                                     | Role       | Deskripsi                           |
|-------------------------------------------|------------|-------------------------------------|
| `/`                                       | All        | Landing / redirect ke login         |
| `/login`                                  | All        | Login dengan verifikasi device      |
| `/(siswa)/ujian/[sessionId]`              | Siswa      | Ruang ujian utama                   |
| `/(siswa)/ujian/[sessionId]/review`       | Siswa      | Review jawaban sebelum submit       |
| `/(siswa)/ujian/[sessionId]/result`       | Siswa      | Hasil ujian                         |
| `/(guru)/dashboard`                       | Guru       | Manajemen soal, ujian, penilaian    |
| `/(operator)/dashboard`                   | Operator   | Manajemen sesi, ruang, peserta      |
| `/(pengawas)/monitoring`                  | Pengawas   | Monitoring live ujian               |
| `/(superadmin)/dashboard`                 | Superadmin | Manajemen sekolah, audit log        |

---

## Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_APP_URL=https://exam.example.com
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_POWERSYNC_URL=https://sync.example.com
NEXT_PUBLIC_MINIO_ENDPOINT=minio.example.com
NEXT_PUBLIC_TENANT_DOMAIN=exam.example.com

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

DATABASE_URL=postgresql://user:pass@pgbouncer:5432/exam_db
DATABASE_DIRECT_URL=postgresql://user:pass@postgres:5432/exam_db

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ENCRYPTION_KEY=

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
- [ ] PostgreSQL RLS diaktifkan dan diverifikasi per tenant
- [ ] PgBouncer mode transaction pooling
- [ ] Redis Sentinel atau Cluster
- [ ] MinIO bucket policy private; akses hanya via presigned URL
- [ ] Subdomain wildcard `*.exam.example.com` diarahkan ke server yang sama
- [ ] Backup otomatis PostgreSQL terjadwal dan restore diverifikasi

### Backend
- [ ] Sentry DSN dikonfigurasi; test error terkirim
- [ ] Health check diverifikasi load balancer
- [ ] Rate limiter diuji di staging sebelum production
- [ ] Semua secret di env variable, tidak ada di source code
- [ ] Docker image di-scan dengan Trivy sebelum push ke registry
- [ ] `prisma migrate deploy` otomatis di pipeline CI/CD

### Frontend
- [ ] `next-safe` CSP tidak memblokir Web Crypto atau PowerSync
- [ ] Service Worker PowerSync tidak konflik dengan cache Next.js
- [ ] Auto-save diuji pada kondisi IndexedDB hampir penuh
- [ ] Recording diuji pada Android low-end (RAM 2–3 GB)
- [ ] Offline flow end-to-end: download → airplane mode → ujian → sync

### Quality Gate
- [ ] Playwright E2E lulus di staging (termasuk skenario offline via mock service worker)
- [ ] Semua env variable production tidak mengandung nilai development/staging













---










saya sudah menyelesaikan BE saya:
dan sekarang saya sedang membangun FE:
apa yang perlu kamu pelajari lagi untuk menyempurnakan project fe saya:
berikan saya full final kode pergrup

----
