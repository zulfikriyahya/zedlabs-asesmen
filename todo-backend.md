# BACKEND API DEVELOPMENT PROMPT - Sistem Asesmen Sekolah/Madrasah

## 🎯 PROJECT OVERVIEW

Bangun RESTful API menggunakan **NestJS** untuk sistem asesmen/ujian sekolah dan madrasah dengan arsitektur **offline-first** dan **multi-tenant**. Sistem ini mendukung hingga **5000 siswa simultan** dengan single server architecture.

---

## 📋 CORE REQUIREMENTS

### System Architecture

- **Framework:** NestJS (Node.js)
- **Database:** MySQL 8.0
- **Cache:** Redis (single instance)
- **Authentication:** JWT (Access + Refresh Token)
- **Storage:** Local filesystem
- **Scale:** 5000 concurrent users
- **Multi-tenant:** Single database with row-level security

### Key Features

1. **Offline-First Architecture** - Download soal → offline exam → sync jawaban
2. **Multi-Tenant System** - Multiple schools, subdomain-based routing
3. **6 Question Types** - Pilihan ganda, PG kompleks, benar/salah, menjodohkan, isian singkat, essay
4. **Multimedia Support** - Gambar, audio (MP3), video (MP4) di soal dan jawaban
5. **Media Recording** - Upload audio/video rekaman siswa (max 5 menit, max 1GB/file)
6. **Randomization** - Acak urutan soal dan jawaban (seed-based, reproducible)
7. **Auto-Grading** - Untuk PG, benar/salah, menjodohkan, isian singkat
8. **Manual Grading** - Untuk essay dan multimedia answers
9. **Sync Mechanism** - Queue system, chunked upload, retry mechanism
10. **Security** - Encryption, device fingerprinting, time validation

---

## 👥 USER ROLES & PERMISSIONS

### 1. Siswa/Peserta

- Login & authentication
- Download soal (dengan semua media)
- Submit jawaban (text + rekaman audio/video)
- Lihat hasil (jika diizinkan)
- Lihat feedback (jika diaktifkan guru)

### 2. Guru

- CRUD soal (text, gambar, audio, video)
- Import soal dari Excel
- Atur grading & feedback
- Manual grading untuk essay/multimedia
- Lihat hasil siswa
- Export hasil (Excel, PDF, CSV)
- Item analysis & statistics

### 3. Pengawas

- Monitoring real-time saat ujian
- Lihat activity log siswa
- Lihat status sync & progress

### 4. Operator/Panitia

- CRUD sesi ujian
- CRUD ruang/kelas
- Bulk assign siswa ke ruang
- Atur waktu & durasi ujian
- Import peserta dari Excel

### 5. Superadmin

- Full access semua sekolah
- User management
- System settings
- Backup & restore
- Audit trail

---

## 🗄️ DATABASE SCHEMA

### Multi-Tenant Structure

**CRITICAL:** Setiap tabel (kecuali `schools` dan `superadmin`) HARUS punya `school_id` untuk tenant isolation!

