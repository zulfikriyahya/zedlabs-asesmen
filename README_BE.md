# Exam Backend API

RESTful API untuk sistem asesmen dan ujian sekolah serta madrasah dengan arsitektur offline-first dan multi-tenant.

---

## Features

### Core System
- Multi-tenant dengan Row-Level Security (RLS) PostgreSQL
- Offline-first: download paket soal → ujian offline → sinkronisasi
- Idempotency key pada setiap submission untuk mencegah duplikasi data
- Audit log immutable untuk setiap aksi sensitif

### Autentikasi & Otorisasi
- JWT dengan refresh token rotation
- Role-Based Access Control (RBAC)
- Device fingerprinting dan device locking
- Rate limiting per endpoint via `@nestjs/throttler`
- HTTP security headers via `helmet`

### Soal & Ujian
- 6 tipe soal (pilihan ganda, benar/salah, menjodohkan, isian, uraian, dan multimedia)
- Dukungan multimedia: gambar, audio, video (penyimpanan via MinIO, akses via presigned URL)
- Perekaman jawaban audio/video langsung dari perangkat peserta
- Auto-grading untuk soal objektif
- Manual grading untuk soal uraian/esai

### Sinkronisasi & Real-time
- Sync queue dengan retry mechanism dan dead letter queue (BullMQ)
- Real-time monitoring ujian via Socket.IO
- Health check endpoint (`@nestjs/terminus`) untuk load balancer

### Analitik & Pelaporan
- Item analysis dan statistik ujian
- Ekspor laporan ke Excel (ExcelJS) dan PDF (Puppeteer)
- Deteksi kemiripan jawaban esai (string-similarity)

### Observabilitas
- Structured logging via Winston
- Error tracking via Sentry
- API documentation via Swagger

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | NestJS, TypeScript |
| Database | PostgreSQL, Prisma ORM, PgBouncer |
| Cache & Queue | Redis (Sentinel/Cluster), BullMQ |
| Real-time | Socket.IO |
| Storage | MinIO (S3-compatible, presigned URL) |
| Auth | JWT, Passport, `@nestjs/throttler`, helmet |
| Media | Sharp, fluent-ffmpeg, Puppeteer, ExcelJS |
| Monitoring | Winston, Sentry, `@nestjs/terminus` |
| Utility | date-fns-tz, string-similarity, Zod |

---

## Architecture Overview

```
Client (Offline-capable)
        │
        ▼
   Nginx / Caddy  ←── TLS termination, rate limiting
        │
        ▼
  NestJS API Server
   ├── Auth Module       (JWT, RBAC, device lock)
   ├── Exam Module       (paket soal, sesi ujian)
   ├── Submission Module (idempotency, auto-grade)
   ├── Sync Module       (BullMQ, dead letter queue)
   ├── Media Module      (MinIO, presigned URL)
   ├── Analytics Module  (item analysis, laporan)
   └── Health Module     (@nestjs/terminus)
        │
        ├── PostgreSQL (RLS enabled) ←── PgBouncer
        ├── Redis Sentinel/Cluster
        └── MinIO
```

---

## Security Model

- **Multi-tenant isolation** — Setiap query Prisma wajib menyertakan `tenantId`. RLS PostgreSQL sebagai safety net lapis kedua.
- **Presigned URL** — Semua aset media diakses via signed URL dengan TTL terbatas, tidak pernah expose bucket langsung.
- **Idempotency** — Submission ujian menggunakan idempotency key yang divalidasi backend sebelum diproses antrian.
- **Audit log** — Tabel append-only untuk aksi: mulai ujian, submit jawaban, perubahan nilai, dan akses admin.
- **Refresh token rotation** — Token lama di-invalidate di Redis setiap kali refresh dilakukan.

---

## Environment Variables

```env
# App
NODE_ENV=production
PORT=3000
APP_URL=https://api.example.com

# Database
DATABASE_URL=postgresql://user:pass@pgbouncer:5432/exam_db
DATABASE_DIRECT_URL=postgresql://user:pass@postgres:5432/exam_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# MinIO
MINIO_ENDPOINT=
MINIO_PORT=9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=exam-assets
MINIO_PRESIGNED_TTL=3600

# Sentry
SENTRY_DSN=

# Throttler
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## API Modules

| Module | Endpoint Prefix | Deskripsi |
|---|---|---|
| Auth | `/auth` | Login, refresh token, logout |
| Tenant | `/tenants` | Manajemen institusi |
| Users | `/users` | Manajemen pengguna dan role |
| Exam Packages | `/exam-packages` | Pembuatan dan pengelolaan paket soal |
| Questions | `/questions` | CRUD soal dengan 6 tipe |
| Sessions | `/sessions` | Sesi ujian dan peserta |
| Submissions | `/submissions` | Pengiriman jawaban dengan idempotency |
| Sync | `/sync` | Endpoint sinkronisasi offline |
| Grading | `/grading` | Auto dan manual grading |
| Analytics | `/analytics` | Item analysis dan statistik |
| Reports | `/reports` | Ekspor Excel dan PDF |
| Media | `/media` | Upload dan presigned URL |
| Health | `/health` | Health check untuk load balancer |

---

## Queue Jobs (BullMQ)

| Queue | Job | Deskripsi |
|---|---|---|
| `submission` | `process-submission` | Validasi dan simpan jawaban |
| `submission` | `auto-grade` | Penilaian otomatis soal objektif |
| `sync` | `process-sync-batch` | Proses batch sinkronisasi offline |
| `media` | `transcode-video` | Transcode video jawaban |
| `media` | `compress-image` | Kompresi gambar soal |
| `report` | `generate-pdf` | Generate laporan PDF via Puppeteer |
| `report` | `generate-excel` | Generate laporan Excel via ExcelJS |
| `notification` | `send-realtime` | Kirim event ke Socket.IO |

Semua queue dikonfigurasi dengan dead letter queue dan `removeOnFail: false`.

---

## Testing

```bash
# Unit test
jest

# E2E test
jest --config jest-e2e.json

# Load test (k6)
k6 run tests/load/submission.js
```

---

## Deployment Checklist

- [ ] PostgreSQL RLS diaktifkan dan diverifikasi per tenant
- [ ] PgBouncer dikonfigurasi dalam mode transaction pooling
- [ ] Redis berjalan dalam mode Sentinel atau Cluster
- [ ] MinIO bucket policy: private, akses hanya via presigned URL
- [ ] Backup otomatis PostgreSQL terjadwal dan restore diverifikasi
- [ ] Sentry DSN dikonfigurasi dan test error terkirim
- [ ] Health check endpoint diverifikasi oleh load balancer
- [ ] Rate limiter diuji di staging sebelum production
- [ ] Semua secret di environment variable, tidak ada di source code
- [ ] Docker image di-scan dengan Trivy sebelum push ke registry
- [ ] Prisma migrate deploy berjalan otomatis di pipeline CI/CD
- [ ] Playwright E2E lulus di staging sebelum deploy ke production
