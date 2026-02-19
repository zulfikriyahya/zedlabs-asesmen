## Direktori: src

### File: `src/app.controller.ts`

```typescript

```

---

### File: `src/app.module.ts`

```typescript

```

---

### File: `src/app.service.ts`

```typescript

```

---

### File: `src/common/decorators/current-user.decorator.ts`

```typescript

```

---

### File: `src/common/decorators/idempotency.decorator.ts`

```typescript

```

---

### File: `src/common/decorators/public.decorator.ts`

```typescript

```

---

### File: `src/common/decorators/roles.decorator.ts`

```typescript

```

---

### File: `src/common/decorators/tenant-id.decorator.ts`

```typescript

```

---

### File: `src/common/dto/base-query.dto.ts`

```typescript

```

---

### File: `src/common/dto/base-response.dto.ts`

```typescript

```

---

### File: `src/common/dto/pagination.dto.ts`

```typescript

```

---

### File: `src/common/enums/exam-status.enum.ts`

```typescript

```

---

### File: `src/common/enums/grading-status.enum.ts`

```typescript

```

---

### File: `src/common/enums/question-type.enum.ts`

```typescript

```

---

### File: `src/common/enums/sync-status.enum.ts`

```typescript

```

---

### File: `src/common/enums/user-role.enum.ts`

```typescript

```

---

### File: `src/common/exceptions/device-locked.exception.ts`

```typescript

```

---

### File: `src/common/exceptions/exam-not-available.exception.ts`

```typescript

```

---

### File: `src/common/exceptions/idempotency-conflict.exception.ts`

```typescript

```

---

### File: `src/common/exceptions/tenant-not-found.exception.ts`

```typescript

```

---

### File: `src/common/filters/all-exceptions.filter.ts`

```typescript

```

---

### File: `src/common/filters/http-exception.filter.ts`

```typescript

```

---

### File: `src/common/guards/tenant.guard.ts`

```typescript

```

---

### File: `src/common/guards/throttler.guard.ts`

```typescript

```

---

### File: `src/common/interceptors/idempotency.interceptor.ts`

```typescript

```

---

### File: `src/common/interceptors/logging.interceptor.ts`

```typescript

```

---

### File: `src/common/interceptors/tenant.interceptor.ts`

```typescript

```

---

### File: `src/common/interceptors/timeout.interceptor.ts`

```typescript

```

---

### File: `src/common/interceptors/transform.interceptor.ts`

```typescript

```

---

### File: `src/common/middleware/logger.middleware.ts`

```typescript

```

---

### File: `src/common/middleware/performance.middleware.ts`

```typescript

```

---

### File: `src/common/middleware/subdomain.middleware.ts`

```typescript

```

---

### File: `src/common/pipes/parse-int.pipe.ts`

```typescript

```

---

### File: `src/common/pipes/validation.pipe.ts`

```typescript

```

---

### File: `src/common/utils/checksum.util.ts`

```typescript

```

---

### File: `src/common/utils/device-fingerprint.util.ts`

```typescript

```

---

### File: `src/common/utils/encryption.util.ts`

```typescript

```

---

### File: `src/common/utils/file.util.ts`

```typescript

```

---

### File: `src/common/utils/presigned-url.util.ts`

```typescript

```

---

### File: `src/common/utils/randomizer.util.ts`

```typescript

```

---

### File: `src/common/utils/similarity.util.ts`

```typescript

```

---

### File: `src/common/utils/time-validation.util.ts`

```typescript

```

---

### File: `src/common/validators/is-tenant-exists.validator.ts`

```typescript

```

---

### File: `src/common/validators/is-unique.validator.ts`

```typescript

```

---

### File: `src/config/app.config.ts`

```typescript

```

---

### File: `src/config/bullmq.config.ts`

```typescript

```

---

### File: `src/config/database.config.ts`

```typescript

```

---

### File: `src/config/jwt.config.ts`