```sql
-- ============================================
-- TENANT & USER MANAGEMENT
-- ============================================

CREATE TABLE schools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  subdomain VARCHAR(50) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),

  -- Quota & limits
  max_students INT DEFAULT 1000,
  max_storage_gb INT DEFAULT 100,
  current_storage_gb DECIMAL(10,2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  subscription_type ENUM('free', 'basic', 'premium') DEFAULT 'basic',
  subscription_expires_at DATETIME,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_subdomain (subdomain),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,

  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  role ENUM('siswa', 'guru', 'pengawas', 'operator', 'superadmin') NOT NULL,

  full_name VARCHAR(255) NOT NULL,
  nis_nip VARCHAR(50), -- NIS untuk siswa, NIP untuk guru/staff
  class VARCHAR(50), -- Kelas (untuk siswa)
  photo_url VARCHAR(500),

  -- Device locking (single device per user)
  device_fingerprint VARCHAR(255),
  last_login_at DATETIME,
  last_login_ip VARCHAR(45),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE KEY unique_username (school_id, username),
  UNIQUE KEY unique_email (school_id, email),
  INDEX idx_school_role (school_id, role),
  INDEX idx_device (device_fingerprint)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- QUESTION BANK & EXAMS
-- ============================================

CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  INDEX idx_school (school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE question_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  category ENUM('topic', 'difficulty', 'competency', 'bloom_taxonomy') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tag (school_id, name, category),
  INDEX idx_school_category (school_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  subject_id INT,

  -- Question type
  type ENUM('multiple_choice', 'multiple_choice_complex', 'true_false', 'matching', 'short_answer', 'essay') NOT NULL,

  -- Question content
  question_text TEXT NOT NULL,
  question_media_type ENUM('none', 'image', 'audio', 'video'),
  question_media_url VARCHAR(500),

  -- Options (JSON for flexibility)
  -- For multiple_choice: [{id: 'A', text: 'Option A', media_type: 'image', media_url: '...', is_correct: true}, ...]
  -- For matching: {left: [{id: 1, text: '...', media_url: '...'}], right: [{id: 'A', text: '...'}], correct_pairs: [{left: 1, right: 'A'}]}
  options JSON,

  -- Correct answer (for auto-grading)
  correct_answer JSON, -- For short_answer: ["answer1", "answer2"], for true_false: true/false

  -- Grading
  points DECIMAL(5,2) DEFAULT 1.00,
  negative_points DECIMAL(5,2) DEFAULT 0.00, -- Minus untuk salah

  -- Explanation/feedback
  explanation TEXT,
  explanation_media_type ENUM('none', 'image', 'audio', 'video'),
  explanation_media_url VARCHAR(500),

  -- Metadata
  difficulty ENUM('easy', 'medium', 'hard'),
  estimated_time_seconds INT, -- Estimasi waktu mengerjakan

  -- Statistics (untuk item analysis)
  times_used INT DEFAULT 0,
  times_correct INT DEFAULT 0,
  discrimination_index DECIMAL(3,2), -- Range: -1 to 1

  -- Versioning
  version INT DEFAULT 1,
  parent_question_id INT, -- Jika ini versi baru dari soal lama

  -- Status
  status ENUM('draft', 'review', 'approved', 'archived') DEFAULT 'draft',
  created_by INT NOT NULL,
  reviewed_by INT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  FOREIGN KEY (parent_question_id) REFERENCES questions(id) ON DELETE SET NULL,
  INDEX idx_school_type (school_id, type),
  INDEX idx_school_status (school_id, status),
  INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE question_tag_mapping (
  question_id INT NOT NULL,
  tag_id INT NOT NULL,

  PRIMARY KEY (question_id, tag_id),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES question_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  subject_id INT,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,

  -- Type
  exam_type ENUM('uts', 'uas', 'quiz', 'practice', 'remedial', 'enrichment') NOT NULL,

  -- Timing
  duration_minutes INT NOT NULL, -- Durasi per siswa
  window_start_at DATETIME, -- Siswa bisa mulai dari waktu ini
  window_end_at DATETIME, -- Siswa harus selesai sebelum waktu ini

  -- Randomization
  randomize_questions BOOLEAN DEFAULT FALSE,
  randomize_options BOOLEAN DEFAULT FALSE,
  random_seed VARCHAR(50), -- Untuk reproducibility

  -- Question pool (jika pakai random dari pool)
  use_question_pool BOOLEAN DEFAULT FALSE,
  pool_size INT, -- Ambil X soal dari pool

  -- Grading
  passing_grade DECIMAL(5,2),
  show_score BOOLEAN DEFAULT TRUE, -- Siswa bisa lihat nilai?
  show_correct_answers BOOLEAN DEFAULT FALSE, -- Show kunci jawaban?
  show_feedback BOOLEAN DEFAULT FALSE, -- Show pembahasan?

  -- Settings
  allow_review BOOLEAN DEFAULT TRUE, -- Siswa bisa review jawaban sebelum submit?
  allow_skip BOOLEAN DEFAULT TRUE, -- Siswa bisa skip soal?
  require_fullscreen BOOLEAN DEFAULT TRUE,
  enable_proctoring BOOLEAN DEFAULT FALSE,

  -- Status
  status ENUM('draft', 'published', 'ongoing', 'completed', 'archived') DEFAULT 'draft',
  created_by INT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_school_status (school_id, status),
  INDEX idx_window (window_start_at, window_end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exam_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  question_id INT NOT NULL,
  order_number INT NOT NULL, -- Urutan soal (bisa di-randomize per siswa)
  points_override DECIMAL(5,2), -- Override poin default dari question

  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_exam_question (exam_id, question_id),
  INDEX idx_exam_order (exam_id, order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EXAM SESSIONS & ROOMS
-- ============================================

CREATE TABLE exam_rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  capacity INT,
  location VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  INDEX idx_school (school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exam_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  exam_id INT NOT NULL,
  room_id INT,

  session_name VARCHAR(255),
  session_date DATE NOT NULL,

  -- Assigned students
  max_students INT,

  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES exam_rooms(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_school_exam (school_id, exam_id),
  INDEX idx_date (session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exam_session_students (
  session_id INT NOT NULL,
  student_id INT NOT NULL,

  PRIMARY KEY (session_id, student_id),
  FOREIGN KEY (session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EXAM ATTEMPTS & ANSWERS
-- ============================================

CREATE TABLE exam_attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  exam_id INT NOT NULL,
  session_id INT,
  student_id INT NOT NULL,

  -- Timing
  started_at DATETIME,
  submitted_at DATETIME,
  duration_seconds INT, -- Actual waktu mengerjakan

  -- Download status
  downloaded_at DATETIME,
  download_checksum VARCHAR(64), -- SHA256 checksum untuk validasi

  -- Randomization (jika enabled)
  question_order JSON, -- [question_id1, question_id2, ...]
  random_seed VARCHAR(50),

  -- Grading
  score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  grade VARCHAR(2), -- A, B, C, D, E
  passed BOOLEAN,

  -- Grading status
  auto_graded_at DATETIME,
  manually_graded_at DATETIME,
  graded_by INT, -- Guru yang mengoreksi manual

  -- Sync status
  sync_status ENUM('pending', 'partial', 'completed', 'failed') DEFAULT 'pending',
  synced_at DATETIME,

  -- Status
  status ENUM('not_started', 'downloaded', 'in_progress', 'paused', 'submitted', 'graded') DEFAULT 'not_started',

  -- Device info
  device_fingerprint VARCHAR(255),
  device_info JSON, -- {model, os, browser, etc}

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES exam_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(id),
  UNIQUE KEY unique_attempt (exam_id, student_id),
  INDEX idx_school_exam (school_id, exam_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_sync (sync_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exam_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,

  -- Answer (format depends on question type)
  -- For multiple_choice: "A"
  -- For multiple_choice_complex: ["A", "C"]
  -- For true_false: true/false
  -- For matching: [{"left": 1, "right": "A"}, ...]
  -- For short_answer/essay: "text answer"
  answer_text TEXT,
  answer_json JSON,

  -- Media answer (untuk essay/short_answer dengan rekaman)
  answer_media_type ENUM('none', 'audio', 'video'),
  answer_media_url VARCHAR(500),
  answer_media_duration_seconds INT,
  answer_media_size_bytes BIGINT,

  -- Grading
  is_correct BOOLEAN, -- Untuk auto-grading
  points_earned DECIMAL(5,2),
  max_points DECIMAL(5,2),

  -- Manual grading (untuk essay/multimedia)
  manual_score DECIMAL(5,2),
  manual_feedback TEXT,
  graded_at DATETIME,

  -- Metadata
  time_spent_seconds INT, -- Waktu untuk soal ini
  attempt_count INT DEFAULT 1, -- Berapa kali dijawab (jika allow retry)

  -- Plagiarism check (untuk essay)
  similarity_percentage DECIMAL(5,2),
  flagged_for_review BOOLEAN DEFAULT FALSE,

  answered_at DATETIME,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attempt_question (attempt_id, question_id),
  INDEX idx_attempt (attempt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ACTIVITY LOGGING & MONITORING
-- ============================================

CREATE TABLE exam_activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  attempt_id INT NOT NULL,

  event_type ENUM(
    'exam_started',
    'question_viewed',
    'answer_changed',
    'answer_saved',
    'tab_switched',
    'app_minimized',
    'fullscreen_exited',
    'pause_triggered',
    'resume_triggered',
    'recording_started',
    'recording_stopped',
    'exam_submitted',
    'suspicious_activity'
  ) NOT NULL,

  event_data JSON, -- Additional context

  -- Device & network
  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3), -- Millisecond precision

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
  INDEX idx_attempt_type (attempt_id, event_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE system_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  school_id INT,
  user_id INT,

  log_level ENUM('debug', 'info', 'warning', 'error', 'critical') NOT NULL,
  message TEXT NOT NULL,
  context JSON,

  stack_trace TEXT,
  request_id VARCHAR(100),

  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_level_created (log_level, created_at),
  INDEX idx_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SYNC QUEUE (for offline uploads)
-- ============================================

CREATE TABLE sync_queue (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  attempt_id INT NOT NULL,

  sync_type ENUM('answer_text', 'answer_media', 'activity_log', 'full_submission') NOT NULL,

  -- Payload
  payload JSON NOT NULL,

  -- File info (for media uploads)
  file_path VARCHAR(500),
  file_size_bytes BIGINT,
  file_checksum VARCHAR(64),

  -- Chunked upload (for large files)
  total_chunks INT,
  uploaded_chunks INT DEFAULT 0,

  -- Status
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 5,

  error_message TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_retry (retry_count, status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  user_id INT NOT NULL,

  type ENUM('exam_reminder', 'exam_started', 'exam_completed', 'result_published', 'system_alert') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  link_url VARCHAR(500),

  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT TRAIL
-- ============================================

CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  school_id INT,
  user_id INT,

  entity_type VARCHAR(50) NOT NULL, -- 'exam', 'question', 'user', etc
  entity_id INT NOT NULL,

  action ENUM('create', 'read', 'update', 'delete', 'approve', 'archive') NOT NULL,

  old_values JSON,
  new_values JSON,

  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔌 API ENDPOINTS

### Authentication

```typescript
POST / api / auth / register; // Register new user (operator/superadmin only)
POST / api / auth / login; // Login (username/email + password)
POST / api / auth / refresh; // Refresh access token
POST / api / auth / logout; // Logout (invalidate refresh token)
GET / api / auth / me; // Get current user info
PUT / api / auth / profile; // Update profile
POST / api / auth / change - password; // Change password
POST / api / auth / forgot - password; // Request password reset
POST / api / auth / reset - password; // Reset password with token
POST / api / auth / lock - device; // Lock user to current device
```

### Schools (Superadmin only)

```typescript
GET    /api/schools                    // List all schools
POST   /api/schools                    // Create school
GET    /api/schools/:id                // Get school details
PUT    /api/schools/:id                // Update school
DELETE /api/schools/:id                // Delete school
GET    /api/schools/:id/stats          // School statistics (storage, users, etc)
```

### Users

```typescript
GET    /api/users                      // List users (filtered by school_id)
POST   /api/users                      // Create user
POST   /api/users/import               // Bulk import from Excel/CSV
GET    /api/users/:id                  // Get user details
PUT    /api/users/:id                  // Update user
DELETE /api/users/:id                  // Delete user
POST   /api/users/:id/reset-password   // Admin reset user password
GET    /api/users/:id/exams            // Get user's exams (siswa)
```

### Subjects

```typescript
GET    /api/subjects                   // List subjects
POST   /api/subjects                   // Create subject
GET    /api/subjects/:id               // Get subject
PUT    /api/subjects/:id               // Update subject
DELETE /api/subjects/:id               // Delete subject
```

### Question Tags

```typescript
GET    /api/tags                       // List tags (filter by category)
POST   /api/tags                       // Create tag
PUT    /api/tags/:id                   // Update tag
DELETE /api/tags/:id                   // Delete tag
```

### Questions (Question Bank)

```typescript
GET    /api/questions                  // List questions (with filters)
POST   /api/questions                  // Create question
POST   /api/questions/import           // Import from Excel
GET    /api/questions/:id              // Get question detail
PUT    /api/questions/:id              // Update question
DELETE /api/questions/:id              // Delete question
POST   /api/questions/:id/duplicate    // Duplicate question
POST   /api/questions/:id/review       // Submit for review
POST   /api/questions/:id/approve      // Approve question
POST   /api/questions/:id/archive      // Archive question
GET    /api/questions/:id/statistics   // Item analysis stats
POST   /api/questions/upload-media     // Upload media file (image/audio/video)
```

### Exams

```typescript
GET    /api/exams                      // List exams
POST   /api/exams                      // Create exam
POST   /api/exams/from-template        // Create from template
GET    /api/exams/:id                  // Get exam detail
PUT    /api/exams/:id                  // Update exam
DELETE /api/exams/:id                  // Delete exam
POST   /api/exams/:id/duplicate        // Duplicate exam
POST   /api/exams/:id/publish          // Publish exam
POST   /api/exams/:id/archive          // Archive exam
GET    /api/exams/:id/preview          // Preview exam (guru)
GET    /api/exams/:id/statistics       // Exam statistics
GET    /api/exams/:id/item-analysis    // Item analysis report
POST   /api/exams/:id/questions        // Add questions to exam
PUT    /api/exams/:id/questions/:qid   // Update question in exam
DELETE /api/exams/:id/questions/:qid   // Remove question from exam
POST   /api/exams/:id/randomize        // Generate randomized version
```

### Exam Rooms

```typescript
GET    /api/rooms                      // List rooms
POST   /api/rooms                      // Create room
GET    /api/rooms/:id                  // Get room
PUT    /api/rooms/:id                  // Update room
DELETE /api/rooms/:id                  // Delete room
```

### Exam Sessions

```typescript
GET    /api/sessions                   // List sessions
POST   /api/sessions                   // Create session
GET    /api/sessions/:id               // Get session
PUT    /api/sessions/:id               // Update session
DELETE /api/sessions/:id               // Delete session
POST   /api/sessions/:id/students      // Assign students
POST   /api/sessions/:id/students/import  // Bulk assign from Excel
DELETE /api/sessions/:id/students/:studentId  // Remove student
GET    /api/sessions/:id/monitoring    // Real-time monitoring
```

### Student Exam Flow (CRITICAL - Offline-First)

```typescript
// 1. Pre-Exam: Check available exams
GET    /api/student/exams              // List available exams for student
GET    /api/student/exams/:id/check    // Check if can start exam

