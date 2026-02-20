# Skills & Engineering Standards

Panduan pengerjaan untuk proyek sistem ujian offline-first multi-tenant.

---

## Prinsip Umum

### DRY (Don't Repeat Yourself)
- Ekstrak logika berulang ke fungsi, helper, custom hook, service, atau decorator.
- Gunakan abstraksi yang tepat: generic types, base class, mixin, composable.
- Satu sumber kebenaran untuk setiap pola yang muncul di lebih dari satu tempat.
- Prioritaskan keterbacaan dan maintainability di atas keringkasan yang berlebihan.

### Keamanan
- Setiap query Prisma wajib menyertakan `tenantId`; RLS PostgreSQL sebagai safety net lapis kedua.
- `correctAnswer` disimpan terenkripsi AES-256-GCM di DB; key (`ENCRYPTION_KEY`) tidak pernah dikirim ke client.
- Paket soal diterima client via HTTPS → dekripsi di memori (Web Crypto API); key session tidak pernah masuk Zustand persist, localStorage, maupun IndexedDB.
- Semua aset media diakses via presigned URL MinIO dengan TTL terbatas (`MINIO_PRESIGNED_TTL`).
- Setiap submission membawa idempotency key (unique constraint di `ExamAttempt` dan `ExamAnswer`) untuk mencegah duplikasi saat retry.
- Device fingerprint (SHA-256) divalidasi via `DeviceGuard`; perangkat bisa di-lock per user oleh OPERATOR/ADMIN.

### Arsitektur
- Backend modular NestJS 10: setiap domain (auth, exam, submission, sync, media, analytics, dll.) adalah modul terpisah.
- Database: PostgreSQL 16 via PgBouncer (transaction mode, port 6432); migrasi & Prisma Studio langsung ke port 5432.
- Cache & queue: Redis 7 (ioredis) + BullMQ 5 dengan dead letter queue; `removeOnFail: false` pada semua job kritis.
- Real-time: Socket.IO 4 di namespace `/monitoring`; event dikirim via BullMQ job `send-realtime`.
- Frontend memisahkan concern: Zustand (state in-memory), Dexie (persistensi lokal), PowerSync (sinkronisasi dua arah).
- Audit log disimpan di tabel append-only untuk aksi sensitif: login, mulai ujian, submit jawaban, perubahan nilai, akses admin.
- Multi-tenant via subdomain: `SubdomainMiddleware` meresolve `tenantId` dari subdomain; SUPERADMIN akses via `tenantId` di JWT.

---

## Konvensi Kode

### Umum
- TypeScript strict mode; tidak ada `any` kecuali benar-benar tidak bisa dihindari.
- Naming: `camelCase` variabel/fungsi, `PascalCase` class/tipe, `SCREAMING_SNAKE_CASE` konstanta.
- Zod untuk validasi di semua titik masuk data di frontend (API request, form input, data dari IndexedDB).
- Komentar dalam kode hanya untuk hal yang tidak self-explanatory.

### Frontend
- Custom hook untuk setiap logika stateful yang digunakan lebih dari satu komponen.
- Komponen soal di-lazy load per tipe (`dynamic(() => import(...))`) untuk mengurangi initial bundle.
- Auto-save menggunakan debounce, bukan interval mentah, agar tidak overwrite saat pengguna masih mengetik.

### Backend
- Guard NestJS untuk autentikasi dan otorisasi; dekorator custom (`@CurrentUser`, `@TenantId`, `@Roles`, `@UseIdempotency`) untuk ekstrak konteks dari JWT.
- DTO dengan `class-validator` untuk validasi request; response menggunakan serializer (`@Exclude`, `@Expose`).
- Service tidak boleh langsung akses `req` atau `res`; semua konteks diteruskan via parameter eksplisit.
- Error handling terpusat via `AllExceptionsFilter` dan `HttpExceptionFilter`; tidak ada `try/catch` yang hanya melakukan `console.error`.
- Rate limiting via `CustomThrottlerGuard` dengan tiga tier: `STRICT` (5/60s), `MODERATE` (30/60s), `RELAXED` (120/60s).
- Logging via Winston + DailyRotateFile; error tracking via Sentry (`@sentry/node`).

---

## Alur Aplikasi

Gunakan alur ini sebagai referensi saat mengerjakan fitur apapun — pastikan implementasi sesuai urutan dan tanggung jawab tiap layer.

### Siswa (Alur Kritis — Offline Flow)
```
Login → DeviceGuard (fingerprint check)
→ POST /api/student/download (tokenCode + idempotencyKey)
→ Server: validasi sesi ACTIVE, waktu valid, tokenCode cocok
→ Server: upsert ExamAttempt (idempoten), schedule timeout via BullMQ
→ Client: simpan paket terenkripsi ke IndexedDB (Dexie: examPackages)
→ Dekripsi di memori (lib/crypto/aes-gcm.ts, Web Crypto API)
→ Kerjakan ujian → auto-save debounce → IndexedDB (Dexie: answers)
→ POST /api/student/answers (upsert via idempotencyKey)
→ Rekam audio/video → chunked blob ke IndexedDB
→ Review jawaban (/(siswa)/ujian/[sessionId]/review)
→ POST /api/student/submit
→ BullMQ: auto-grade → GradingHelperService
→ Jika ada essay: gradingStatus = MANUAL_REQUIRED
→ Guru grade manual → POST /api/grading/answer
→ POST /api/grading/complete → POST /api/grading/publish
→ Hasil ujian (/(siswa)/ujian/[sessionId]/result)
```