```typescript

```

---

### File: `src/config/minio.config.ts`

```typescript

```

---

### File: `src/config/multer.config.ts`

```typescript

```

---

### File: `src/config/redis.config.ts`

```typescript

```

---

### File: `src/config/throttler.config.ts`

```typescript

```

---

### File: `src/main.ts`

```typescript

```

---

### File: `src/modules/activity-logs/activity-logs.module.ts`

```typescript

```

---

### File: `src/modules/activity-logs/controllers/activity-logs.controller.ts`

```typescript

```

---

### File: `src/modules/activity-logs/dto/create-activity-log.dto.ts`

```typescript

```

---

### File: `src/modules/activity-logs/services/activity-logs.service.ts`

```typescript

```

---

### File: `src/modules/analytics/analytics.module.ts`

```typescript

```

---

### File: `src/modules/analytics/controllers/analytics.controller.ts`

```typescript

```

---

### File: `src/modules/analytics/dto/analytics-filter.dto.ts`

```typescript

```

---

### File: `src/modules/analytics/services/analytics.service.ts`

```typescript

```

---

### File: `src/modules/analytics/services/dashboard.service.ts`

```typescript

```

---

### File: `src/modules/audit-logs/audit-logs.module.ts`

```typescript

```

---

### File: `src/modules/audit-logs/decorators/audit.decorator.ts`

```typescript

```

---

### File: `src/modules/audit-logs/services/audit-logs.service.ts`

```typescript

```

---

### File: `src/modules/auth/auth.module.ts`

```typescript

```

---

### File: `src/modules/auth/controllers/auth.controller.ts`

```typescript

```

---

### File: `src/modules/auth/dto/change-password.dto.ts`

```typescript

```

---

### File: `src/modules/auth/dto/login.dto.ts`

```typescript

```

---

### File: `src/modules/auth/dto/refresh-token.dto.ts`

```typescript

```

---

### File: `src/modules/auth/guards/device.guard.ts`

```typescript

```

---

### File: `src/modules/auth/guards/jwt-auth.guard.ts`

```typescript

```

---

### File: `src/modules/auth/guards/local-auth.guard.ts`

```typescript

```

---

### File: `src/modules/auth/guards/roles.guard.ts`

```typescript

```

---

### File: `src/modules/auth/services/auth.service.ts`

```typescript

```

---

### File: `src/modules/auth/strategies/jwt.strategy.ts`

```typescript

```

---

### File: `src/modules/auth/strategies/jwt-refresh.strategy.ts`

```typescript

```

---

### File: `src/modules/auth/strategies/local.strategy.ts`

```typescript

```

---

### File: `src/modules/exam-packages/controllers/exam-packages.controller.ts`

```typescript

```

---

### File: `src/modules/exam-packages/dto/add-questions.dto.ts`

```typescript

```

---

### File: `src/modules/exam-packages/dto/create-exam-package.dto.ts`

```typescript

```

---

### File: `src/modules/exam-packages/dto/publish-exam-package.dto.ts`

```typescript

```

---

### File: `src/modules/exam-packages/dto/update-exam-package.dto.ts`

```typescript

```

---

### File: `src/modules/exam-packages/exam-packages.module.ts`

```typescript

```

---

### File: `src/modules/exam-packages/interfaces/exam-package-settings.interface.ts`

```typescript

```

---

### File: `src/modules/exam-packages/services/exam-packages.service.ts`

```typescript

```

---

### File: `src/modules/exam-packages/services/exam-package-builder.service.ts`

```typescript

```

---

### File: `src/modules/exam-packages/services/item-analysis.service.ts`

```typescript

```

---

### File: `src/modules/exam-rooms/controllers/exam-rooms.controller.ts`

```typescript

```

---

### File: `src/modules/exam-rooms/dto/create-room.dto.ts`

```typescript

```

---

### File: `src/modules/exam-rooms/dto/update-room.dto.ts`