// 2. Download Phase (ONLINE)
POST   /api/student/exams/:id/prepare  // Prepare exam data for download
GET    /api/student/exams/:id/download // Download complete exam package
                                       // Returns: {
                                       //   exam: {...},
                                       //   questions: [...],
                                       //   media_files: [{url, checksum}, ...],
                                       //   checksum: "...",
                                       //   attempt_id: 123
                                       // }

// 3. Start Exam (marks exam as started, can be offline)
POST   /api/student/attempts/:attemptId/start
                                       // Body: { started_at, device_fingerprint, device_info }

// 4. During Exam (OFFLINE - stored locally, synced later)
POST   /api/student/attempts/:attemptId/answers
                                       // Auto-save answers (can be batched)
                                       // Body: { answers: [{question_id, answer, ...}] }

POST   /api/student/attempts/:attemptId/activity
                                       // Log activity (can be batched)
                                       // Body: { events: [{type, data, timestamp}] }

POST   /api/student/attempts/:attemptId/pause
                                       // Pause exam

POST   /api/student/attempts/:attemptId/resume
                                       // Resume exam

// 5. Submit Exam (can be offline, queued)
POST   /api/student/attempts/:attemptId/submit
                                       // Body: { submitted_at, answers: [...], activity_logs: [...] }

