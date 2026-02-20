# Exam Backend API

RESTful API untuk sistem ujian sekolah dan madrasah dengan arsitektur **offline-first** dan **multi-tenant**.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | NestJS 10, TypeScript 5 (strict mode) |
| ORM & Database | Prisma 5, PostgreSQL 16, PgBouncer (transaction mode, port 6432) |
| Cache & Queue | Redis 7 (ioredis), BullMQ 5 |
| Real-time | Socket.IO 4 (`/monitoring` namespace) |
| Auth | JWT (passport-jwt), refresh token rotation, bcrypt |
| Security | helmet, @nestjs/throttler, AES-256-GCM (enkripsi soal) |
| Storage | MinIO (S3-compatible, presigned URL, private bucket) |
| Media | Sharp (kompresi gambar), fluent-ffmpeg, Puppeteer (PDF), ExcelJS |
| Monitoring | Winston + DailyRotateFile, Sentry (@sentry/node), @nestjs/terminus |
| Docs | Swagger / OpenAPI (`/docs`, non-production only) |
| Scheduler | @nestjs/schedule (cleanup stale chunks) |
| Events | @nestjs/event-emitter (domain events antar modul) |
| Testing | Jest, Playwright, k6 |

---

## Arsitektur Sistem

```
Client (Offline-capable PWA)
         │
         ▼
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

## Struktur Direktori

```
exam-backend/
├── src/
│   ├── app.module.ts              # Root module, guards & interceptors global
│   ├── main.ts                    # Bootstrap, Swagger (/docs), global pipes
│   ├── common/
│   │   ├── decorators/            # @CurrentUser, @TenantId, @Roles, @UseIdempotency, @ThrottleTier, @Public
│   │   ├── dto/                   # PaginationDto, BaseQueryDto, PaginatedResponseDto
│   │   ├── enums/                 # UserRole, QuestionType, ExamStatus, GradingStatus, SyncStatus
│   │   ├── exceptions/            # DeviceLocked, ExamNotAvailable, IdempotencyConflict, TenantNotFound
│   │   ├── filters/               # AllExceptionsFilter, HttpExceptionFilter
│   │   ├── guards/                # TenantGuard, CustomThrottlerGuard
│   │   ├── interceptors/          # Idempotency, Logging, Tenant, Timeout, Transform
│   │   ├── middleware/            # SubdomainMiddleware, LoggerMiddleware, PerformanceMiddleware
│   │   ├── pipes/                 # AppValidationPipe, ParseIntPipe
│   │   ├── providers/             # RedisProvider (ioredis)
│   │   ├── services/              # EmailService (nodemailer), SentryService
│   │   └── utils/                 # checksum, encryption (AES-GCM), device-fingerprint, randomizer, similarity
│   ├── config/                    # app, jwt, database, redis, minio, bullmq, throttler, smtp, sentry, multer
│   ├── modules/
│   │   ├── auth/                  # login, refresh, logout; guards: DeviceGuard, JwtAuthGuard, RolesGuard
│   │   ├── users/                 # CRUD user, device lock/unlock
│   │   ├── tenants/               # multi-tenant management (SUPERADMIN only)
│   │   ├── subjects/              # mata pelajaran per tenant
│   │   ├── questions/             # 6 tipe soal + bulk import + statistik
│   │   ├── question-tags/         # tag soal per tenant
│   │   ├── exam-packages/         # paket ujian + item analysis + ExamPackageBuilder
│   │   ├── exam-rooms/            # ruang ujian
│   │   ├── sessions/              # sesi ujian, assign peserta, aktivasi, session-monitoring
│   │   ├── submissions/           # download paket, submit jawaban/ujian, auto-grade, ExamDownload
│   │   ├── grading/               # manual grading, complete grading, publish hasil
│   │   ├── sync/                  # sync queue, chunked upload, PowerSync endpoint, scheduler
│   │   ├── media/                 # upload, presigned URL, kompresi via BullMQ (Sharp + ffmpeg)
│   │   ├── monitoring/            # Socket.IO gateway (/monitoring), live status peserta
│   │   ├── activity-logs/         # log aktivitas siswa (tab blur, paste, idle)
│   │   ├── audit-logs/            # append-only audit trail + @Audit decorator + AuditInterceptor
│   │   ├── analytics/             # dashboard summary, analitik sesi
│   │   ├── reports/               # export PDF (Puppeteer) / Excel (ExcelJS) via BullMQ → MinIO
│   │   ├── notifications/         # notifikasi in-app, BullMQ processor
│   │   └── health/                # @nestjs/terminus health check (Prisma ping)
│   └── prisma/
│       ├── prisma.service.ts      # PrismaClient + forTenant() + withTenantContext()
│       ├── seeds/                 # 01-tenants, 02-users, 03-subjects
│       └── factories/             # exam-package, question, user (testing)
├── prisma/
│   ├── schema.prisma
│   └── migrations/rls/enable_rls.sql
├── test/
│   ├── e2e/                       # auth, student-exam-flow, grading, offline-sync
│   ├── integration/               # database (tenant isolation, idempotency), minio, redis
│   ├── load/                      # k6: concurrent-submission, exam-download, sync-stress
│   └── unit/                      # auth, grading, submissions, sync, throttler
├── scripts/
│   ├── backup.sh / restore.sh
│   ├── cleanup-media.sh           # hapus media orphan di MinIO (>7 hari, tidak ada di DB)
│   ├── rotate-keys.ts             # re-enkripsi correctAnswer dengan ENCRYPTION_KEY baru
│   └── seed.sh
├── docs/architecture/             # database-schema, offline-sync-flow, security-model, system-design
├── Dockerfile
├── docker-compose.yml             # services: api, postgres, pgbouncer, redis, minio
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
| `submission` | `timeout-attempt` | Force-submit saat durasi ujian habis |
| `sync` | `process` | Proses batch item dari syncQueue offline |
| `media` | `compress-image` | Kompresi gambar via Sharp |
| `media` | `transcode-video` | Transcode video jawaban via ffmpeg |
| `report` | `generate` | Generate PDF (Puppeteer) / Excel (ExcelJS) → MinIO → presigned URL |
| `notification` | `send-realtime` | Broadcast event ke Socket.IO |

