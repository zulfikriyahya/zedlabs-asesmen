# Exam Backend API

RESTful API untuk sistem ujian sekolah dan madrasah dengan arsitektur **offline-first** dan **multi-tenant**.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | NestJS 10, TypeScript 5 (strict mode) |
| ORM & Database | Prisma 5, PostgreSQL 16, PgBouncer (transaction mode) |
| Cache & Queue | Redis 7 (ioredis), BullMQ 5 |
| Real-time | Socket.IO 4 (`/monitoring` namespace) |
| Auth | JWT (passport-jwt), refresh token rotation, bcrypt |
| Security | helmet, @nestjs/throttler, AES-256-GCM (enkripsi soal) |
| Storage | MinIO (S3-compatible, presigned URL) |
| Media | Sharp (kompresi gambar), fluent-ffmpeg, Puppeteer (PDF), ExcelJS |
| Monitoring | Winston + DailyRotateFile, Sentry (@sentry/node), @nestjs/terminus |
| Docs | Swagger / OpenAPI (`/docs`) |
| Scheduler | @nestjs/schedule (cleanup stale chunks) |
| Events | @nestjs/event-emitter (domain events antar modul) |

---

## Arsitektur Sistem

```
Client (Offline-capable PWA / Mobile)
         │
         ▼
   Nginx / Caddy  ←── TLS, rate limiting
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

## Struktur Direktori

```
exam-backend/
├── src/
│   ├── app.module.ts              # Root module, guards & interceptors global
│   ├── main.ts                    # Bootstrap, Swagger, global pipes
│   ├── common/
│   │   ├── decorators/            # @CurrentUser, @TenantId, @Roles, @UseIdempotency
│   │   ├── dto/                   # PaginationDto, BaseQueryDto, PaginatedResponseDto
│   │   ├── enums/                 # UserRole, QuestionType, SessionStatus, GradingStatus, dll.
│   │   ├── exceptions/            # DeviceLocked, ExamNotAvailable, TenantNotFound, dll.
│   │   ├── filters/               # AllExceptionsFilter, HttpExceptionFilter
│   │   ├── guards/                # TenantGuard, CustomThrottlerGuard
│   │   ├── interceptors/          # Idempotency, Logging, Tenant, Timeout, Transform
│   │   ├── middleware/            # SubdomainMiddleware, LoggerMiddleware, PerformanceMiddleware
│   │   ├── pipes/                 # AppValidationPipe, ParseIntPipe
│   │   ├── services/              # EmailService (nodemailer), SentryService
│   │   └── utils/                 # checksum, encryption (AES-GCM), device-fingerprint, randomizer
│   ├── config/                    # app, jwt, database, redis, minio, bullmq, throttler, smtp
│   ├── modules/
│   │   ├── auth/                  # login, refresh, logout, change-password
│   │   ├── users/                 # CRUD user, device management (lock/unlock)
│   │   ├── tenants/               # manajemen multi-tenant (SUPERADMIN only)
│   │   ├── subjects/              # mata pelajaran per tenant
│   │   ├── questions/             # soal 6 tipe + bulk import + statistik
│   │   ├── question-tags/         # tag soal per tenant
│   │   ├── exam-packages/         # paket ujian + item analysis
│   │   ├── exam-rooms/            # ruang ujian
│   │   ├── sessions/              # sesi ujian, assign peserta, aktivasi
│   │   ├── submissions/           # download, submit jawaban, submit ujian, auto-grade
│   │   ├── grading/               # manual grading, complete grading, publish hasil
│   │   ├── sync/                  # sync queue, chunked upload, PowerSync endpoint
│   │   ├── media/                 # upload, presigned URL, kompresi (BullMQ)
│   │   ├── monitoring/            # Socket.IO gateway, live status peserta
│   │   ├── activity-logs/         # log aktivitas siswa (tab blur, paste, idle)
│   │   ├── audit-logs/            # append-only audit trail aksi sensitif
│   │   ├── analytics/             # dashboard summary, analitik sesi
│   │   ├── reports/               # export PDF/Excel via BullMQ + MinIO
│   │   ├── notifications/         # notifikasi in-app per user
│   │   └── health/                # health check (Prisma ping)
│   └── prisma/
│       ├── prisma.service.ts      # PrismaClient + forTenant() + withTenantContext()
│       ├── seeds/                 # 01-tenants, 02-users, 03-subjects
│       └── factories/             # exam-package, question, user factories (testing)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       └── rls/enable_rls.sql
├── test/
│   ├── e2e/                       # auth, student-exam-flow, grading, offline-sync
│   ├── integration/               # database, minio, redis
│   ├── load/                      # k6: concurrent-submission, exam-download, sync-stress
│   └── unit/                      # auth, grading, submissions, sync
├── scripts/
│   ├── backup.sh / restore.sh
│   ├── cleanup-media.sh
│   ├── rotate-keys.ts             # re-enkripsi correctAnswer dengan key baru
│   └── seed.sh
├── docs/architecture/             # database-schema, offline-sync-flow, security-model
├── Dockerfile
├── docker-compose.yml
└── ecosystem.config.js            # PM2 cluster config
```

---

## Prisma Schema — Model Utama & Relasi

```
Tenant
 └── User → RefreshToken, UserDevice
 └── Subject → Question (6 tipe) → ExamPackageQuestion
 └── QuestionTag → QuestionTagMapping
 └── ExamPackage → ExamPackageQuestion
                 → ExamSession → SessionStudent (tokenCode unik)
                               → ExamAttempt (idempotencyKey unique)
                                   → ExamAnswer  (idempotencyKey unique)
                                   → ExamActivityLog
                                   → SyncQueue
 └── AuditLog (append-only)
 └── Notification