// 6. Post-Exam: Upload media (ONLINE - chunked upload)
POST   /api/student/attempts/:attemptId/upload-media
                                       // Chunked upload for audio/video
                                       // Body: FormData with file chunk
                                       // Headers:
                                       //   X-Chunk-Index: 0
                                       //   X-Total-Chunks: 10
                                       //   X-File-Checksum: "..."

// 7. Sync Queue (for failed uploads - retry mechanism)
GET    /api/student/attempts/:attemptId/sync-status
POST   /api/student/attempts/:attemptId/retry-sync

// 8. Results (after grading)
GET    /api/student/attempts/:attemptId/result
```

### Grading

```typescript
GET    /api/grading/pending            // List pending manual grading
GET    /api/grading/:attemptId         // Get attempt for grading
POST   /api/grading/:attemptId/answers/:answerId
                                       // Grade single answer (manual)
                                       // Body: { score, feedback }
POST   /api/grading/:attemptId/complete // Mark grading as complete
POST   /api/grading/:attemptId/publish // Publish results to student
```

### Monitoring & Analytics

```typescript
GET    /api/monitoring/live            // Real-time exam monitoring
                                       // WebSocket: ws://api/monitoring/live
GET    /api/monitoring/sessions/:id    // Monitor specific session
GET    /api/monitoring/attempts/:id    // Monitor specific attempt
GET    /api/monitoring/activity-logs   // Filter activity logs

GET    /api/analytics/dashboard        // School dashboard stats
GET    /api/analytics/exams/:id        // Exam analytics
GET    /api/analytics/students/:id     // Student progress analytics
GET    /api/analytics/item-analysis    // Item analysis across exams
GET    /api/analytics/export           // Export reports (Excel/PDF/CSV)
```

### Media Management

```typescript
POST   /api/media/upload               // Upload media file
                                       // Body: FormData
                                       // Returns: { url, checksum, size }
DELETE /api/media/:id                  // Delete media file
GET    /api/media/storage-stats        // Storage usage stats
POST   /api/media/cleanup              // Cleanup unused media files
```

### Imports & Exports

```typescript
POST   /api/import/questions           // Import questions from Excel
POST   /api/import/students            // Import students from Excel/CSV
POST   /api/import/sessions            // Import session assignments
GET    /api/import/:id/status          // Check import job status

GET    /api/export/questions           // Export questions to Excel
GET    /api/export/results/:examId     // Export exam results
GET    /api/export/reports/:type       // Export various reports
```

### Notifications

```typescript
GET    /api/notifications              // List user notifications
PUT    /api/notifications/:id/read     // Mark as read
POST   /api/notifications/read-all     // Mark all as read
DELETE /api/notifications/:id          // Delete notification
```

### System & Admin

```typescript
GET / api / admin / health; // Health check
GET / api / admin / stats; // System statistics
GET / api / admin / logs; // System logs (paginated)
POST / api / admin / backup; // Create backup
POST / api / admin / restore; // Restore from backup
GET / api / admin / audit - logs; // Audit trail
```

---

## 🔐 SECURITY REQUIREMENTS

### 1. Authentication & Authorization

```typescript
// JWT Token Structure
interface JWTPayload {
  user_id: number;
  school_id: number;
  role: "siswa" | "guru" | "pengawas" | "operator" | "superadmin";
  device_fingerprint?: string;
  iat: number;
  exp: number;
}

// Access Token: 15 minutes expiry
// Refresh Token: 7 days expiry

// Device Locking
// - Generate device fingerprint from: User Agent + Screen Resolution + Timezone + Canvas fingerprint
// - Store in users.device_fingerprint
// - Validate on every request
// - Force logout if different device detected
```

### 2. Multi-Tenant Isolation

```typescript
// CRITICAL: Every query MUST filter by school_id
// Use NestJS Interceptor to inject school_id automatically

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // from JWT

    // Inject school_id into request
    request.schoolId = user.school_id;

    // Superadmin can access any school if school_id query param provided
    if (user.role === "superadmin" && request.query.school_id) {
      request.schoolId = parseInt(request.query.school_id);
    }

    return next.handle();
  }
}

