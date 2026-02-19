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
- Paket soal dienkripsi AES-GCM via Web Crypto API; key hanya di memori selama sesi aktif, tidak pernah dipersist.
- Semua aset media diakses via presigned URL MinIO dengan TTL terbatas.
- Setiap submission membawa idempotency key untuk mencegah duplikasi saat retry.

### Arsitektur
- Backend modular NestJS: setiap domain (auth, exam, submission, sync, media, analytics) adalah modul terpisah.
- Frontend memisahkan concern: Zustand (state in-memory), Dexie (persistensi lokal), PowerSync (sinkronisasi dua arah).
- BullMQ dikonfigurasi dengan dead letter queue; `removeOnFail: false` pada semua job kritis.
- Audit log disimpan di tabel append-only untuk aksi sensitif: mulai ujian, submit jawaban, perubahan nilai, akses admin.

---

## Konvensi Kode

### Umum
- TypeScript strict mode; tidak ada `any` kecuali benar-benar tidak bisa dihindari.
- Naming: `camelCase` variabel/fungsi, `PascalCase` class/tipe, `SCREAMING_SNAKE_CASE` konstanta.
- Zod untuk validasi di semua titik masuk data: API request, form input, data dari IndexedDB.
- Komentar dalam kode hanya untuk hal yang tidak self-explanatory.

### Frontend
- Custom hook untuk setiap logika stateful yang digunakan lebih dari satu komponen.
- Komponen soal di-lazy load per tipe (`dynamic(() => import(...))`) untuk mengurangi initial bundle.
- Auto-save menggunakan debounce, bukan interval mentah, agar tidak overwrite saat pengguna masih mengetik.

### Backend
- Guard NestJS untuk autentikasi dan otorisasi; dekorator custom untuk ekstrak `tenantId` dan `userId` dari JWT.
- DTO dengan `class-validator` untuk validasi request; response menggunakan serializer (`@Exclude`, `@Expose`).
- Service tidak boleh langsung akses `req` atau `res`; semua konteks diteruskan via parameter eksplisit.
- Error handling terpusat via `ExceptionFilter`; tidak ada `try/catch` yang hanya melakukan `console.error`.

---

## Alur Aplikasi

Gunakan alur ini sebagai referensi saat mengerjakan fitur apapun — pastikan implementasi sesuai urutan dan tanggung jawab tiap layer.

### Siswa (Alur Kritis — Offline Flow)
```
Login → DeviceGuard (fingerprint) → Download paket soal terenkripsi
→ Simpan ke IndexedDB (Dexie: examPackages)
→ Dekripsi di memori (lib/crypto/aes-gcm.ts, Web Crypto API)
→ Kerjakan ujian → auto-save debounce ke IndexedDB (Dexie: answers)
→ Rekam audio/video → chunked blob ke IndexedDB
→ Review jawaban (/(siswa)/ujian/[sessionId]/review)
→ Submit → POST /submissions/submit + idempotency key
→ PowerSync push syncQueue → BullMQ: process-submission → auto-grade
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
→ Manual grading esai (GET /grading?status=MANUAL_REQUIRED)
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
Login (role: SUPERVISOR) → Subscribe sesi aktif via Socket.IO
→ Live monitoring status peserta (/(pengawas)/monitoring/[sessionId])
→ Pantau activity log: tab blur, paste, idle
→ Log diteruskan ke AuditLog → guru/admin review post-ujian
```

---

## Struktur Proyek