---

## API Endpoints

| Module | Prefix | Role yang diizinkan |
|--------|--------|---------------------|
| Auth | `/api/auth` | Public (login), JWT (logout, change-password) |
| Tenants | `/api/tenants` | SUPERADMIN |
| Users | `/api/users` | ADMIN, SUPERADMIN |
| Device Management | `/api/devices` | ADMIN, OPERATOR |
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
| Media | `/api/media` | JWT (semua role) |
| Monitoring | `/api/monitoring` | SUPERVISOR, OPERATOR, ADMIN |
| Activity Logs | `/api/activity-logs` | JWT (semua role) |
| Audit Logs | `/api/audit-logs` | SUPERADMIN, ADMIN |
| Analytics | `/api/analytics` | TEACHER, ADMIN, SUPERADMIN |
| Reports | `/api/reports` | OPERATOR, ADMIN |
| Health | `/api/health` | Public |

Swagger UI tersedia di `/docs` (non-production only).

---

## Alur Kritis — Siswa (Offline Flow)

```
Login → DeviceGuard (fingerprint check)
→ POST /api/student/download (tokenCode + idempotencyKey)
→ Server: validasi sesi ACTIVE, waktu valid, tokenCode cocok
→ Server: upsert ExamAttempt (idempoten), schedule timeout via BullMQ
→ Client: simpan paket terenkripsi ke IndexedDB (Dexie)
→ Client: dekripsi di memori (Web Crypto AES-256-GCM)
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

| Layer | Mekanisme |
|-------|-----------|
| Transport | HTTPS + Helmet (CSP, HSTS) |
| Auth | JWT access (15m) + refresh (7d) dengan rotation; `refresh_token` di httpOnly cookie |
| Tenant isolation | `tenantId` wajib di setiap Prisma query; RLS PostgreSQL sebagai safety net |
| RBAC | RolesGuard — 6 role: SUPERADMIN > ADMIN > TEACHER > OPERATOR > SUPERVISOR > STUDENT |
| Device | DeviceGuard — fingerprint SHA-256, bisa di-lock per perangkat oleh ADMIN/OPERATOR |
| Enkripsi soal | `correctAnswer` disimpan AES-256-GCM; `ENCRYPTION_KEY` tidak pernah ke client |
| Idempotency | Unique constraint `idempotencyKey` di `ExamAttempt` dan `ExamAnswer` |
| Rate limiting | `CustomThrottlerGuard` — STRICT (5/60s), MODERATE (30/60s), RELAXED (120/60s) |
| Audit | Tabel `audit_logs` append-only — login, start exam, submit, grade, publish |
| Presigned URL | Semua aset media via signed URL MinIO dengan TTL terbatas (`MINIO_PRESIGNED_TTL`) |

### Multi-Tenant via Subdomain

`SubdomainMiddleware` meng-resolve `tenantId` dari subdomain request:

```
smkn1.exam.app → tenant.subdomain = 'smkn1' → tenantId = 'cuid...'
```

Untuk akses via IP langsung (SUPERADMIN), `tenantId` diambil dari JWT payload.

### Rotasi Encryption Key

```bash
OLD_KEY=<64hex> NEW_KEY=<64hex> ts-node scripts/rotate-keys.ts
# Setelah 0 kegagalan: update ENCRYPTION_KEY di .env dan restart API
```

### Socket.IO Monitoring

```javascript
const socket = io('https://api.yourdomain.com/monitoring', {
  auth: { token: accessToken }
});
socket.emit('join-session', { sessionId: 'sess-abc' });
socket.on('student-update', (data) => { /* live status */ });
socket.on('activity-log', (log) => { /* tab blur, paste, idle */ });
```

### PowerSync Batch Endpoint

```json
POST /api/powersync/data
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