// Repository base class with auto-filtering
export class BaseRepository<T> {
  async findAll(schoolId: number, options?: any) {
    return this.repository.find({
      where: { school_id: schoolId, ...options },
    });
  }
}
```

### 3. Data Encryption

```typescript
// Encrypt exam data before sending to client
import * as crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Use for exam download
const examData = JSON.stringify(exam);
const encryptedExam = encrypt(examData);
return { encrypted_data: encryptedExam, checksum: generateChecksum(examData) };
```

### 4. Time Validation

```typescript
// Validate client time vs server time
function validateTime(clientTime: Date): boolean {
  const serverTime = new Date();
  const diffMinutes =
    Math.abs(serverTime.getTime() - clientTime.getTime()) / 60000;

  // Allow max 5 minutes difference
  if (diffMinutes > 5) {
    throw new BadRequestException(
      "Time validation failed. Please sync your device time.",
    );
  }

  return true;
}
```

### 5. Checksum Validation

```typescript
// Generate checksum for data integrity
import * as crypto from "crypto";

function generateChecksum(data: any): string {
  const json = JSON.stringify(data);
  return crypto.createHash("sha256").update(json).digest("hex");
}

// Validate on download
function validateChecksum(data: any, expectedChecksum: string): boolean {
  const actualChecksum = generateChecksum(data);
  return actualChecksum === expectedChecksum;
}
```

### 6. Rate Limiting

```typescript
// Use @nestjs/throttler
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // seconds
      limit: 100, // requests per ttl
    }),
  ],
})
export class AppModule {}

// Apply to endpoints
@UseGuards(ThrottlerGuard)
@Post('submit')
async submitAnswer() { ... }

// Custom rate limit per school
@Throttle(5000, 60) // 5000 req/min per school
```

---

## 📤 OFFLINE SYNC MECHANISM

### Download Flow

```typescript
// 1. Prepare exam package
async prepareExamPackage(examId: number, studentId: number) {
  // Create attempt record
  const attempt = await this.createAttempt(examId, studentId);

  // Get exam with questions
  const exam = await this.getExamWithQuestions(examId);

  // Randomize if enabled
  if (exam.randomize_questions) {
    exam.questions = this.randomizeQuestions(exam.questions, attempt.random_seed);
  }

  if (exam.randomize_options) {
    exam.questions = exam.questions.map(q => this.randomizeOptions(q, attempt.random_seed));
  }

  // Collect all media URLs
  const mediaFiles = this.collectMediaUrls(exam);

  // Encrypt sensitive data
  const encryptedExam = this.encryptExamData(exam);

  // Generate checksum
  const checksum = this.generateChecksum(exam);

  return {
    attempt_id: attempt.id,
    exam: encryptedExam,
    media_files: mediaFiles,
    checksum: checksum,
    prepared_at: new Date(),
  };
}

// 2. Compress large data
import * as zlib from 'zlib';

function compressData(data: any): Buffer {
  const json = JSON.stringify(data);
  return zlib.gzipSync(json);
}
```

### Upload Flow (Chunked for large files)

```typescript
// Handle chunked media upload
async uploadMediaChunk(
  attemptId: number,
  file: Express.Multer.File,
  chunkIndex: number,
  totalChunks: number,
  fileChecksum: string,
) {
  const uploadDir = `./uploads/attempts/${attemptId}`;
  const chunkPath = `${uploadDir}/chunk_${chunkIndex}`;

  // Save chunk
  await fs.promises.writeFile(chunkPath, file.buffer);

  // Check if all chunks received
  const receivedChunks = await this.countChunks(uploadDir);

  if (receivedChunks === totalChunks) {
    // Merge chunks
    const mergedFile = await this.mergeChunks(uploadDir, totalChunks);

    // Validate checksum
    const actualChecksum = this.generateFileChecksum(mergedFile);
    if (actualChecksum !== fileChecksum) {
      throw new BadRequestException('File checksum mismatch');
    }

    // Move to final location
    const finalPath = await this.saveFinalFile(mergedFile, attemptId);

    // Update answer record
    await this.updateAnswerMediaUrl(attemptId, finalPath);

    // Cleanup chunks
    await this.cleanupChunks(uploadDir);

    return { success: true, url: finalPath };
  }

  return { success: false, received_chunks: receivedChunks, total_chunks: totalChunks };
}
```

### Retry Mechanism

```typescript
// Background job for retry failed syncs
import { Queue } from "bull";

@Injectable()
export class SyncQueueService {
  constructor(@InjectQueue("sync") private syncQueue: Queue) {}

  async addToQueue(syncItem: SyncQueueItem) {
    await this.syncQueue.add("process-sync", syncItem, {
      attempts: 5, // Max retries
      backoff: {
        type: "exponential",
        delay: 5000, // Start with 5 seconds
      },
      removeOnComplete: true,
    });
  }
}