```typescript

```

---

### File: `src/modules/exam-rooms/exam-rooms.module.ts`

```typescript

```

---

### File: `src/modules/exam-rooms/services/exam-rooms.service.ts`

```typescript

```

---

### File: `src/modules/grading/controllers/grading.controller.ts`

```typescript

```

---

### File: `src/modules/grading/dto/complete-grading.dto.ts`

```typescript

```

---

### File: `src/modules/grading/dto/grade-answer.dto.ts`

```typescript

```

---

### File: `src/modules/grading/dto/publish-result.dto.ts`

```typescript

```

---

### File: `src/modules/grading/grading.module.ts`

```typescript

```

---

### File: `src/modules/grading/services/grading.service.ts`

```typescript

```

---

### File: `src/modules/grading/services/manual-grading.service.ts`

```typescript

```

---

### File: `src/modules/health/controllers/health.controller.ts`

```typescript

```

---

### File: `src/modules/health/health.module.ts`

```typescript

```

---

### File: `src/modules/media/controllers/media.controller.ts`

```typescript

```

---

### File: `src/modules/media/dto/delete-media.dto.ts`

```typescript

```

---

### File: `src/modules/media/dto/upload-media.dto.ts`

```typescript

```

---

### File: `src/modules/media/media.module.ts`

```typescript

```

---

### File: `src/modules/media/services/media.service.ts`

```typescript

```

---

### File: `src/modules/media/services/media-compression.service.ts`

```typescript

```

---

### File: `src/modules/media/services/media-upload.service.ts`

```typescript

```

---

### File: `src/modules/monitoring/controllers/monitoring.controller.ts`

```typescript

```

---

### File: `src/modules/monitoring/gateways/monitoring.gateway.ts`

```typescript

```

---

### File: `src/modules/monitoring/monitoring.module.ts`

```typescript

```

---

### File: `src/modules/monitoring/services/monitoring.service.ts`

```typescript

```

---

### File: `src/modules/notifications/controllers/notifications.controller.ts`

```typescript

```

---

### File: `src/modules/notifications/dto/create-notification.dto.ts`

```typescript

```

---

### File: `src/modules/notifications/dto/mark-read.dto.ts`

```typescript

```

---

### File: `src/modules/notifications/notifications.module.ts`

```typescript

```

---

### File: `src/modules/notifications/services/notifications.service.ts`

```typescript

```

---

### File: `src/modules/questions/controllers/questions.controller.ts`

```typescript

```

---

### File: `src/modules/questions/dto/approve-question.dto.ts`

```typescript

```

---

### File: `src/modules/questions/dto/create-question.dto.ts`

```typescript

```

---

### File: `src/modules/questions/dto/import-questions.dto.ts`

```typescript

```

---

### File: `src/modules/questions/dto/update-question.dto.ts`

```typescript

```

---

### File: `src/modules/questions/interfaces/correct-answer.interface.ts`

```typescript

```

---

### File: `src/modules/questions/interfaces/question-options.interface.ts`

```typescript

```

---

### File: `src/modules/questions/questions.module.ts`

```typescript

```

---

### File: `src/modules/questions/services/questions.service.ts`

```typescript

```

---

### File: `src/modules/questions/services/question-import.service.ts`

```typescript

```

---

### File: `src/modules/questions/services/question-statistics.service.ts`

```typescript

```

---

### File: `src/modules/question-tags/controllers/question-tags.controller.ts`

```typescript

```

---

### File: `src/modules/question-tags/dto/create-tag.dto.ts`

```typescript

```

---

### File: `src/modules/question-tags/dto/update-tag.dto.ts`

```typescript

```

---

### File: `src/modules/question-tags/question-tags.module.ts`

```typescript

```

---

### File: `src/modules/question-tags/services/question-tags.service.ts`

```typescript

```

---

### File: `src/modules/reports/controllers/reports.controller.ts`

```typescript

```