# Email (kosongkan untuk disable)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@exam.app
```

---

## Database

```bash
npm run db:generate      # generate Prisma client
npm run db:migrate:dev   # jalankan migrasi (dev)
npm run db:rls           # aktifkan PostgreSQL RLS
npm run db:seed          # seed data awal (tenant, users, subjects)
```

## Development

```bash
npm run start:dev        # watch mode
npm run start:debug      # debug mode
npm run build && npm run start:prod
```

## Docker Compose

```bash
docker compose up -d
# services: api, postgres, pgbouncer, redis, minio
```

---

## Testing

```bash
npm test                 # unit tests
npm run test:watch       # watch mode
npm run test:cov         # coverage
npm run test:e2e         # E2E (butuh DB + Redis)

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

## Scripts Utilitas

| Script | Deskripsi |
|--------|-----------|
| `scripts/backup.sh` | Backup PostgreSQL ke file |
| `scripts/restore.sh` | Restore dari backup |
| `scripts/cleanup-media.sh` | Hapus media orphan dari MinIO (>7 hari, tidak ada di DB) |
| `scripts/rotate-keys.ts` | Rotasi `ENCRYPTION_KEY` — re-enkripsi semua `correctAnswer` |
| `scripts/seed.sh` | Jalankan seed database |

---

## Production Checklist

- [ ] `ENCRYPTION_KEY` — 64 hex chars (`openssl rand -hex 32`), bukan default
- [ ] `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET` — min 32 chars, random, berbeda
- [ ] `DATABASE_URL` → PgBouncer (port 6432, transaction mode)
- [ ] `DATABASE_DIRECT_URL` → Postgres langsung (port 5432, hanya untuk migrasi)
- [ ] MinIO bucket policy: **private**; credentials bukan default
- [ ] `REDIS_PASSWORD` diset
- [ ] `SENTRY_DSN` dikonfigurasi; test error terkirim
- [ ] `npm run db:migrate` dan `npm run db:rls` dijalankan
- [ ] `NODE_ENV=production` di-set (disable Swagger, enable file log rotation)
- [ ] Health check `GET /api/health` diverifikasi oleh load balancer
- [ ] Backup PostgreSQL terjadwal dan restore diverifikasi