### Monorepo Root
```
.
├── app_flow_diagram.tsx
├── exam-backend
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── docs
│   │   ├── api
│   │   │   └── swagger.yaml
│   │   ├── architecture
│   │   │   ├── database-schema.md
│   │   │   ├── offline-sync-flow.md
│   │   │   ├── security-model.md
│   │   │   └── system-design.md
│   │   └── deployment
│   │       └── production-checklist.md
│   ├── ecosystem.config.js
│   ├── logs
│   ├── nest-cli.json
│   ├── package.json
│   ├── prisma
│   │   └── schema.prisma
│   ├── scripts
│   │   ├── backup.sh
│   │   ├── cleanup-media.sh
│   │   ├── restore.sh
│   │   ├── rotate-keys.sh
│   │   └── seed.sh
│   ├── src
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   ├── common
│   │   │   ├── decorators
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── idempotency.decorator.ts
│   │   │   │   ├── public.decorator.ts
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── tenant-id.decorator.ts
│   │   │   ├── dto
│   │   │   │   ├── base-query.dto.ts
│   │   │   │   ├── base-response.dto.ts
│   │   │   │   └── pagination.dto.ts
│   │   │   ├── entities
│   │   │   ├── enums
│   │   │   │   ├── exam-status.enum.ts
│   │   │   │   ├── grading-status.enum.ts
│   │   │   │   ├── question-type.enum.ts
│   │   │   │   ├── sync-status.enum.ts
│   │   │   │   └── user-role.enum.ts
│   │   │   ├── exceptions
│   │   │   │   ├── device-locked.exception.ts
│   │   │   │   ├── exam-not-available.exception.ts
│   │   │   │   ├── idempotency-conflict.exception.ts
│   │   │   │   └── tenant-not-found.exception.ts
│   │   │   ├── filters
│   │   │   │   ├── all-exceptions.filter.ts
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── guards
│   │   │   │   ├── tenant.guard.ts
│   │   │   │   └── throttler.guard.ts
│   │   │   ├── interceptors
│   │   │   │   ├── idempotency.interceptor.ts
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   ├── tenant.interceptor.ts
│   │   │   │   ├── timeout.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   ├── middleware
│   │   │   │   ├── logger.middleware.ts
│   │   │   │   ├── performance.middleware.ts
│   │   │   │   └── subdomain.middleware.ts
│   │   │   ├── pipes
│   │   │   │   ├── parse-int.pipe.ts
│   │   │   │   └── validation.pipe.ts
│   │   │   ├── utils
│   │   │   │   ├── checksum.util.ts
│   │   │   │   ├── device-fingerprint.util.ts
│   │   │   │   ├── encryption.util.ts
│   │   │   │   ├── file.util.ts
│   │   │   │   ├── presigned-url.util.ts
│   │   │   │   ├── randomizer.util.ts
│   │   │   │   ├── similarity.util.ts
│   │   │   │   └── time-validation.util.ts
│   │   │   └── validators
│   │   │       ├── is-tenant-exists.validator.ts
│   │   │       └── is-unique.validator.ts
│   │   ├── config
│   │   │   ├── app.config.ts
│   │   │   ├── bullmq.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   ├── minio.config.ts
│   │   │   ├── multer.config.ts
│   │   │   ├── redis.config.ts
│   │   │   └── throttler.config.ts
│   │   ├── main.ts
│   │   ├── modules
│   │   │   ├── activity-logs
│   │   │   │   ├── activity-logs.module.ts
│   │   │   │   ├── controllers
│   │   │   │   │   └── activity-logs.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   └── create-activity-log.dto.ts
│   │   │   │   └── services
│   │   │   │       └── activity-logs.service.ts
│   │   │   ├── analytics
│   │   │   │   ├── analytics.module.ts
│   │   │   │   ├── controllers
│   │   │   │   │   └── analytics.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   └── analytics-filter.dto.ts
│   │   │   │   └── services
│   │   │   │       ├── analytics.service.ts
│   │   │   │       └── dashboard.service.ts
│   │   │   ├── audit-logs
│   │   │   │   ├── audit-logs.module.ts
│   │   │   │   ├── decorators
│   │   │   │   │   └── audit.decorator.ts
│   │   │   │   └── services
│   │   │   │       └── audit-logs.service.ts
│   │   │   ├── auth
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── controllers
│   │   │   │   │   └── auth.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── change-password.dto.ts
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   └── refresh-token.dto.ts
│   │   │   │   ├── guards
│   │   │   │   │   ├── device.guard.ts
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── local-auth.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   ├── services
│   │   │   │   │   └── auth.service.ts
│   │   │   │   └── strategies
│   │   │   │       ├── jwt-refresh.strategy.ts
│   │   │   │       ├── jwt.strategy.ts
│   │   │   │       └── local.strategy.ts
│   │   │   ├── exam-packages
│   │   │   │   ├── controllers
│   │   │   │   │   └── exam-packages.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── add-questions.dto.ts
│   │   │   │   │   ├── create-exam-package.dto.ts
│   │   │   │   │   ├── publish-exam-package.dto.ts
│   │   │   │   │   └── update-exam-package.dto.ts
│   │   │   │   ├── exam-packages.module.ts
│   │   │   │   ├── interfaces
│   │   │   │   │   └── exam-package-settings.interface.ts
│   │   │   │   └── services
│   │   │   │       ├── exam-package-builder.service.ts
│   │   │   │       ├── exam-packages.service.ts
│   │   │   │       └── item-analysis.service.ts
│   │   │   ├── exam-rooms
│   │   │   │   ├── controllers
│   │   │   │   │   └── exam-rooms.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── create-room.dto.ts
│   │   │   │   │   └── update-room.dto.ts
│   │   │   │   ├── exam-rooms.module.ts
│   │   │   │   └── services
│   │   │   │       └── exam-rooms.service.ts
│   │   │   ├── grading
│   │   │   │   ├── controllers
│   │   │   │   │   └── grading.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── complete-grading.dto.ts
│   │   │   │   │   ├── grade-answer.dto.ts
│   │   │   │   │   └── publish-result.dto.ts
│   │   │   │   ├── grading.module.ts
│   │   │   │   └── services
│   │   │   │       ├── grading.service.ts
│   │   │   │       └── manual-grading.service.ts
│   │   │   ├── health
│   │   │   │   ├── controllers
│   │   │   │   │   └── health.controller.ts
│   │   │   │   └── health.module.ts
│   │   │   ├── media
│   │   │   │   ├── controllers
│   │   │   │   │   └── media.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── delete-media.dto.ts
│   │   │   │   │   └── upload-media.dto.ts
│   │   │   │   ├── media.module.ts
│   │   │   │   └── services
│   │   │   │       ├── media-compression.service.ts
│   │   │   │       ├── media.service.ts
│   │   │   │       └── media-upload.service.ts
│   │   │   ├── monitoring
│   │   │   │   ├── controllers
│   │   │   │   │   └── monitoring.controller.ts
│   │   │   │   ├── gateways
│   │   │   │   │   └── monitoring.gateway.ts
│   │   │   │   ├── monitoring.module.ts
│   │   │   │   └── services
│   │   │   │       └── monitoring.service.ts
│   │   │   ├── notifications
│   │   │   │   ├── controllers
│   │   │   │   │   └── notifications.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── create-notification.dto.ts
│   │   │   │   │   └── mark-read.dto.ts
│   │   │   │   ├── notifications.module.ts
│   │   │   │   └── services
│   │   │   │       └── notifications.service.ts
│   │   │   ├── questions
│   │   │   │   ├── controllers
│   │   │   │   │   └── questions.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── approve-question.dto.ts
│   │   │   │   │   ├── create-question.dto.ts
│   │   │   │   │   ├── import-questions.dto.ts
│   │   │   │   │   └── update-question.dto.ts
│   │   │   │   ├── interfaces
│   │   │   │   │   ├── correct-answer.interface.ts
│   │   │   │   │   └── question-options.interface.ts
│   │   │   │   ├── questions.module.ts
│   │   │   │   └── services
│   │   │   │       ├── question-import.service.ts
│   │   │   │       ├── questions.service.ts
│   │   │   │       └── question-statistics.service.ts
│   │   │   ├── question-tags
│   │   │   │   ├── controllers
│   │   │   │   │   └── question-tags.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── create-tag.dto.ts
│   │   │   │   │   └── update-tag.dto.ts
│   │   │   │   ├── question-tags.module.ts
│   │   │   │   └── services
│   │   │   │       └── question-tags.service.ts
│   │   │   ├── reports
│   │   │   │   ├── controllers
│   │   │   │   │   └── reports.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   └── export-filter.dto.ts
│   │   │   │   ├── processors
│   │   │   │   │   └── report-queue.processor.ts
│   │   │   │   ├── reports.module.ts
│   │   │   │   └── services
│   │   │   │       ├── excel-export.service.ts
│   │   │   │       └── pdf-export.service.ts
│   │   │   ├── sessions
│   │   │   │   ├── controllers
│   │   │   │   │   └── sessions.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── assign-students.dto.ts
│   │   │   │   │   ├── create-session.dto.ts
│   │   │   │   │   └── update-session.dto.ts
│   │   │   │   ├── services
│   │   │   │   │   ├── session-monitoring.service.ts
│   │   │   │   │   └── sessions.service.ts
│   │   │   │   └── sessions.module.ts
│   │   │   ├── subjects
│   │   │   │   ├── controllers
│   │   │   │   │   └── subjects.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── create-subject.dto.ts
│   │   │   │   │   └── update-subject.dto.ts
│   │   │   │   ├── services
│   │   │   │   │   └── subjects.service.ts
│   │   │   │   └── subjects.module.ts
│   │   │   ├── submissions
│   │   │   │   ├── controllers
│   │   │   │   │   ├── student-exam.controller.ts
│   │   │   │   │   └── submissions.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── start-attempt.dto.ts
│   │   │   │   │   ├── submit-answer.dto.ts
│   │   │   │   │   ├── submit-exam.dto.ts
│   │   │   │   │   └── upload-media.dto.ts
│   │   │   │   ├── interfaces
│   │   │   │   │   ├── exam-package.interface.ts
│   │   │   │   │   └── grading-result.interface.ts
│   │   │   │   ├── services
│   │   │   │   │   ├── auto-grading.service.ts
│   │   │   │   │   ├── exam-download.service.ts
│   │   │   │   │   ├── exam-submission.service.ts
│   │   │   │   │   └── submissions.service.ts
│   │   │   │   └── submissions.module.ts
│   │   │   ├── sync
│   │   │   │   ├── controllers
│   │   │   │   │   └── sync.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── add-sync-item.dto.ts
│   │   │   │   │   └── retry-sync.dto.ts
│   │   │   │   ├── processors
│   │   │   │   │   └── sync.processor.ts
│   │   │   │   ├── services
│   │   │   │   │   ├── chunked-upload.service.ts
│   │   │   │   │   ├── sync-processor.service.ts
│   │   │   │   │   └── sync.service.ts
│   │   │   │   └── sync.module.ts
│   │   │   ├── tenants
│   │   │   │   ├── controllers
│   │   │   │   │   └── tenants.controller.ts
│   │   │   │   ├── dto
│   │   │   │   │   ├── create-tenant.dto.ts
│   │   │   │   │   └── update-tenant.dto.ts
│   │   │   │   ├── services
│   │   │   │   │   └── tenants.service.ts
│   │   │   │   └── tenants.module.ts
│   │   │   └── users
│   │   │       ├── controllers
│   │   │       │   └── users.controller.ts
│   │   │       ├── dto
│   │   │       │   ├── create-user.dto.ts
│   │   │       │   ├── import-users.dto.ts
│   │   │       │   └── update-user.dto.ts
│   │   │       ├── services
│   │   │       │   └── users.service.ts
│   │   │       └── users.module.ts
│   │   └── prisma
│   │       ├── factories
│   │       │   ├── exam-package.factory.ts
│   │       │   ├── question.factory.ts
│   │       │   └── user.factory.ts
│   │       └── seeds
│   │           ├── 01-tenants.seed.ts
│   │           ├── 02-users.seed.ts
│   │           ├── 03-subjects.seed.ts
│   │           └── index.ts
│   ├── test
│   │   ├── e2e
│   │   │   ├── auth.e2e-spec.ts
│   │   │   ├── grading.e2e-spec.ts
│   │   │   ├── offline-sync.e2e-spec.ts
│   │   │   └── student-exam-flow.e2e-spec.ts
│   │   ├── integration
│   │   │   ├── database.spec.ts
│   │   │   ├── minio.spec.ts
│   │   │   └── redis.spec.ts
│   │   ├── load
│   │   │   ├── concurrent-submission.k6.js
│   │   │   ├── exam-download.k6.js
│   │   │   └── sync-stress.k6.js
│   │   └── unit
│   │       ├── auth
│   │       │   └── auth.service.spec.ts
│   │       ├── exam-packages
│   │       │   └── exam-packages.service.spec.ts
│   │       ├── grading
│   │       │   └── auto-grading.service.spec.ts
│   │       ├── questions
│   │       │   └── questions.service.spec.ts
│   │       └── sync
│   │           └── sync.service.spec.ts
│   ├── tsconfig.json
│   └── uploads
│       ├── answers
│       ├── media
│       ├── questions
│       └── temp
├── exam-frontend
│   ├── next.config.ts
│   ├── package.json
│   ├── playwright.config.ts
│   ├── postcss.config.js
│   ├── public
│   │   ├── fonts
│   │   ├── icons
│   │   ├── images
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src
│   │   ├── app
│   │   │   ├── api
│   │   │   │   ├── auth
│   │   │   │   │   ├── login
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── logout
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── refresh
│   │   │   │   │       └── route.ts
│   │   │   │   ├── download
│   │   │   │   │   └── route.ts
│   │   │   │   ├── health
│   │   │   │   │   └── route.ts
│   │   │   │   ├── media
│   │   │   │   │   └── route.ts
│   │   │   │   └── sync
│   │   │   │       └── route.ts
│   │   │   ├── (auth)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── login
│   │   │   │       └── page.tsx
│   │   │   ├── global.css
│   │   │   ├── (guru)
│   │   │   │   ├── dashboard
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── grading
│   │   │   │   │   ├── [attemptId]
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── hasil
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── soal
│   │   │   │   │   ├── create
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── [id]
│   │   │   │   │   │   └── edit
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── import
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── ujian
│   │   │   │       ├── create
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── [id]
│   │   │   │       │   ├── edit
│   │   │   │       │   │   └── page.tsx
│   │   │   │       │   ├── preview
│   │   │   │       │   │   └── page.tsx
│   │   │   │       │   └── statistics
│   │   │   │       │       └── page.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── (operator)
│   │   │   │   ├── dashboard
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── laporan
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── peserta
│   │   │   │   │   ├── import
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── ruang
│   │   │   │   │   ├── create
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── [id]
│   │   │   │   │   │   └── edit
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── sesi
│   │   │   │       ├── create
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── [id]
│   │   │   │       │   └── edit
│   │   │   │       │       └── page.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (pengawas)
│   │   │   │   ├── dashboard
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── monitoring
│   │   │   │       ├── live
│   │   │   │       │   └── page.tsx
│   │   │   │       └── [sessionId]
│   │   │   │           └── page.tsx
│   │   │   ├── (siswa)
│   │   │   │   ├── dashboard
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── profile
│   │   │   │   │   └── page.tsx
│   │   │   │   └── ujian
│   │   │   │       ├── download
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── page.tsx
│   │   │   │       └── [sessionId]
│   │   │   │           ├── page.tsx
│   │   │   │           ├── result
│   │   │   │           │   └── page.tsx
│   │   │   │           └── review
│   │   │   │               └── page.tsx
│   │   │   └── (superadmin)
│   │   │       ├── audit-logs
│   │   │       │   └── page.tsx
│   │   │       ├── dashboard
│   │   │       │   └── page.tsx
│   │   │       ├── layout.tsx
│   │   │       ├── schools
│   │   │       │   ├── create
│   │   │       │   │   └── page.tsx
│   │   │       │   ├── [id]
│   │   │       │   │   └── edit
│   │   │       │   │       └── page.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── settings
│   │   │       │   └── page.tsx
│   │   │       └── users
│   │   │           └── page.tsx
│   │   ├── components
│   │   │   ├── analytics
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── ExamStatistics.tsx
│   │   │   │   ├── ItemAnalysisChart.tsx
│   │   │   │   └── StudentProgress.tsx
│   │   │   ├── auth
│   │   │   │   ├── DeviceLockWarning.tsx
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── exam
│   │   │   │   ├── ActivityLogger.tsx
│   │   │   │   ├── AutoSaveIndicator.tsx
│   │   │   │   ├── ExamInstructions.tsx
│   │   │   │   ├── ExamTimer.tsx
│   │   │   │   ├── MediaPlayer.tsx
│   │   │   │   ├── MediaRecorder.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── QuestionNavigation.tsx
│   │   │   │   └── question-types
│   │   │   │       ├── Essay.tsx
│   │   │   │       ├── Matching.tsx
│   │   │   │       ├── MultipleChoiceComplex.tsx
│   │   │   │       ├── MultipleChoice.tsx
│   │   │   │       ├── ShortAnswer.tsx
│   │   │   │       └── TrueFalse.tsx
│   │   │   ├── grading
│   │   │   │   ├── EssaySimilarityBadge.tsx
│   │   │   │   ├── GradingRubric.tsx
│   │   │   │   └── ManualGradingCard.tsx
│   │   │   ├── layout
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── madrasah
│   │   │   │   ├── ArabicKeyboard.tsx
│   │   │   │   ├── HafalanRecorder.tsx
│   │   │   │   ├── QuranDisplay.tsx
│   │   │   │   └── TajwidMarker.tsx
│   │   │   ├── monitoring
│   │   │   │   ├── ActivityLogViewer.tsx
│   │   │   │   ├── LiveMonitor.tsx
│   │   │   │   └── StudentProgressCard.tsx
│   │   │   ├── questions
│   │   │   │   ├── MatchingEditor.tsx
│   │   │   │   ├── MediaUpload.tsx
│   │   │   │   ├── OptionsEditor.tsx
│   │   │   │   ├── QuestionEditor.tsx
│   │   │   │   └── TagSelector.tsx
│   │   │   ├── sync
│   │   │   │   ├── ChecksumValidator.tsx
│   │   │   │   ├── DownloadProgress.tsx
│   │   │   │   ├── SyncStatus.tsx
│   │   │   │   └── UploadQueue.tsx
│   │   │   └── ui
│   │   │       ├── Alert.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Confirm.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Loading.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Select.tsx
│   │   │       ├── Spinner.tsx
│   │   │       ├── Table.tsx
│   │   │       ├── Tabs.tsx
│   │   │       ├── Toast.tsx
│   │   │       └── Tooltip.tsx
│   │   ├── hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-auto-save.ts
│   │   │   ├── use-device-warnings.ts
│   │   │   ├── use-exam.ts
│   │   │   ├── use-media-recorder.ts
│   │   │   ├── use-online-status.ts
│   │   │   ├── use-powersync.ts
│   │   │   ├── use-sync-status.ts
│   │   │   ├── use-timer.ts
│   │   │   └── use-toast.ts
│   │   ├── lib
│   │   │   ├── api
│   │   │   │   ├── analytics.api.ts
│   │   │   │   ├── auth.api.ts
│   │   │   │   ├── client.ts
│   │   │   │   ├── exam-packages.api.ts
│   │   │   │   ├── grading.api.ts
│   │   │   │   ├── media.api.ts
│   │   │   │   ├── monitoring.api.ts
│   │   │   │   ├── questions.api.ts
│   │   │   │   ├── sessions.api.ts
│   │   │   │   ├── submissions.api.ts
│   │   │   │   └── sync.api.ts
│   │   │   ├── crypto
│   │   │   │   ├── aes-gcm.ts
│   │   │   │   ├── checksum.ts
│   │   │   │   └── key-manager.ts
│   │   │   ├── db
│   │   │   │   ├── db.ts
│   │   │   │   ├── migrations.ts
│   │   │   │   ├── queries.ts
│   │   │   │   └── schema.ts
│   │   │   ├── exam
│   │   │   │   ├── activity-logger.ts
│   │   │   │   ├── auto-save.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── navigation.ts
│   │   │   │   ├── package-decoder.ts
│   │   │   │   ├── randomizer.ts
│   │   │   │   ├── timer.ts
│   │   │   │   └── validator.ts
│   │   │   ├── media
│   │   │   │   ├── chunked-upload.ts
│   │   │   │   ├── compress.ts
│   │   │   │   ├── player.ts
│   │   │   │   ├── recorder.ts
│   │   │   │   └── upload.ts
│   │   │   ├── middleware
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── role.middleware.ts
│   │   │   │   └── tenant.middleware.ts
│   │   │   ├── offline
│   │   │   │   ├── cache.ts
│   │   │   │   ├── checksum.ts
│   │   │   │   ├── download.ts
│   │   │   │   ├── queue.ts
│   │   │   │   └── sync.ts
│   │   │   └── utils
│   │   │       ├── compression.ts
│   │   │       ├── device.ts
│   │   │       ├── error.ts
│   │   │       ├── format.ts
│   │   │       ├── logger.ts
│   │   │       ├── network.ts
│   │   │       └── time.ts
│   │   ├── middleware.ts
│   │   ├── schemas
│   │   │   ├── answer.schema.ts
│   │   │   ├── auth.schema.ts
│   │   │   ├── exam.schema.ts
│   │   │   ├── question.schema.ts
│   │   │   ├── sync.schema.ts
│   │   │   └── user.schema.ts
│   │   ├── stores
│   │   │   ├── activity.store.ts
│   │   │   ├── answer.store.ts
│   │   │   ├── auth.store.ts
│   │   │   ├── exam.store.ts
│   │   │   ├── index.ts
│   │   │   ├── sync.store.ts
│   │   │   ├── timer.store.ts
│   │   │   └── ui.store.ts
│   │   ├── styles
│   │   │   ├── animations.css
│   │   │   ├── arabic.css
│   │   │   └── print.css
│   │   ├── tests
│   │   │   ├── integration
│   │   │   │   ├── dexie.spec.ts
│   │   │   │   └── sync.spec.ts
│   │   │   ├── setup.ts
│   │   │   └── unit
│   │   │       ├── hooks
│   │   │       │   ├── use-auto-save.spec.ts
│   │   │       │   ├── use-online-status.spec.ts
│   │   │       │   └── use-timer.spec.ts
│   │   │       ├── lib
│   │   │       │   ├── aes-gcm.spec.ts
│   │   │       │   ├── auto-save.spec.ts
│   │   │       │   ├── checksum.spec.ts
│   │   │       │   └── compression.spec.ts
│   │   │       └── stores
│   │   │           ├── answer.store.spec.ts
│   │   │           ├── auth.store.spec.ts
│   │   │           └── exam.store.spec.ts
│   │   └── types
│   │       ├── activity.ts
│   │       ├── answer.ts
│   │       ├── api.ts
│   │       ├── common.ts
│   │       ├── exam.ts
│   │       ├── index.ts
│   │       ├── media.ts
│   │       ├── question.ts
│   │       ├── sync.ts
│   │       └── user.ts
│   ├── tailwind.config.ts
│   ├── tests
│   │   └── e2e
│   │       ├── auth.spec.ts
│   │       ├── exam-flow.spec.ts
│   │       ├── grading.spec.ts
│   │       ├── media-recording.spec.ts
│   │       └── offline-sync.spec.ts
│   ├── tsconfig.json
│   └── vitest.config.ts
├── generate.sh
├── README_BE.md
├── README_FE.md
├── README.md
├── setup-backend.sh
├── setup-frontend.sh
└── SKILLS.md
```