---

### File: `src/modules/reports/dto/export-filter.dto.ts`

```typescript

```

---

### File: `src/modules/reports/processors/report-queue.processor.ts`

```typescript

```

---

### File: `src/modules/reports/reports.module.ts`

```typescript

```

---

### File: `src/modules/reports/services/excel-export.service.ts`

```typescript

```

---

### File: `src/modules/reports/services/pdf-export.service.ts`

```typescript

```

---

### File: `src/modules/sessions/controllers/sessions.controller.ts`

```typescript

```

---

### File: `src/modules/sessions/dto/assign-students.dto.ts`

```typescript

```

---

### File: `src/modules/sessions/dto/create-session.dto.ts`

```typescript

```

---

### File: `src/modules/sessions/dto/update-session.dto.ts`

```typescript

```

---

### File: `src/modules/sessions/services/sessions.service.ts`

```typescript

```

---

### File: `src/modules/sessions/services/session-monitoring.service.ts`

```typescript

```

---

### File: `src/modules/sessions/sessions.module.ts`

```typescript

```

---

### File: `src/modules/subjects/controllers/subjects.controller.ts`

```typescript

```

---

### File: `src/modules/subjects/dto/create-subject.dto.ts`

```typescript

```

---

### File: `src/modules/subjects/dto/update-subject.dto.ts`

```typescript

```

---

### File: `src/modules/subjects/services/subjects.service.ts`

```typescript

```

---

### File: `src/modules/subjects/subjects.module.ts`

```typescript

```

---

### File: `src/modules/submissions/controllers/student-exam.controller.ts`

```typescript

```

---

### File: `src/modules/submissions/controllers/submissions.controller.ts`

```typescript

```

---

### File: `src/modules/submissions/dto/start-attempt.dto.ts`

```typescript

```

---

### File: `src/modules/submissions/dto/submit-answer.dto.ts`

```typescript

```

---

### File: `src/modules/submissions/dto/submit-exam.dto.ts`

```typescript

```

---

### File: `src/modules/submissions/dto/upload-media.dto.ts`

```typescript

```

---

### File: `src/modules/submissions/interfaces/exam-package.interface.ts`

```typescript

```

---

### File: `src/modules/submissions/interfaces/grading-result.interface.ts`

```typescript

```

---

### File: `src/modules/submissions/services/auto-grading.service.ts`

```typescript

```

---

### File: `src/modules/submissions/services/exam-download.service.ts`

```typescript

```

---

### File: `src/modules/submissions/services/exam-submission.service.ts`

```typescript

```

---

### File: `src/modules/submissions/services/submissions.service.ts`

```typescript

```

---

### File: `src/modules/submissions/submissions.module.ts`

```typescript

```

---

### File: `src/modules/sync/controllers/sync.controller.ts`

```typescript

```

---

### File: `src/modules/sync/dto/add-sync-item.dto.ts`

```typescript

```

---

### File: `src/modules/sync/dto/retry-sync.dto.ts`

```typescript

```

---

### File: `src/modules/sync/processors/sync.processor.ts`

```typescript

```

---

### File: `src/modules/sync/services/chunked-upload.service.ts`

```typescript

```

---

### File: `src/modules/sync/services/sync.service.ts`

```typescript

```

---

### File: `src/modules/sync/services/sync-processor.service.ts`

```typescript

```

---

### File: `src/modules/sync/sync.module.ts`

```typescript

```

---

### File: `src/modules/tenants/controllers/tenants.controller.ts`

```typescript

```

---

### File: `src/modules/tenants/dto/create-tenant.dto.ts`

```typescript

```

---

### File: `src/modules/tenants/dto/update-tenant.dto.ts`

```typescript

```

---

### File: `src/modules/tenants/services/tenants.service.ts`

```typescript

```

---

### File: `src/modules/tenants/tenants.module.ts`

```typescript

```

---

### File: `src/modules/users/controllers/users.controller.ts`