**State yang terlibat:** `examStore`, `answerStore`, `syncStore`, `timerStore`
**Storage yang terlibat:** IndexedDB via Dexie (`examPackages`, `answers`, `activityLogs`, `syncQueue`)
**Catatan:** Key enkripsi hanya hidup di memori selama sesi aktif. Tidak pernah masuk ke Zustand persist, localStorage, maupun IndexedDB.

### Guru
```
Login (role: TEACHER) → Buat/import soal → Review & approve soal
→ Susun paket ujian (ExamPackage + ExamPackageQuestion)
→ Publish paket → Paket siap digunakan operator
→ Manual grading esai (GET /api/grading?status=MANUAL_REQUIRED)
→ Publish hasil → GradingStatus: PUBLISHED → siswa dapat melihat nilai
```

### Operator
```
Login (role: OPERATOR) → Buat ruang ujian (ExamRoom)
→ Buat sesi ujian (ExamSession) → assign paket + ruang + waktu
→ Import/assign peserta → generate tokenCode unik per peserta
→ Aktifkan sesi → Socket.IO broadcast → siswa bisa mulai download
→ Ekspor laporan → BullMQ: generate-excel/pdf → download via presigned URL MinIO
```

### Pengawas
```
Login (role: SUPERVISOR) → Subscribe sesi aktif via Socket.IO (/monitoring)
→ Live monitoring status peserta (/(pengawas)/monitoring/[sessionId])
→ Pantau activity log: tab blur, paste, idle
→ Log diteruskan ke AuditLog → guru/admin review post-ujian
```

---

## Struktur Proyek

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | NestJS 10, TypeScript 5 (strict mode) |
| ORM & Database | Prisma 5, PostgreSQL 16, PgBouncer (transaction mode, port 6432) |
| Cache & Queue | Redis 7 (ioredis), BullMQ 5 |
| Real-time | Socket.IO 4 (`/monitoring` namespace) |
| Auth | JWT (passport-jwt), refresh token rotation, bcrypt |
| Security | helmet, @nestjs/throttler, AES-256-GCM |
| Storage | MinIO (S3-compatible, presigned URL, private bucket) |
| Media | Sharp (kompresi gambar), fluent-ffmpeg, Puppeteer (PDF), ExcelJS |
| Monitoring | Winston + DailyRotateFile, Sentry (@sentry/node), @nestjs/terminus |
| Docs | Swagger / OpenAPI (`/docs`, non-production only) |
| Scheduler | @nestjs/schedule (cleanup stale chunks) |
| Events | @nestjs/event-emitter (domain events antar modul) |
| Frontend | Next.js, Zustand, Dexie, PowerSync |

---