### Frontend (`exam-frontend/src/`)
```
app/
├── (auth)/login/                          # Halaman login
├── (siswa)/ujian/[sessionId]/             # Ruang ujian utama ← paling kritis
│   ├── review/                            # Review jawaban
│   └── result/                            # Hasil ujian
├── (guru)/soal/ ujian/ grading/           # Dashboard guru
├── (operator)/sesi/ ruang/ peserta/       # Dashboard operator
├── (pengawas)/monitoring/                 # Live monitoring
└── (superadmin)/schools/ users/           # Admin institusi

components/
├── exam/question-types/                   # MultipleChoice, Essay, Matching, dll (lazy loaded)
├── exam/                                  # ExamTimer, AutoSaveIndicator, ActivityLogger, dll
├── sync/                                  # DownloadProgress, SyncStatus, UploadQueue
├── monitoring/                            # LiveMonitor, ActivityLogViewer
├── grading/                               # ManualGradingCard, EssaySimilarityBadge
└── ui/                                    # Base components (Button, Modal, Toast, dll)

stores/                                    # Zustand — state in-memory (tidak dipersist ke disk)
├── auth.store.ts                          # session, token, device fingerprint
├── exam.store.ts                          # paket soal, status ujian, currentQuestion
├── answer.store.ts                        # jawaban, isDirty, lastSaved
├── sync.store.ts                          # isOnline, pendingCount, lastSyncAt
└── timer.store.ts                         # timeRemaining, tick

lib/
├── api/                                   # ky client + fungsi per domain (auth, submissions, dll)
├── crypto/                                # aes-gcm.ts, key-manager.ts, checksum.ts
├── db/                                    # Dexie schema, db instance, query helpers
├── exam/                                  # controller.ts, auto-save.ts, package-decoder.ts, timer.ts
├── media/                                 # recorder.ts, chunked-upload.ts, compress.ts
├── offline/                               # download.ts, sync.ts, queue.ts, cache.ts
└── utils/                                 # network.ts, device.ts, compression.ts, format.ts

hooks/                                     # Custom hooks — satu hook per logika stateful
schemas/                                   # Zod schemas — validasi form & response API
types/                                     # TypeScript types & interfaces
```