```typescript

```

---

### File: `src/modules/users/dto/create-user.dto.ts`

```typescript

```

---

### File: `src/modules/users/dto/import-users.dto.ts`

```typescript

```

---

### File: `src/modules/users/dto/update-user.dto.ts`

```typescript

```

---

### File: `src/modules/users/services/users.service.ts`

```typescript

```

---

### File: `src/modules/users/users.module.ts`

```typescript

```

---

### File: `src/prisma/factories/exam-package.factory.ts`

```typescript

```

---

### File: `src/prisma/factories/question.factory.ts`

```typescript

```

---

### File: `src/prisma/factories/user.factory.ts`

```typescript

```

---

### File: `src/prisma/seeds/01-tenants.seed.ts`

```typescript

```

---

### File: `src/prisma/seeds/02-users.seed.ts`

```typescript

```

---

### File: `src/prisma/seeds/03-subjects.seed.ts`

```typescript

```

---

### File: `src/prisma/seeds/index.ts`

```typescript

```

---

## Direktori: prisma

### File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL")
}

// ============================================
// MULTI-TENANT ROOT
// ============================================

model Tenant {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique
  subdomain String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users        User[]
  subjects     Subject[]
  questions    Question[]
  examPackages ExamPackage[]
  sessions     ExamSession[]
  auditLogs    AuditLog[]

  @@map("tenants")
}

// ============================================
// USERS & AUTH
// ============================================

model User {
  id           String   @id @default(cuid())
  tenantId     String
  email        String
  username     String
  passwordHash String
  role         UserRole
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant        Tenant            @relation(fields: [tenantId], references: [id])
  refreshTokens RefreshToken[]
  devices       UserDevice[]
  attempts      ExamAttempt[]
  activityLogs  ExamActivityLog[]
  gradedAnswers ExamAnswer[]      @relation("GradedBy")
  auditLogs     AuditLog[]

  @@unique([tenantId, email])
  @@unique([tenantId, username])
  @@index([tenantId])
  @@map("users")
}

model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  token     String    @unique
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

model UserDevice {
  id          String    @id @default(cuid())
  userId      String
  fingerprint String
  label       String?
  isLocked    Boolean   @default(false)
  lockedAt    DateTime?
  lastSeenAt  DateTime  @default(now())
  createdAt   DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, fingerprint])
  @@index([userId])
  @@map("user_devices")
}

// ============================================
// QUESTION BANK
// ============================================

