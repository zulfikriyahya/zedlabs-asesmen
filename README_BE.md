# Exam Backend API

RESTful API untuk sistem ujian sekolah dan madrasah dengan arsitektur offline-first dan multi-tenant.

---

## Tech Stack

| Layer         | Teknologi                                 |
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

---

## Architecture Overview

```
Client (Offline-capable PWA)
        │
        ▼
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

## Security Model

| Layer              | Mekanisme                                                                                   |
|--------------------|--------------------------------------------------------------------------------------------|
| Multi-tenant       | `tenantId` wajib di setiap query Prisma; RLS PostgreSQL sebagai safety net lapis kedua     |
| Presigned URL      | Semua aset media via signed URL MinIO dengan TTL terbatas; bucket tidak pernah expose publik|
| Idempotency        | Submission ujian menggunakan idempotency key yang divalidasi sebelum masuk antrian          |
| Audit log          | Tabel append-only: mulai ujian, submit jawaban, perubahan nilai, akses admin                |
| Refresh token      | Rotation setiap refresh; token lama di-invalidate di Redis                                 |
| Device locking     | Fingerprint diverifikasi saat download dan sync; perangkat tidak terdaftar ditolak         |

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

## Environment Variables

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

BULLMQ_CONCURRENCY=10

MAX_FILE_SIZE=1073741824
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/webm
ALLOWED_VIDEO_TYPES=video/mp4,video/webm
```

---

## Testing

```bash
# Unit test
npx jest

# Unit test watch
npx jest --watch

# E2E test
npx jest --config jest-e2e.json

# Load test (k6)
k6 run test/load/concurrent-submission.k6.js
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
- [ ] `prisma migrate deploy` berjalan otomatis di pipeline CI/CD
- [ ] Playwright E2E lulus di staging sebelum deploy ke production