```

---

## Queue Jobs (BullMQ)

Semua queue dikonfigurasi dengan **dead letter queue** dan `removeOnFail: false`.

| Queue | Job | Deskripsi |
|-------|-----|-----------|
| `submission` | `auto-grade` | Penilaian otomatis soal objektif setelah submit |
| `submission` | `timeout-attempt` | Timeout attempt saat durasi ujian habis |
| `sync` | `process` | Proses batch item dari syncQueue offline |
| `media` | `compress-image` | Kompresi gambar via Sharp |
| `media` | `transcode-video` | Transcode video jawaban via ffmpeg |
| `report` | `generate` | Generate Excel (ExcelJS) / PDF (Puppeteer) → MinIO |
| `notification` | `send-realtime` | Broadcast event ke Socket.IO |

---

## API Endpoints

| Module | Prefix | Role yang diizinkan |
|--------|--------|---------------------|
| Auth | `/api/auth` | Public (login), JWT (logout, change-password) |
| Tenants | `/api/tenants` | SUPERADMIN |
| Users | `/api/users` | ADMIN, SUPERADMIN |
| Device Management | `/api/devices` | ADMIN, OPERATOR (lock/unlock) |
| Subjects | `/api/subjects` | TEACHER, ADMIN |
| Questions | `/api/questions` | TEACHER, ADMIN |
| Question Tags | `/api/question-tags` | TEACHER, ADMIN |
| Exam Packages | `/api/exam-packages` | TEACHER, ADMIN |
| Exam Rooms | `/api/exam-rooms` | OPERATOR, ADMIN |
| Sessions | `/api/sessions` | OPERATOR, ADMIN |
| Student Exam | `/api/student` | STUDENT (+ DeviceGuard) |
| Submissions | `/api/submissions` | TEACHER, ADMIN, OPERATOR |
| Grading | `/api/grading` | TEACHER, ADMIN |
| Sync | `/api/sync` | STUDENT (JWT) |
| PowerSync | `/api/powersync` | STUDENT (JWT) |
| Media | `/api/media` | JWT |
| Monitoring | `/api/monitoring` | SUPERVISOR, OPERATOR, ADMIN |
| Activity Logs | `/api/activity-logs` | JWT |
| Audit Logs | `/api/audit-logs` | SUPERADMIN, ADMIN |
| Analytics | `/api/analytics` | TEACHER, ADMIN, SUPERADMIN |
| Reports | `/api/reports` | OPERATOR, ADMIN |
| Health | `/api/health` | Public |

Swagger UI tersedia di `/docs` (hanya di non-production).

---

## Alur Kritis — Siswa (Offline Flow)

```
Login → DeviceGuard (fingerprint check)
  → POST /api/student/download (tokenCode + idempotencyKey)
  → Server: validasi sesi ACTIVE, waktu valid, tokenCode cocok
  → Server: upsert ExamAttempt (idempoten), schedule timeout via BullMQ
  → Client: simpan paket terenkripsi ke IndexedDB (Dexie)
  → Client: dekripsi di memori (Web Crypto AES-GCM)
  → Kerjakan soal → auto-save debounce → Dexie.answers
  → POST /api/student/answers (upsert via idempotencyKey)
  → POST /api/student/submit
  → BullMQ: auto-grade → GradingHelperService
  → Jika ada essay: gradingStatus = MANUAL_REQUIRED
  → Guru grade manual → POST /api/grading/answer
  → POST /api/grading/complete → POST /api/grading/publish
  → GET /api/student/result/:attemptId