model Subject {
  id        String   @id @default(cuid())
  tenantId  String
  name      String
  code      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant    Tenant     @relation(fields: [tenantId], references: [id])
  questions Question[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@map("subjects")
}

model QuestionTag {
  id       String @id @default(cuid())
  tenantId String
  name     String

  questions QuestionTagMapping[]

  @@unique([tenantId, name])
  @@map("question_tags")
}

model Question {
  id            String       @id @default(cuid())
  tenantId      String
  subjectId     String
  type          QuestionType
  content       Json         // { text, images, audio, video }
  options       Json?        // untuk tipe pilihan ganda & menjodohkan
  correctAnswer Json         // terenkripsi di level aplikasi
  points        Int          @default(1)
  difficulty    Int          @default(1) // 1–5
  status        String       @default("draft") // draft | review | approved
  createdById   String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  tenant           Tenant               @relation(fields: [tenantId], references: [id])
  subject          Subject              @relation(fields: [subjectId], references: [id])
  tags             QuestionTagMapping[]
  examPackageItems ExamPackageQuestion[]

  @@index([tenantId])
  @@index([tenantId, subjectId])
  @@map("questions")
}

model QuestionTagMapping {
  questionId String
  tagId      String

  question Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  tag      QuestionTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([questionId, tagId])
  @@map("question_tag_mappings")
}

// ============================================
// EXAM PACKAGES
// ============================================

model ExamPackage {
  id          String            @id @default(cuid())
  tenantId    String
  title       String
  description String?
  subjectId   String?
  settings    Json              // { duration, shuffleQuestions, shuffleOptions, showResult, maxAttempts }
  status      ExamPackageStatus @default(DRAFT)
  publishedAt DateTime?
  createdById String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  tenant    Tenant               @relation(fields: [tenantId], references: [id])
  questions ExamPackageQuestion[]
  sessions  ExamSession[]

  @@index([tenantId])
  @@map("exam_packages")
}

model ExamPackageQuestion {
  id            String @id @default(cuid())
  examPackageId String
  questionId    String
  order         Int
  points        Int?   // override points dari question

  examPackage ExamPackage @relation(fields: [examPackageId], references: [id], onDelete: Cascade)
  question    Question    @relation(fields: [questionId], references: [id])

  @@unique([examPackageId, questionId])
  @@unique([examPackageId, order])
  @@map("exam_package_questions")
}

// ============================================
// SESSIONS & ROOMS
// ============================================

model ExamRoom {
  id       String @id @default(cuid())
  tenantId String
  name     String
  capacity Int?

  sessions ExamSession[]

  @@index([tenantId])
  @@map("exam_rooms")
}

model ExamSession {
  id            String        @id @default(cuid())
  tenantId      String
  examPackageId String
  roomId        String?
  title         String
  startTime     DateTime
  endTime       DateTime
  status        SessionStatus @default(SCHEDULED)
  createdById   String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  tenant      Tenant          @relation(fields: [tenantId], references: [id])
  examPackage ExamPackage     @relation(fields: [examPackageId], references: [id])
  room        ExamRoom?       @relation(fields: [roomId], references: [id])
  students    SessionStudent[]
  attempts    ExamAttempt[]

  @@index([tenantId])
  @@index([tenantId, examPackageId])
  @@map("exam_sessions")
}

model SessionStudent {
  sessionId String
  userId    String
  tokenCode String   @unique
  addedAt   DateTime @default(now())

  session ExamSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@id([sessionId, userId])
  @@map("session_students")
}

// ============================================
// ATTEMPTS & ANSWERS
// ============================================

model ExamAttempt {
  id                String        @id @default(cuid())
  sessionId         String
  userId            String
  idempotencyKey    String        @unique
  deviceFingerprint String?
  startedAt         DateTime      @default(now())
  submittedAt       DateTime?
  status            AttemptStatus @default(IN_PROGRESS)
  packageHash       String?
  totalScore        Float?
  maxScore          Float?
  gradingStatus     GradingStatus @default(PENDING)
  gradingCompletedAt DateTime?

  session      ExamSession       @relation(fields: [sessionId], references: [id])
  user         User              @relation(fields: [userId], references: [id])
  answers      ExamAnswer[]
  activityLogs ExamActivityLog[]
  syncItems    SyncQueue[]

  @@unique([sessionId, userId])
  @@index([sessionId])
  @@index([userId])
  @@map("exam_attempts")
}

model ExamAnswer {
  id             String   @id @default(cuid())
  attemptId      String
  questionId     String
  idempotencyKey String   @unique
  answer         Json
  mediaUrls      String[]
  score          Float?
  maxScore       Float?
  feedback       String?
  isAutoGraded   Boolean  @default(false)
  gradedById     String?
  gradedAt       DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  attempt  ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  gradedBy User?       @relation("GradedBy", fields: [gradedById], references: [id])

  @@unique([attemptId, questionId])
  @@index([attemptId])
  @@map("exam_answers")
}

// ============================================
// SYNC QUEUE
// ============================================

model SyncQueue {
  id             String     @id @default(cuid())
  attemptId      String
  idempotencyKey String     @unique
  type           SyncType
  payload        Json
  status         SyncStatus @default(PENDING)
  retryCount     Int        @default(0)
  maxRetries     Int        @default(5)
  lastError      String?
  processedAt    DateTime?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  attempt ExamAttempt @relation(fields: [attemptId], references: [id])

  @@index([status, retryCount])
  @@index([attemptId])
  @@map("sync_queue")
}

// ============================================
// LOGGING & AUDIT
// ============================================

model ExamActivityLog {
  id        String   @id @default(cuid())
  attemptId String
  userId    String
  type      String   // tab_blur | tab_focus | copy_paste | idle | ...
  metadata  Json?
  createdAt DateTime @default(now())

  attempt ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  user    User        @relation(fields: [userId], references: [id])

  @@index([attemptId])
  @@map("exam_activity_logs")
}

model AuditLog {
  id         String   @id @default(cuid())
  tenantId   String
  userId     String?
  action     String   // START_EXAM | SUBMIT_EXAM | CHANGE_SCORE | ADMIN_ACCESS | ...
  entityType String
  entityId   String
  before     Json?
  after      Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id])
  user   User?  @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([tenantId, action])
  @@map("audit_logs")
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  body      String
  type      String
  isRead    Boolean  @default(false)
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([userId, isRead])
  @@map("notifications")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  SUPERADMIN
  ADMIN
  TEACHER
  SUPERVISOR
  OPERATOR
  STUDENT
}