### Backend (`exam-backend/src/`)
```
modules/
├── auth/              # JWT, Passport, refresh token rotation, DeviceGuard
├── tenants/           # Manajemen institusi (multi-tenant root)
├── users/             # CRUD user, import Excel
├── subjects/          # Mata pelajaran per tenant
├── question-tags/     # Tag soal per tenant
├── questions/         # Bank soal — 6 tipe, import/export
├── exam-packages/     # Paket ujian, builder, item analysis
├── exam-rooms/        # Ruang ujian per tenant
├── sessions/          # Sesi ujian, assign peserta, monitoring
├── submissions/       # ← KRITIS: download paket, submit jawaban, auto-grade
├── grading/           # Manual grading, publish hasil
├── sync/              # Offline sync endpoint, BullMQ processor, chunked upload
├── monitoring/        # Socket.IO gateway, live status
├── analytics/         # Item analysis, statistik ujian
├── reports/           # Ekspor Excel (ExcelJS) & PDF (Puppeteer)
├── media/             # Upload ke MinIO, presigned URL, kompresi
├── activity-logs/     # Log aktivitas peserta selama ujian
├── audit-logs/        # Tabel append-only aksi sensitif
├── notifications/     # Notifikasi in-app
└── health/            # @nestjs/terminus — health check load balancer

common/
├── decorators/        # @CurrentUser, @TenantId, @Roles, @Public, @Idempotency
├── guards/            # TenantGuard, ThrottlerGuard
├── interceptors/      # TenantInterceptor, IdempotencyInterceptor, TransformInterceptor
├── filters/           # HttpExceptionFilter, AllExceptionsFilter
├── middleware/        # SubdomainMiddleware (ekstrak tenantId dari subdomain)
├── enums/             # UserRole, QuestionType, ExamPackageStatus, GradingStatus, SyncStatus
└── utils/             # encryption, checksum, device-fingerprint, presigned-url, similarity

prisma/
├── schema.prisma      # Single source of truth — semua model & relasi
└── seeds/             # 01-tenants, 02-users, 03-subjects
```