```

---

## Model Keamanan

### Defence in Depth

| Layer | Mekanisme |
|-------|-----------|
| Transport | HTTPS + Helmet (CSP, HSTS, dll.) |
| Auth | JWT access (15m) + refresh (7d) dengan rotation |
| Tenant isolation | `tenantId` wajib di setiap Prisma query |
| RLS | PostgreSQL Row-Level Security sebagai safety net |
| RBAC | RolesGuard — 6 role: SUPERADMIN > ADMIN > TEACHER > OPERATOR > SUPERVISOR > STUDENT |
| Device | DeviceGuard — fingerprint hash (SHA-256), bisa di-lock per perangkat |
| Enkripsi soal | `correctAnswer` disimpan AES-256-GCM; key tidak pernah ke client |
| Idempotency | Unique constraint `idempotencyKey` di `ExamAttempt` dan `ExamAnswer` |
| Rate limiting | `CustomThrottlerGuard` — tier: STRICT (5/60s), MODERATE (30/60s), RELAXED (120/60s) |
| Audit | Tabel `audit_logs` append-only — login, start exam, submit, grade, publish |

### Enkripsi Paket Soal

```
Server: correctAnswer → AES-256-GCM → disimpan di DB
  key = ENCRYPTION_KEY (env, tidak pernah ke client)

Client: paket diterima via HTTPS → dekripsi di memori (Web Crypto API)
  key session hanya hidup selama tab aktif
  TIDAK pernah masuk Zustand persist / localStorage / IndexedDB
```

---

## Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://api.yourdomain.com
API_PREFIX=api

# Database
DATABASE_URL=postgresql://user:pass@pgbouncer:6432/exam_db
DATABASE_DIRECT_URL=postgresql://user:pass@postgres:5432/exam_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (min 32 chars, random, beda satu sama lain)
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

# Enkripsi soal (64 hex chars = 32 bytes)
# Generate: openssl rand -hex 32
ENCRYPTION_KEY=

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=exam-assets
MINIO_PRESIGNED_TTL=3600

# BullMQ
BULLMQ_CONCURRENCY=10

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# File Upload
MAX_FILE_SIZE=1073741824
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/webm
ALLOWED_VIDEO_TYPES=video/mp4,video/webm

# Monitoring
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1

# Email Notification (kosongkan untuk disable)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@exam.app
```

---

## Setup & Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Redis 7
- MinIO (atau S3-compatible storage)

### Instalasi

```bash
npm install
cp .env.example .env
# Edit .env sesuai environment lokal
```

### Database

```bash
# Generate Prisma client
npm run db:generate

# Jalankan migrasi (dev)
npm run db:migrate:dev

# Aktifkan PostgreSQL RLS
npm run db:rls

# Seed data awal (tenant, users, subjects)
npm run db:seed
```

### Menjalankan API

```bash
# Development (watch mode)
npm run start:dev

# Debug mode
npm run start:debug

# Production
npm run build
npm run start:prod
```

### Docker Compose (Full Stack)

```bash
docker compose up -d
# Services: api, postgres, pgbouncer, redis, minio
```