enum QuestionType {
  MULTIPLE_CHOICE
  COMPLEX_MULTIPLE_CHOICE
  TRUE_FALSE
  MATCHING
  SHORT_ANSWER
  ESSAY
}

enum ExamPackageStatus {
  DRAFT
  REVIEW
  PUBLISHED
  ARCHIVED
}

enum SessionStatus {
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  TIMED_OUT
  ABANDONED
}

enum GradingStatus {
  PENDING
  AUTO_GRADED
  MANUAL_REQUIRED
  COMPLETED
  PUBLISHED
}

enum SyncStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  DEAD_LETTER
}

enum SyncType {
  SUBMIT_ANSWER
  SUBMIT_EXAM
  UPLOAD_MEDIA
  ACTIVITY_LOG
}

```

---

## Direktori: test

### File: `test/e2e/auth.e2e-spec.ts`

```typescript

```

---

### File: `test/e2e/grading.e2e-spec.ts`

```typescript

```

---

### File: `test/e2e/offline-sync.e2e-spec.ts`

```typescript

```

---

### File: `test/e2e/student-exam-flow.e2e-spec.ts`

```typescript

```

---

### File: `test/integration/database.spec.ts`

```typescript

```

---

### File: `test/integration/minio.spec.ts`

```typescript

```

---

### File: `test/integration/redis.spec.ts`

```typescript

```

---

### File: `test/load/concurrent-submission.k6.js`

```javascript

```

---

### File: `test/load/exam-download.k6.js`

```javascript

```

---

### File: `test/load/sync-stress.k6.js`

```javascript

```

---

### File: `test/unit/auth/auth.service.spec.ts`

```typescript

```

---

### File: `test/unit/exam-packages/exam-packages.service.spec.ts`

```typescript

```

---

### File: `test/unit/grading/auto-grading.service.spec.ts`

```typescript

```

---

### File: `test/unit/questions/questions.service.spec.ts`

```typescript

```

---

### File: `test/unit/sync/sync.service.spec.ts`

```typescript

```

---

## Direktori: scripts

### File: `scripts/cleanup-media.sh`

```bash

```

---

### File: `scripts/rotate-keys.sh`

```bash

```

---

### File: `scripts/seed.sh`

```bash

```

---

## Direktori: ROOT

### File: `.env.example`

```
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api
APP_URL=http://localhost:3000

# Database (Prisma)
DATABASE_URL=postgresql://exam_user:password@pgbouncer:5432/exam_db
DATABASE_DIRECT_URL=postgresql://exam_user:password@postgres:5432/exam_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=change-this-access-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-this-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Encryption (AES-256-GCM key, 32 bytes hex)
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000