### Prisma Model Utama & Relasi
```
Tenant
 └── User → RefreshToken, UserDevice
 └── Subject → Question → ExamPackageQuestion
 └── QuestionTag → QuestionTagMapping
 └── ExamPackage → ExamPackageQuestion
                 → ExamSession → SessionStudent
                               → ExamAttempt → ExamAnswer (idempotency)
                                             → ExamActivityLog
                                             → SyncQueue
 └── AuditLog (append-only)
```

### Queue Jobs (BullMQ) — Semua dengan DLQ & `removeOnFail: false`
```
submission  → process-submission   Validasi & simpan jawaban
            → auto-grade           Penilaian otomatis soal objektif
sync        → process-sync-batch   Proses batch dari syncQueue
media       → transcode-video      Transcode video jawaban
            → compress-image       Kompresi gambar soal
report      → generate-pdf         PDF via Puppeteer → MinIO → presigned URL
            → generate-excel       Excel via ExcelJS → MinIO → presigned URL
notification→ send-realtime        Broadcast ke Socket.IO
```

---

## Format Respons AI

- Jawaban langsung pada solusi teknis tanpa pembuka panjang.
- Kode menggunakan nama variabel ringkas namun deskriptif.
- Jika ada beberapa pendekatan, tampilkan perbedaan dan trade-off secara singkat — bukan semua opsi secara panjang lebar.
- Tidak perlu menyertakan instruksi instalasi, struktur folder standar, atau penjelasan umum yang sudah diketahui senior developer, kecuali diminta secara spesifik.
- Gunakan Bahasa Indonesia untuk penjelasan, Bahasa Inggris untuk kode dan nama teknis.
- Saat mengerjakan fitur baru, selalu rujuk bagian **Alur Aplikasi** dan **Struktur Proyek** di atas untuk memastikan implementasi diletakkan di layer dan file yang tepat.