---

## Testing

```bash
# Unit tests
npm test

# Unit tests (watch)
npm run test:watch

# Coverage
npm run test:cov

# E2E tests (butuh DB + Redis)
npm run test:e2e

# Load test (butuh k6)
k6 run test/load/exam-download.k6.js
k6 run test/load/concurrent-submission.k6.js
k6 run test/load/sync-stress.k6.js
```

### Cakupan Test

| Kategori | File |
|----------|------|
| Unit | `auth.service`, `auto-grading.service`, `exam-submission.service`, `exam-download.service`, `grading-helper.service`, `submission.processor`, `chunked-upload.service`, `sync.service`, `throttler.guard` |
| Integration | `database` (tenant isolation, idempotency), `minio` (upload, presigned URL), `redis` (TTL, SETNX) |
| E2E | `auth`, `student-exam-flow` (download → submit), `grading` (manual → publish), `offline-sync` (queue, retry, chunked upload) |
| Load (k6) | Concurrent exam download (100 VU), sync stress (burst reconnect), concurrent submission |

---

## Deployment

### PM2 (Cluster Mode)

```bash
npm run build
pm2 start ecosystem.config.js
```

### Production Checklist

- [ ] `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET` — min 32 chars, random, berbeda
- [ ] `ENCRYPTION_KEY` — 64 hex chars (`openssl rand -hex 32`), bukan default
- [ ] `DATABASE_URL` → PgBouncer (port 6432, transaction mode)
- [ ] `DATABASE_DIRECT_URL` → Postgres langsung (port 5432, hanya untuk migrasi)
- [ ] MinIO credentials diganti dari default, bucket policy: **private**
- [ ] `REDIS_PASSWORD` diset
- [ ] `SENTRY_DSN` diset untuk error tracking
- [ ] `npm run db:migrate` dan `npm run db:rls` dijalankan
- [ ] Backup PostgreSQL terjadwal dan restore diverifikasi
- [ ] Health check `GET /api/health` diverifikasi oleh load balancer
- [ ] `NODE_ENV=production` di-set (disable Swagger, enable file log rotation)

### Rotasi Encryption Key

```bash
# Re-enkripsi semua correctAnswer dengan key baru
OLD_KEY=<64hex> NEW_KEY=<64hex> ts-node scripts/rotate-keys.ts

# Setelah 0 kegagalan: update ENCRYPTION_KEY di .env dan restart API
```

---

## Scripts Utilitas

| Script | Deskripsi |
|--------|-----------|
| `scripts/backup.sh` | Backup PostgreSQL ke file |
| `scripts/restore.sh` | Restore dari backup |
| `scripts/cleanup-media.sh` | Hapus media orphan dari MinIO (>7 hari, tidak ada di DB) |
| `scripts/rotate-keys.ts` | Rotasi ENCRYPTION_KEY — re-enkripsi semua correctAnswer |
| `scripts/seed.sh` | Jalankan seed database |

---

## Konfigurasi Lanjutan

### Multi-Tenant via Subdomain

`SubdomainMiddleware` meng-resolve `tenantId` dari subdomain request:

```
smkn1.exam.app → tenant.subdomain = 'smkn1' → tenantId = 'cuid...'
```

Untuk akses via IP langsung (SUPERADMIN), `tenantId` diambil dari JWT payload.

### Socket.IO Monitoring

Supervisors / operator connect ke namespace `/monitoring`:

```javascript
const socket = io('https://api.yourdomain.com/monitoring', {
  auth: { token: accessToken }
});
socket.emit('join-session', { sessionId: 'sess-abc' });
socket.on('student-update', (data) => { /* live status */ });
socket.on('activity-log', (log) => { /* tab blur, paste, idle */ });
```

### PowerSync Endpoint

Endpoint `/api/powersync/data` menerima batch mutations dari klien PowerSync untuk offline recovery:

```json
{
  "batch": [
    {
      "type": "SUBMIT_ANSWER",
      "attemptId": "att-abc",
      "idempotencyKey": "uuid-v4",
      "payload": { "questionId": "q-1", "answer": "a" }
    }
  ]
}
```