# MinIO (S3-compatible)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
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

# Sentry
SENTRY_DSN=

# SMTP (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@exam.app

```

---

### File: `.eslintrc.js`

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: { node: true, jest: true },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};

```

---

### File: `.prettierrc`

```
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "printWidth": 100,
  "tabWidth": 2
}

```

---

### File: `Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]

```

---

### File: `docker-compose.yml`

```yaml
version: '3.9'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    volumes:
      - ./logs:/app/logs
    depends_on:
      - postgres
      - pgbouncer
      - redis
      - minio
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: exam_db
      POSTGRES_USER: exam_user
      POSTGRES_PASSWORD: exam_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  pgbouncer:
    image: bitnami/pgbouncer:latest
    environment:
      POSTGRESQL_HOST: postgres
      POSTGRESQL_PORT: 5432
      POSTGRESQL_DATABASE: exam_db
      POSTGRESQL_USERNAME: exam_user
      POSTGRESQL_PASSWORD: exam_password
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 1000
      PGBOUNCER_DEFAULT_POOL_SIZE: 20
    ports:
      - "6432:6432"
    depends_on:
      - postgres
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:

```

---

### File: `ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'exam-api',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production' },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '2G',
      autorestart: true,
      watch: false,
    },
  ],
};

```

---

### File: `nest-cli.json`

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "watchAssets": true
  }
}

```

---

### File: `package.json`

```json
{
  "name": "exam-backend",
  "version": "1.0.0",
  "description": "Exam System API — Offline-First Multi-Tenant",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:load": "k6 run test/load/concurrent-submission.k6.js",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:seed": "ts-node src/prisma/seeds/index.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/bullmq": "^10.1.1",
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/swagger": "^7.1.17",
    "@nestjs/throttler": "^5.1.1",
    "@nestjs/terminus": "^10.2.3",
    "@prisma/client": "^5.7.1",
    "bullmq": "^5.1.1",
    "ioredis": "^5.3.2",
    "socket.io": "^4.6.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "compression": "^1.7.4",
    "helmet": "^7.1.0",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "@sentry/node": "^8.0.0",
    "multer": "^1.4.5-lts.1",
    "minio": "^7.1.3",
    "exceljs": "^4.4.0",
    "puppeteer": "^21.7.0",
    "sharp": "^0.33.1",
    "fluent-ffmpeg": "^2.1.2",
    "ffmpeg-static": "^5.2.0",
    "string-similarity": "^4.0.4",
    "date-fns-tz": "^3.1.3",
    "uuid": "^9.0.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "prisma": "^5.7.1",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/supertest": "^2.0.12",
    "@types/bcrypt": "^5.0.2",
    "@types/multer": "^1.4.11",
    "@types/compression": "^1.7.5",
    "@types/passport-jwt": "^4.0.0",
    "@types/passport-local": "^1.0.38",
    "@types/fluent-ffmpeg": "^2.1.24",
    "@types/string-similarity": "^4.0.2",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3",
    "rimraf": "^5.0.5"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "@common/(.*)": "<rootDir>/common/$1",
      "@config/(.*)": "<rootDir>/config/$1",
      "@modules/(.*)": "<rootDir>/modules/$1",
      "@prisma/(.*)": "<rootDir>/prisma/$1"
    }
  }
}

```

---

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@common/*": ["src/common/*"],
      "@config/*": ["src/config/*"],
      "@modules/*": ["src/modules/*"],
      "@prisma/*": ["src/prisma/*"]
    }
  }
}

```

---

## Direktori: docs

### File: `docs/architecture/database-schema.md`

```markdown

```

---

### File: `docs/architecture/offline-sync-flow.md`

```markdown

```

---

### File: `docs/architecture/security-model.md`

```markdown

```

---

### File: `docs/architecture/system-design.md`

```markdown

```

---

### File: `docs/deployment/production-checklist.md`

```markdown

```

---