// Processor
@Processor("sync")
export class SyncQueueProcessor {
  @Process("process-sync")
  async processSyncJob(job: Job<SyncQueueItem>) {
    const { attempt_id, sync_type, payload } = job.data;

    try {
      switch (sync_type) {
        case "answer_text":
          await this.syncAnswerText(attempt_id, payload);
          break;
        case "answer_media":
          await this.syncAnswerMedia(attempt_id, payload);
          break;
        case "activity_log":
          await this.syncActivityLog(attempt_id, payload);
          break;
        case "full_submission":
          await this.syncFullSubmission(attempt_id, payload);
          break;
      }

      // Update sync status
      await this.updateSyncStatus(attempt_id, "completed");
    } catch (error) {
      // Log error
      await this.logSyncError(attempt_id, error);

      // If max retries reached, mark as failed
      if (job.attemptsMade >= job.opts.attempts) {
        await this.updateSyncStatus(attempt_id, "failed");
      }

      throw error; // Re-throw for Bull to handle retry
    }
  }
}
```

---

## 🎯 AUTO-GRADING ENGINE

```typescript
@Injectable()
export class AutoGradingService {
  async gradeAttempt(attemptId: number) {
    const attempt = await this.getAttemptWithAnswers(attemptId);
    const exam = await this.getExam(attempt.exam_id);

    let totalScore = 0;
    let maxScore = 0;

    for (const answer of attempt.answers) {
      const question = await this.getQuestion(answer.question_id);
      const examQuestion = await this.getExamQuestion(exam.id, question.id);

      const points = examQuestion.points_override || question.points;
      maxScore += points;

      // Auto-grade based on question type
      const result = await this.gradeAnswer(question, answer);

      if (result.is_correct) {
        totalScore += points;
        await this.updateAnswer(answer.id, {
          is_correct: true,
          points_earned: points,
        });
      } else {
        // Apply negative points if configured
        const negativePoints = question.negative_points || 0;
        totalScore -= negativePoints;
        await this.updateAnswer(answer.id, {
          is_correct: false,
          points_earned: -negativePoints,
        });
      }
    }

    // Calculate percentage and grade
    const percentage = (totalScore / maxScore) * 100;
    const grade = this.calculateGrade(percentage);
    const passed = percentage >= (exam.passing_grade || 0);

    // Update attempt
    await this.updateAttempt(attemptId, {
      score: totalScore,
      max_score: maxScore,
      percentage: percentage,
      grade: grade,
      passed: passed,
      auto_graded_at: new Date(),
      status: "graded",
    });

    // Update question statistics
    await this.updateQuestionStatistics(attempt.answers);

    return { totalScore, maxScore, percentage, grade, passed };
  }