### Frontend (`exam-frontend`)
```
exam-frontend/
├── next.config.ts
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── public/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/ (login, logout, refresh)
│   │   │   ├── download/
│   │   │   ├── health/
│   │   │   ├── media/
│   │   │   └── sync/
│   │   ├── (auth)/login/
│   │   ├── (guru)/          # dashboard, grading, hasil, soal, ujian
│   │   ├── (operator)/      # dashboard, laporan, peserta, ruang, sesi
│   │   ├── (pengawas)/      # dashboard, monitoring/[sessionId]
│   │   ├── (siswa)/         # dashboard, profile, ujian/[sessionId]/{review,result}
│   │   └── (superadmin)/    # audit-logs, dashboard, schools, settings, users
│   ├── components/
│   │   ├── analytics/       # DashboardStats, ExamStatistics, ItemAnalysisChart, StudentProgress
│   │   ├── auth/            # DeviceLockWarning, LoginForm
│   │   ├── exam/            # ActivityLogger, AutoSaveIndicator, ExamTimer, QuestionNavigation
│   │   │   └── question-types/  # Essay, Matching, MultipleChoice, ShortAnswer, TrueFalse
│   │   ├── grading/         # EssaySimilarityBadge, GradingRubric, ManualGradingCard
│   │   ├── layout/          # Footer, Header, MainLayout, Sidebar
│   │   ├── madrasah/        # ArabicKeyboard, HafalanRecorder, QuranDisplay, TajwidMarker
│   │   ├── monitoring/      # ActivityLogViewer, LiveMonitor, StudentProgressCard
│   │   ├── questions/       # MatchingEditor, MediaUpload, OptionsEditor, QuestionEditor, TagSelector
│   │   ├── sync/            # ChecksumValidator, DownloadProgress, SyncStatus, UploadQueue
│   │   └── ui/              # Alert, Badge, Button, Card, Confirm, Input, Modal, Table, Toast, dll.
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-auto-save.ts
│   │   ├── use-device-warnings.ts
│   │   ├── use-exam.ts
│   │   ├── use-media-recorder.ts
│   │   ├── use-online-status.ts
│   │   ├── use-powersync.ts
│   │   ├── use-sync-status.ts
│   │   ├── use-timer.ts
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api/             # client.ts + per-domain API files
│   │   ├── crypto/          # aes-gcm.ts, checksum.ts, key-manager.ts
│   │   ├── db/              # Dexie schema, migrations, queries
│   │   ├── exam/            # activity-logger, auto-save, controller, navigation, randomizer, timer
│   │   ├── media/           # chunked-upload, compress, player, recorder
│   │   ├── middleware/       # auth, role, tenant middleware
│   │   ├── offline/         # cache, checksum, download, queue, sync
│   │   └── utils/           # compression, device, error, format, logger, network, time
│   ├── middleware.ts
│   ├── schemas/             # Zod schemas: answer, auth, exam, question, sync, user
│   ├── stores/              # Zustand: activity, answer, auth, exam, sync, timer, ui
│   ├── styles/              # animations.css, arabic.css, print.css
│   ├── tests/
│   │   ├── integration/     # dexie.spec.ts, sync.spec.ts
│   │   └── unit/            # hooks, lib, stores
│   └── types/               # activity, answer, api, exam, media, question, sync, user
├── tests/e2e/               # Playwright: auth, exam-flow, grading, media-recording, offline-sync
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

### Backend (`exam-backend`)
```
exam-backend/
├── src/
│   ├── app.module.ts              # Root module, guards & interceptors global
│   ├── main.ts                    # Bootstrap, Swagger (/docs), global pipes
│   ├── common/
│   │   ├── decorators/            # @CurrentUser, @TenantId, @Roles, @UseIdempotency, @ThrottleTier, @Public
│   │   ├── dto/                   # PaginationDto, BaseQueryDto, BaseResponseDto
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
│   │   └── health/                # @nestjs/terminus health check
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

### Prisma Model Utama & Relasi
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

### Queue Jobs (BullMQ) — Semua dengan DLQ & `removeOnFail: false`
```
submission   → auto-grade           Penilaian otomatis soal objektif setelah submit
             → timeout-attempt      Force-submit saat durasi ujian habis
sync         → process              Proses batch item dari syncQueue offline
media        → compress-image       Kompresi gambar via Sharp
             → transcode-video      Transcode video jawaban via ffmpeg
report       → generate             Generate PDF (Puppeteer) / Excel (ExcelJS) → MinIO → presigned URL
notification → send-realtime        Broadcast event ke Socket.IO
```

### API Endpoints & Role
```
/api/auth            Public (login), JWT (logout, change-password)
/api/tenants         SUPERADMIN
/api/users           ADMIN, SUPERADMIN
/api/devices         ADMIN, OPERATOR
/api/subjects        TEACHER, ADMIN
/api/questions       TEACHER, ADMIN
/api/question-tags   TEACHER, ADMIN
/api/exam-packages   TEACHER, ADMIN
/api/exam-rooms      OPERATOR, ADMIN
/api/sessions        OPERATOR, ADMIN
/api/student         STUDENT (+ DeviceGuard)
/api/submissions     TEACHER, ADMIN, OPERATOR
/api/grading         TEACHER, ADMIN
/api/sync            STUDENT (JWT)
/api/powersync       STUDENT (JWT)
/api/media           JWT (semua role)
/api/monitoring      SUPERVISOR, OPERATOR, ADMIN
/api/activity-logs   JWT (semua role)
/api/audit-logs      SUPERADMIN, ADMIN
/api/analytics       TEACHER, ADMIN, SUPERADMIN
/api/reports         OPERATOR, ADMIN
/api/health          Public
```

---

## Model Keamanan

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
socket.emit('join-session', { sessionId });
socket.on('student-update', (data) => { /* live status */ });
socket.on('activity-log', (log) => { /* tab blur, paste, idle */ });
```

### PowerSync Batch Endpoint

```
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

## Format Respons AI

- Jawaban langsung pada solusi teknis tanpa pembuka panjang.
- Kode menggunakan nama variabel ringkas namun deskriptif.
- Jika ada beberapa pendekatan, tampilkan perbedaan dan trade-off secara singkat — bukan semua opsi secara panjang lebar.
- Tidak perlu menyertakan instruksi instalasi, struktur folder standar, atau penjelasan umum yang sudah diketahui senior developer, kecuali diminta secara spesifik.
- Gunakan Bahasa Indonesia untuk penjelasan, Bahasa Inggris untuk kode dan nama teknis.
- Saat mengerjakan fitur baru, selalu rujuk bagian **Alur Aplikasi** dan **Struktur Proyek** di atas untuk memastikan implementasi diletakkan di layer dan file yang tepat.