  private async gradeAnswer(
    question: Question,
    answer: ExamAnswer,
  ): Promise<{ is_correct: boolean }> {
    switch (question.type) {
      case "multiple_choice":
        return { is_correct: answer.answer_text === question.correct_answer };

      case "multiple_choice_complex":
        const studentAnswers = JSON.parse(answer.answer_json);
        const correctAnswers = question.correct_answer;
        return {
          is_correct: this.arraysEqual(
            studentAnswers.sort(),
            correctAnswers.sort(),
          ),
        };

      case "true_false":
        return { is_correct: answer.answer_json === question.correct_answer };

      case "matching":
        const studentPairs = JSON.parse(answer.answer_json);
        const correctPairs = question.correct_answer;
        return {
          is_correct: this.matchingPairsCorrect(studentPairs, correctPairs),
        };

      case "short_answer":
        // Fuzzy matching for short answer
        const isExactMatch = question.correct_answer.some(
          (correct) =>
            answer.answer_text.toLowerCase().trim() ===
            correct.toLowerCase().trim(),
        );

        if (isExactMatch) {
          return { is_correct: true };
        }

        // Check similarity (using Levenshtein distance or similar)
        const similarity = this.calculateSimilarity(
          answer.answer_text,
          question.correct_answer[0],
        );
        return { is_correct: similarity > 0.85 }; // 85% threshold

      case "essay":
        // Essay requires manual grading
        return { is_correct: null }; // Will be graded manually

      default:
        throw new Error(`Unknown question type: ${question.type}`);
    }
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "E";
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  private matchingPairsCorrect(student: any[], correct: any[]): boolean {
    if (student.length !== correct.length) return false;

    return student.every((pair) =>
      correct.some((cp) => cp.left === pair.left && cp.right === pair.right),
    );
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Implement Levenshtein distance or use library like 'string-similarity'
    // Return value between 0 and 1
    const distance = this.levenshteinDistance(
      str1.toLowerCase(),
      str2.toLowerCase(),
    );
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
```

---

## 📊 ITEM ANALYSIS

```typescript
@Injectable()
export class ItemAnalysisService {
  async calculateItemAnalysis(examId: number) {
    const attempts = await this.getCompletedAttempts(examId);
    const questions = await this.getExamQuestions(examId);

    const results = [];

    for (const question of questions) {
      const answers = await this.getAnswersForQuestion(
        question.id,
        attempts.map((a) => a.id),
      );

      // 1. Difficulty Index (P)
      const correctCount = answers.filter((a) => a.is_correct).length;
      const totalCount = answers.length;
      const difficulty = correctCount / totalCount; // 0 to 1

      // 2. Discrimination Index (D)
      const discrimination = await this.calculateDiscrimination(
        question.id,
        attempts,
      );

      // 3. Distractor Analysis (for multiple choice)
      let distractorAnalysis = null;
      if (
        question.type === "multiple_choice" ||
        question.type === "multiple_choice_complex"
      ) {
        distractorAnalysis = await this.analyzeDistractors(question, answers);
      }

      results.push({
        question_id: question.id,
        question_text: question.question_text,
        difficulty_index: difficulty,
        difficulty_category: this.categorizeDifficulty(difficulty),
        discrimination_index: discrimination,
        discrimination_category: this.categorizeDiscrimination(discrimination),
        distractor_analysis: distractorAnalysis,
        times_used: totalCount,
        times_correct: correctCount,
      });

      // Update question statistics
      await this.updateQuestionStats(question.id, {
        times_used: totalCount,
        times_correct: correctCount,
        discrimination_index: discrimination,
      });
    }

    return results;
  }

  private async calculateDiscrimination(
    questionId: number,
    attempts: ExamAttempt[],
  ): Promise<number> {
    // Rank students by total score
    const rankedAttempts = attempts.sort((a, b) => b.score - a.score);

    // Upper 27% and lower 27%
    const upperCount = Math.ceil(rankedAttempts.length * 0.27);
    const lowerCount = Math.floor(rankedAttempts.length * 0.27);

    const upperGroup = rankedAttempts.slice(0, upperCount);
    const lowerGroup = rankedAttempts.slice(-lowerCount);

    // Get correct answers in each group
    const upperCorrect = await this.countCorrectAnswers(
      questionId,
      upperGroup.map((a) => a.id),
    );
    const lowerCorrect = await this.countCorrectAnswers(
      questionId,
      lowerGroup.map((a) => a.id),
    );

    // D = (Upper correct / Upper total) - (Lower correct / Lower total)
    const discrimination =
      upperCorrect / upperCount - lowerCorrect / lowerCount;

    return discrimination; // Range: -1 to 1
  }

  private async analyzeDistractors(question: Question, answers: ExamAnswer[]) {
    const options = question.options; // Array of options
    const analysis = [];

    for (const option of options) {
      const count = answers.filter((a) => a.answer_text === option.id).length;
      const percentage = (count / answers.length) * 100;

      analysis.push({
        option_id: option.id,
        option_text: option.text,
        selected_count: count,
        selected_percentage: percentage,
        is_correct: option.is_correct,
      });
    }

    return analysis;
  }

  private categorizeDifficulty(p: number): string {
    if (p >= 0.8) return "Mudah";
    if (p >= 0.3) return "Sedang";
    return "Sulit";
  }

  private categorizeDiscrimination(d: number): string {
    if (d >= 0.4) return "Sangat Baik";
    if (d >= 0.3) return "Baik";
    if (d >= 0.2) return "Cukup";
    if (d >= 0.0) return "Perlu Revisi";
    return "Buruk (Perlu Diganti)";
  }
}
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### 1. Database Connection Pooling

```typescript
// TypeORM configuration
export const databaseConfig: TypeOrmModuleOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Connection pool
  poolSize: 200,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000,

  // Enable query caching with Redis
  cache: {
    type: "redis",
    options: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    },
    duration: 60000, // 1 minute
  },

  // Logging
  logging: process.env.NODE_ENV === "development",

  // Auto migrations
  synchronize: false, // NEVER true in production
  migrations: ["dist/migrations/*.js"],
};
```

### 2. Redis Caching Strategy

```typescript
@Injectable()
export class CacheService {
  constructor(@Inject("REDIS") private redis: Redis) {}

  // Cache exam data (rarely changes)
  async cacheExam(examId: number, data: any, ttl = 3600) {
    const key = `exam:${examId}`;
    await this.redis.set(key, JSON.stringify(data), "EX", ttl);
  }

  async getCachedExam(examId: number): Promise<any> {
    const key = `exam:${examId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache school config
  async cacheSchoolConfig(schoolId: number, data: any) {
    const key = `school:${schoolId}:config`;
    await this.redis.set(key, JSON.stringify(data), "EX", 86400); // 24 hours
  }

  // Invalidate cache on update
  async invalidateExamCache(examId: number) {
    const key = `exam:${examId}`;
    await this.redis.del(key);
  }
}
```

### 3. Query Optimization

```typescript
// Use select specific fields to reduce data transfer
async getExamsList(schoolId: number) {
  return this.examRepository.find({
    where: { school_id: schoolId },
    select: ['id', 'title', 'exam_type', 'status', 'window_start_at', 'window_end_at'],
    order: { created_at: 'DESC' },
  });
}

// Use pagination
async getExamsPaginated(schoolId: number, page = 1, limit = 20) {
  const [results, total] = await this.examRepository.findAndCount({
    where: { school_id: schoolId },
    take: limit,
    skip: (page - 1) * limit,
    order: { created_at: 'DESC' },
  });

  return {
    data: results,
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

// Use joins efficiently
async getExamWithQuestions(examId: number) {
  return this.examRepository.findOne({
    where: { id: examId },
    relations: ['questions', 'questions.question'], // Eager load
  });
}
```

### 4. Batch Operations

```typescript
// Batch insert answers
async saveAnswersBatch(attemptId: number, answers: CreateAnswerDto[]) {
  const entities = answers.map(answer => ({
    attempt_id: attemptId,
    question_id: answer.question_id,
    answer_text: answer.answer_text,
    answer_json: answer.answer_json,
    answered_at: new Date(),
  }));

  // Use insert instead of save for better performance
  await this.answerRepository
    .createQueryBuilder()
    .insert()
    .into(ExamAnswer)
    .values(entities)
    .orUpdate(['answer_text', 'answer_json', 'answered_at'], ['attempt_id', 'question_id'])
    .execute();
}
```

### 5. Compression

```typescript
// Compress API responses
import * as compression from "compression";

app.use(
  compression({
    level: 6, // Balance between speed and compression ratio
    threshold: 1024, // Only compress responses > 1KB
  }),
);
```

---

## 📝 LOGGING & MONITORING

### 1. Structured Logging

```typescript
import { Logger } from "@nestjs/common";
import * as winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "exam-api" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

// Usage
logger.info("Exam downloaded", { exam_id: 123, student_id: 456, school_id: 1 });
logger.error("Sync failed", { error: error.message, attempt_id: 789 });
```

### 2. Error Tracking (Sentry)

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Global exception filter
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    Sentry.captureException(exception);
    // ... handle exception
  }
}
```

### 3. Performance Monitoring

```typescript
// Custom middleware for response time tracking
export function performanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("API Request", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration_ms: duration,
      user_id: req.user?.id,
      school_id: req.user?.school_id,
    });

    // Alert if slow
    if (duration > 2000) {
      logger.warn("Slow API request", { url: req.url, duration_ms: duration });
    }
  });

  next();
}
```

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests

```typescript
describe("AutoGradingService", () => {
  it("should correctly grade multiple choice", async () => {
    const question = createMockQuestion("multiple_choice", "A");
    const answer = createMockAnswer("A");
    const result = await service.gradeAnswer(question, answer);
    expect(result.is_correct).toBe(true);
  });

  it("should correctly grade short answer with fuzzy matching", async () => {
    const question = createMockQuestion("short_answer", ["Jakarta"]);
    const answer = createMockAnswer("Djakarta"); // Typo
    const result = await service.gradeAnswer(question, answer);
    expect(result.is_correct).toBe(true); // Should still match
  });
});
```

### Integration Tests

```typescript
describe("Student Exam Flow (E2E)", () => {
  it("should complete full exam cycle", async () => {
    // 1. Login
    const loginResponse = await request(app).post("/api/auth/login").send({
      username: "student1",
      password: "test123",
    });
    const token = loginResponse.body.access_token;

    // 2. Download exam
    const downloadResponse = await request(app)
      .get("/api/student/exams/1/download")
      .set("Authorization", `Bearer ${token}`);
    expect(downloadResponse.status).toBe(200);
    const attemptId = downloadResponse.body.attempt_id;

    // 3. Start exam
    await request(app)
      .post(`/api/student/attempts/${attemptId}/start`)
      .set("Authorization", `Bearer ${token}`)
      .send({ started_at: new Date() });

    // 4. Submit answers
    await request(app)
      .post(`/api/student/attempts/${attemptId}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send({ answers: [...mockAnswers] });

    // 5. Submit exam
    const submitResponse = await request(app)
      .post(`/api/student/attempts/${attemptId}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ submitted_at: new Date() });
    expect(submitResponse.status).toBe(200);

    // 6. Check results
    const resultResponse = await request(app)
      .get(`/api/student/attempts/${attemptId}/result`)
      .set("Authorization", `Bearer ${token}`);
    expect(resultResponse.status).toBe(200);
    expect(resultResponse.body.status).toBe("graded");
  });
});
```

### Load Testing (K6)

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "5m", target: 1000 },
    { duration: "10m", target: 5000 },
    { duration: "5m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% < 2s
    http_req_failed: ["rate<0.01"], // Error < 1%
  },
};

export default function () {
  // Test download endpoint
  const res = http.get("https://api.exam.app/api/student/exams/1/download", {
    headers: { Authorization: `Bearer ${__ENV.TOKEN}` },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 2s": (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

---

## 📦 DEPLOYMENT CHECKLIST

### Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=exam_user
DB_PASSWORD=<strong_password>
DB_NAME=exam_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<redis_password>

# JWT
JWT_SECRET=<random_256_bit_key>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<random_256_bit_key>
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=<random_256_bit_key>

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=1073741824  # 1GB in bytes

# Sentry
SENTRY_DSN=<sentry_dsn>

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<password>

# Limits
MAX_CONCURRENT_USERS=5000
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### PM2 Ecosystem

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "exam-api",
      script: "./dist/main.js",
      instances: 4, // Use multiple cores
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "2G",
    },
  ],
};
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/exam-api
upstream backend {
    server localhost:3000;
    keepalive 256;
}

server {
    listen 80;
    server_name api.exam.app *.exam.app;

    client_max_body_size 1024M;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Subdomain $subdomain;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (media)
    location /media {
        alias /var/www/exam/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Database Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/mysql"
DB_NAME="exam_db"
DB_USER="exam_user"
DB_PASS="<password>"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/exam_db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "exam_db_*.sql.gz" -mtime +7 -delete

# Sync to external storage (optional)
# rclone copy $BACKUP_DIR remote:backups/mysql
```

---

## 🎯 SUCCESS CRITERIA

API is considered production-ready when:

1. ✅ All endpoints implemented and tested
2. ✅ Multi-tenant isolation working correctly
3. ✅ Offline sync mechanism functional (download → offline → upload)
4. ✅ Auto-grading accurate (>95%)
5. ✅ Load testing passed (5K concurrent users, <2s p95 response time)
6. ✅ Error rate < 0.1%
7. ✅ Database queries optimized (<100ms average)
8. ✅ Security audited (no critical vulnerabilities)
9. ✅ Logging & monitoring setup complete
10. ✅ Backup & recovery tested

---

## 📚 ADDITIONAL NOTES

### Madrasah-Specific Features

```typescript
// For Quranic content
interface QuranicQuestion {
  surah: string;
  ayah_start: number;
  ayah_end: number;
  recitation_url: string; // Murattal audio
  tajwid_type?: 'ikhfa' | 'idgham' | 'iqlab' | 'mad' | 'qalqalah';
}

// Hafalan checker (simple version - advanced requires AI)
async checkHafalanRecording(
  referenceAudioUrl: string,
  studentRecordingUrl: string,
): Promise<{ similarity_score: number; feedback: string }> {
  // Basic implementation: compare audio duration and waveform
  // Advanced: Use speech-to-text + Arabic NLP
  // Or: Use specialized Quran recitation API

  return {
    similarity_score: 0.85, // 0 to 1
    feedback: 'Good pronunciation, watch your tajwid on ayat 3',
  };
}
```

### Import Excel Format

```typescript
// Question import format
interface QuestionImportRow {
  question_text: string;
  type: "multiple_choice" | "true_false" | etc;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string; // Comma-separated
}

// Student import format
interface StudentImportRow {
  username: string;
  full_name: string;
  email: string;
  nis: string;
  class: string;
  password?: string; // Auto-generate if empty
}
```

---

## 🚨 CRITICAL REMINDERS

1. **ALWAYS filter by school_id** - Every query must include tenant filtering
2. **Validate time** - Check client time vs server time
3. **Verify checksums** - Ensure data integrity
4. **Encrypt sensitive data** - Exam content must be encrypted
5. **Lock devices** - Single device per student
6. **Rate limit** - Prevent abuse
7. **Log everything** - Activity tracking is critical
8. **Handle failures gracefully** - Retry mechanism for uploads
9. **Test offline flow** - Most critical feature
10. **Optimize queries** - 5K users = performance matters

---

## 📞 SUPPORT

For questions or clarifications during development:

- Document all design decisions
- Create API documentation with Swagger/OpenAPI
- Write comprehensive test coverage
- Set up CI/CD pipeline
- Monitor production metrics closely

---

**GOOD LUCK BUILDING THE API! 🚀**

This is a complex but well-defined system. Follow the specifications carefully, test thoroughly, and don't hesitate to ask questions during development.
