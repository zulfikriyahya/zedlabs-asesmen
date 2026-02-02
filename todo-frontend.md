# FRONTEND DEVELOPMENT PROMPT - Sistem Asesmen Sekolah/Madrasah

## 🎯 PROJECT OVERVIEW

Bangun frontend aplikasi menggunakan **Astro** untuk sistem asesmen/ujian sekolah dan madrasah dengan arsitektur **offline-first** dan **multi-tenant**. Frontend ini akan dibungkus dalam **Android WebView** untuk distribusi sebagai aplikasi native.

---

## 📋 CORE REQUIREMENTS

### Tech Stack

- **Framework:** Astro (SSR/SSG)
- **Styling:** TailwindCSS + DaisyUI
- **State Management:** Nanostores
- **Offline Storage:** IndexedDB (Dexie.js)
- **PWA:** Service Worker
- **Media Recording:** MediaRecorder API
- **Build Target:** Android WebView (WebView-optimized bundle)

### Key Features

1. **Offline-First Architecture** - Download soal, offline exam, sync jawaban
2. **Multi-Tenant** - Subdomain-based tenant routing
3. **6 Question Types** dengan multimedia support
4. **Media Recording** - Audio/Video recording (max 5 min, max 1GB)
5. **Real-time Auto-save** - Save jawaban setiap 30 detik
6. **Timer & Countdown** - Per-user duration tracking
7. **Activity Logging** - Track semua user activity
8. **Responsive Design** - Mobile-first (Android focus)
9. **Accessibility** - Font size, dark mode, keyboard navigation
10. **Arabic/Islamic Features** - Quran display, tajwid marking

---

## 🗂️ PROJECT STRUCTURE

```
exam-frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Sidebar.astro
│   │   │   ├── Footer.astro
│   │   │   └── MainLayout.astro
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.astro
│   │   │   └── DeviceLockWarning.astro
│   │   │
│   │   ├── exam/
│   │   │   ├── QuestionTypes/
│   │   │   │   ├── MultipleChoice.astro
│   │   │   │   ├── MultipleChoiceComplex.astro
│   │   │   │   ├── TrueFalse.astro
│   │   │   │   ├── Matching.astro
│   │   │   │   ├── ShortAnswer.astro
│   │   │   │   └── Essay.astro
│   │   │   │
│   │   │   ├── MediaPlayer.astro          // Audio/Video player (repeatable)
│   │   │   ├── MediaRecorder.astro        // Recording component
│   │   │   ├── QuestionNavigation.astro   // Question list sidebar
│   │   │   ├── ExamTimer.astro            // Countdown timer
│   │   │   ├── AutoSaveIndicator.astro    // "Saving..." indicator
│   │   │   ├── ProgressBar.astro          // Progress tracker
│   │   │   └── ExamInstructions.astro     // Pre-exam instructions
│   │   │
│   │   ├── sync/
│   │   │   ├── DownloadProgress.astro     // Download progress bar
│   │   │   ├── SyncStatus.astro           // Sync status widget
│   │   │   ├── UploadQueue.astro          // Upload queue viewer
│   │   │   └── ChecksumValidator.astro    // Data integrity check
│   │   │
│   │   ├── monitoring/
│   │   │   ├── LiveMonitor.astro          // Real-time monitoring (pengawas)
│   │   │   ├── StudentProgressCard.astro  // Per-student progress
│   │   │   └── ActivityLogViewer.astro    // Activity log list
│   │   │
│   │   ├── grading/
│   │   │   ├── ManualGradingCard.astro    // Essay/media grading UI
│   │   │   ├── AudioPlayer.astro          // Play student recording
│   │   │   └── GradingRubric.astro        // Scoring rubric
│   │   │
│   │   ├── questions/
│   │   │   ├── QuestionEditor.astro       // Rich question editor
│   │   │   ├── MediaUpload.astro          // Media file uploader
│   │   │   ├── OptionsEditor.astro        // Multiple choice options
│   │   │   ├── MatchingEditor.astro       // Matching pairs editor
│   │   │   └── TagSelector.astro          // Tag multiselect
│   │   │
│   │   ├── analytics/
│   │   │   ├── DashboardStats.astro       // Dashboard widgets
│   │   │   ├── ExamStatistics.astro       // Exam analytics
│   │   │   ├── ItemAnalysisChart.astro    // Item analysis visualization
│   │   │   └── StudentProgress.astro      // Student progress chart
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Input.astro
│   │   │   ├── Select.astro
│   │   │   ├── Modal.astro
│   │   │   ├── Alert.astro
│   │   │   ├── Toast.astro
│   │   │   ├── Card.astro
│   │   │   ├── Table.astro
│   │   │   ├── Tabs.astro
│   │   │   └── Loading.astro
│   │   │
│   │   └── madrasah/
│   │       ├── QuranDisplay.astro         // Quran text with tajwid
│   │       ├── TajwidMarker.astro         // Highlight tajwid rules
│   │       ├── ArabicKeyboard.astro       // Virtual Arabic keyboard
│   │       └── HafalanRecorder.astro      // Hafalan recording UI
│   │
│   ├── pages/
│   │   ├── index.astro                    // Landing page
│   │   ├── login.astro                    // Login page
│   │   │
│   │   ├── siswa/
│   │   │   ├── dashboard.astro
│   │   │   ├── ujian/
│   │   │   │   ├── index.astro            // List ujian
│   │   │   │   ├── download.astro         // Download page
│   │   │   │   ├── [id].astro             // Exam page (THE MOST IMPORTANT!)
│   │   │   │   └── result.astro           // Hasil ujian
│   │   │   └── profile.astro
│   │   │
│   │   ├── guru/
│   │   │   ├── dashboard.astro
│   │   │   ├── soal/
│   │   │   │   ├── index.astro            // List soal
│   │   │   │   ├── create.astro           // Buat soal baru
│   │   │   │   ├── [id]/edit.astro        // Edit soal
│   │   │   │   └── import.astro           // Import Excel
│   │   │   ├── ujian/
│   │   │   │   ├── index.astro            // List ujian
│   │   │   │   ├── create.astro           // Buat ujian
│   │   │   │   ├── [id]/edit.astro        // Edit ujian
│   │   │   │   ├── [id]/preview.astro     // Preview ujian
│   │   │   │   └── [id]/statistics.astro  // Analytics
│   │   │   ├── grading/
│   │   │   │   ├── index.astro            // List pending grading
│   │   │   │   └── [attemptId].astro      // Grade siswa
│   │   │   └── hasil.astro                // Hasil per ujian
│   │   │
│   │   ├── pengawas/
│   │   │   ├── dashboard.astro
│   │   │   └── monitoring/
│   │   │       ├── live.astro             // Live monitoring
│   │   │       └── session/[id].astro     // Monitor session
│   │   │
│   │   ├── operator/
│   │   │   ├── dashboard.astro
│   │   │   ├── sesi/
│   │   │   │   ├── index.astro
│   │   │   │   ├── create.astro
│   │   │   │   └── [id]/edit.astro
│   │   │   ├── ruang/
│   │   │   │   ├── index.astro
│   │   │   │   ├── create.astro
│   │   │   │   └── [id]/edit.astro
│   │   │   ├── peserta/
│   │   │   │   ├── index.astro
│   │   │   │   └── import.astro
│   │   │   └── laporan.astro
│   │   │
│   │   └── superadmin/
│   │       ├── dashboard.astro
│   │       ├── schools/
│   │       │   ├── index.astro
│   │       │   ├── create.astro
│   │       │   └── [id]/edit.astro
│   │       ├── users.astro
│   │       ├── settings.astro
│   │       └── audit-logs.astro
│   │
│   ├── stores/
│   │   ├── auth.ts                        // Nanostores - Auth state
│   │   ├── exam.ts                        // Current exam state
│   │   ├── answers.ts                     // Answers state (persisted)
│   │   ├── sync.ts                        // Sync queue & status
│   │   ├── offline.ts                     // Offline data cache
│   │   ├── timer.ts                       // Exam timer state
│   │   ├── ui.ts                          // UI state (theme, font size, etc)
│   │   └── activity.ts                    // Activity log queue
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                  // Axios instance with interceptors
│   │   │   ├── auth.ts                    // Auth endpoints
│   │   │   ├── exam.ts                    // Exam endpoints
│   │   │   ├── question.ts                // Question endpoints
│   │   │   ├── sync.ts                    // Sync endpoints
│   │   │   └── grading.ts                 // Grading endpoints
│   │   │
│   │   ├── db/
│   │   │   ├── indexedDB.ts               // IndexedDB wrapper (Dexie)
│   │   │   ├── schema.ts                  // DB schema definition
│   │   │   ├── encryption.ts              // AES encryption/decryption
│   │   │   └── migrations.ts              // DB version migrations
│   │   │
│   │   ├── offline/
│   │   │   ├── download.ts                // Background download manager
│   │   │   ├── sync.ts                    // Sync manager
│   │   │   ├── queue.ts                   // Upload queue manager
│   │   │   ├── compress.ts                // Compression utils
│   │   │   └── checksum.ts                // Checksum validation
│   │   │
│   │   ├── exam/
│   │   │   ├── randomizer.ts              // Question & option randomizer
│   │   │   ├── validator.ts               // Answer validator
│   │   │   ├── autoSave.ts                // Auto-save manager
│   │   │   ├── timer.ts                   // Timer controller
│   │   │   └── navigation.ts              // Question navigation logic
│   │   │
│   │   ├── media/
│   │   │   ├── recorder.ts                // MediaRecorder wrapper
│   │   │   ├── player.ts                  // Media player controller
│   │   │   ├── upload.ts                  // Chunked upload
│   │   │   └── compress.ts                // Media compression
│   │   │
│   │   ├── utils/
│   │   │   ├── network.ts                 // Network detection
│   │   │   ├── device.ts                  // Device fingerprint
│   │   │   ├── time.ts                    // Time validation
│   │   │   ├── storage.ts                 // Storage management
│   │   │   ├── validation.ts              // Form validation
│   │   │   └── format.ts                  // Date/number formatting
│   │   │
│   │   └── hooks/
│   │       ├── useExam.ts                 // Exam state hook
│   │       ├── useTimer.ts                // Timer hook
│   │       ├── useAutoSave.ts             // Auto-save hook
│   │       ├── useMediaRecorder.ts        // Recording hook
│   │       ├── useOnlineStatus.ts         // Network status hook
│   │       └── useDeviceWarnings.ts       // Battery/storage warnings
│   │
│   ├── types/
│   │   ├── exam.ts                        // Exam types
│   │   ├── question.ts                    // Question types
│   │   ├── answer.ts                      // Answer types
│   │   ├── user.ts                        // User types
│   │   ├── sync.ts                        // Sync types
│   │   └── api.ts                         // API response types
│   │
│   ├── styles/
│   │   ├── global.css                     // Global styles
│   │   ├── arabic.css                     // Arabic/Quran fonts
│   │   └── print.css                      // Print styles (for export)
│   │
│   └── middleware/
│       ├── auth.ts                        // Auth middleware
│       └── role.ts                        // Role-based access
│
├── public/
│   ├── service-worker.js                  // PWA service worker
│   ├── manifest.json                      // PWA manifest
│   ├── fonts/
│   │   ├── Amiri-Regular.ttf              // Arabic font
│   │   └── Scheherazade-Regular.ttf       // Quranic font
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── astro.config.mjs
├── tailwind.config.cjs
├── tsconfig.json
└── package.json
```

---

## 🗄️ INDEXEDDB SCHEMA (Dexie.js)

```typescript
// src/lib/db/schema.ts
import Dexie, { Table } from "dexie";

// Interfaces
export interface School {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string;
}

export interface User {
  id: number;
  school_id: number;
  username: string;
  email: string;
  role: "siswa" | "guru" | "pengawas" | "operator" | "superadmin";
  full_name: string;
  photo_url?: string;
  device_fingerprint?: string;
}

export interface DownloadedExam {
  exam_id: number;
  attempt_id: number;
  exam_data: string; // Encrypted JSON
  questions: string; // Encrypted JSON
  media_files: MediaFile[];
  checksum: string;
  downloaded_at: Date;
  expires_at: Date;
}

export interface MediaFile {
  id: string;
  url: string;
  local_path: string; // IndexedDB blob reference
  checksum: string;
  size: number;
  type: "image" | "audio" | "video";
  downloaded: boolean;
}

export interface ExamAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
  answer_media_type?: "audio" | "video";
  answer_media_blob?: Blob;
  answered_at: Date;
  synced: boolean;
}

export interface ActivityLog {
  id?: number;
  attempt_id: number;
  event_type: string;
  event_data?: any;
  timestamp: Date;
  synced: boolean;
}

export interface SyncQueueItem {
  id?: number;
  attempt_id: number;
  type: "answer" | "media" | "activity" | "submission";
  data: any;
  priority: number; // 1-5, 5 = highest
  retry_count: number;
  max_retries: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: Date;
  processed_at?: Date;
  error_message?: string;
}

export interface ExamState {
  attempt_id: number;
  current_question_index: number;
  time_remaining_seconds: number;
  started_at: Date;
  paused_at?: Date;
  pause_reason?: string;
  answers: Record<number, any>; // question_id => answer
  flags: number[]; // question_id marked for review
}

// Database class
export class ExamDatabase extends Dexie {
  schools!: Table<School, number>;
  users!: Table<User, number>;
  downloaded_exams!: Table<DownloadedExam, number>;
  media_files!: Table<MediaFile, string>;
  exam_answers!: Table<ExamAnswer, number>;
  activity_logs!: Table<ActivityLog, number>;
  sync_queue!: Table<SyncQueueItem, number>;
  exam_states!: Table<ExamState, number>;

  constructor() {
    super("ExamDB");

    this.version(1).stores({
      schools: "id, subdomain",
      users: "id, school_id, username",
      downloaded_exams: "exam_id, attempt_id, downloaded_at",
      media_files: "id, url, downloaded",
      exam_answers: "++id, attempt_id, question_id, synced",
      activity_logs: "++id, attempt_id, timestamp, synced",
      sync_queue: "++id, attempt_id, type, status, priority",
      exam_states: "attempt_id",
    });
  }
}

export const db = new ExamDatabase();
```

---

## 🔐 AUTHENTICATION & DEVICE LOCKING

### Login Flow

```typescript
// src/lib/api/auth.ts
import { apiClient } from "./client";
import { generateDeviceFingerprint } from "../utils/device";
import { db } from "../db/schema";
import { $authStore } from "@/stores/auth";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  school: School;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  // Generate device fingerprint
  const deviceFingerprint = await generateDeviceFingerprint();

  // Login API call
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    ...credentials,
    device_fingerprint: deviceFingerprint,
  });

  const { access_token, refresh_token, user, school } = response.data;

  // Store tokens in localStorage (encrypted)
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  // Store user & school in IndexedDB
  await db.users.put(user);
  await db.schools.put(school);

  // Update auth store
  $authStore.set({
    isAuthenticated: true,
    user,
    school,
    accessToken: access_token,
  });

  return response.data;
}

export async function logout() {
  // Call logout API
  await apiClient.post("/auth/logout");

  // Clear localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Clear IndexedDB (keep downloaded exams for now)
  // await db.delete();

  // Reset auth store
  $authStore.set({
    isAuthenticated: false,
    user: null,
    school: null,
    accessToken: null,
  });

  // Redirect to login
  window.location.href = "/login";
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await apiClient.post<{ access_token: string }>(
    "/auth/refresh",
    {
      refresh_token: refreshToken,
    },
  );

  const { access_token } = response.data;

  // Update stored token
  localStorage.setItem("access_token", access_token);

  return access_token;
}
```

### Device Fingerprinting

```typescript
// src/lib/utils/device.ts
export async function generateDeviceFingerprint(): Promise<string> {
  const components = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 3. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. Language
  components.push(navigator.language);

  // 5. Platform
  components.push(navigator.platform);

  // 6. Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency?.toString() || "0");

  // 7. Canvas fingerprint
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("ExamApp", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("ExamApp", 4, 17);
    components.push(canvas.toDataURL());
  }

  // Combine and hash
  const fingerprint = components.join("|||");
  const hash = await sha256(fingerprint);

  return hash;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
```

---

## 📥 OFFLINE DOWNLOAD FLOW

### Download Manager

```typescript
// src/lib/offline/download.ts
import { apiClient } from "../api/client";
import { db } from "../db/schema";
import { encrypt } from "../db/encryption";
import { generateChecksum } from "./checksum";

export interface DownloadProgress {
  phase: "preparing" | "exam_data" | "media_files" | "complete";
  current: number;
  total: number;
  currentFile?: string;
  percentage: number;
}

export async function downloadExam(
  examId: number,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  try {
    // Phase 1: Prepare exam
    onProgress?.({
      phase: "preparing",
      current: 0,
      total: 1,
      percentage: 0,
    });

    const prepareResponse = await apiClient.post(
      `/student/exams/${examId}/prepare`,
    );
    const { attempt_id } = prepareResponse.data;

    // Phase 2: Download exam data
    onProgress?.({
      phase: "exam_data",
      current: 0,
      total: 1,
      percentage: 10,
    });

    const downloadResponse = await apiClient.get(
      `/student/exams/${examId}/download`,
    );
    const { exam, questions, media_files, checksum } = downloadResponse.data;

    // Validate checksum
    const calculatedChecksum = generateChecksum({ exam, questions });
    if (calculatedChecksum !== checksum) {
      throw new Error("Checksum validation failed");
    }

    // Encrypt sensitive data
    const encryptedExam = encrypt(JSON.stringify(exam));
    const encryptedQuestions = encrypt(JSON.stringify(questions));

    // Store in IndexedDB
    await db.downloaded_exams.put({
      exam_id: examId,
      attempt_id: attempt_id,
      exam_data: encryptedExam,
      questions: encryptedQuestions,
      media_files: media_files,
      checksum: checksum,
      downloaded_at: new Date(),
      expires_at: new Date(exam.window_end_at),
    });

    // Phase 3: Download media files
    onProgress?.({
      phase: "media_files",
      current: 0,
      total: media_files.length,
      percentage: 20,
    });

    for (let i = 0; i < media_files.length; i++) {
      const mediaFile = media_files[i];

      onProgress?.({
        phase: "media_files",
        current: i + 1,
        total: media_files.length,
        currentFile: mediaFile.url,
        percentage: 20 + ((i + 1) / media_files.length) * 70,
      });

      await downloadMediaFile(mediaFile);
    }

    // Complete
    onProgress?.({
      phase: "complete",
      current: media_files.length,
      total: media_files.length,
      percentage: 100,
    });
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

async function downloadMediaFile(mediaFile: MediaFile): Promise<void> {
  try {
    // Download file as blob
    const response = await fetch(mediaFile.url);
    const blob = await response.blob();

    // Validate checksum
    const arrayBuffer = await blob.arrayBuffer();
    const calculatedChecksum = await sha256ArrayBuffer(arrayBuffer);

    if (calculatedChecksum !== mediaFile.checksum) {
      throw new Error(`Checksum mismatch for ${mediaFile.url}`);
    }

    // Store blob in IndexedDB
    await db.media_files.put({
      id: mediaFile.id,
      url: mediaFile.url,
      local_path: `blob:${mediaFile.id}`, // Reference to blob
      checksum: mediaFile.checksum,
      size: blob.size,
      type: mediaFile.type,
      downloaded: true,
    });

    // Store actual blob (Dexie handles this automatically)
    // If needed, can store in separate blobs table
  } catch (error) {
    console.error(`Failed to download ${mediaFile.url}:`, error);
    throw error;
  }
}
```

---

## 📝 EXAM PAGE (THE MOST CRITICAL!)

```astro
---
// src/pages/siswa/ujian/[id].astro
import MainLayout from '@/components/layout/MainLayout.astro';
import QuestionNavigation from '@/components/exam/QuestionNavigation.astro';
import ExamTimer from '@/components/exam/ExamTimer.astro';
import AutoSaveIndicator from '@/components/exam/AutoSaveIndicator.astro';

// Question type components
import MultipleChoice from '@/components/exam/QuestionTypes/MultipleChoice.astro';
import MultipleChoiceComplex from '@/components/exam/QuestionTypes/MultipleChoiceComplex.astro';
import TrueFalse from '@/components/exam/QuestionTypes/TrueFalse.astro';
import Matching from '@/components/exam/QuestionTypes/Matching.astro';
import ShortAnswer from '@/components/exam/QuestionTypes/ShortAnswer.astro';
import Essay from '@/components/exam/QuestionTypes/Essay.astro';

const { id } = Astro.params;
---

<MainLayout title="Ujian" hideNav={true}>
  <div id="exam-container" class="h-screen flex flex-col overflow-hidden">

    <!-- Header: Timer & Auto-save -->
    <div class="bg-base-200 p-4 flex justify-between items-center">
      <ExamTimer />
      <AutoSaveIndicator />
      <button id="submit-btn" class="btn btn-primary">Submit Ujian</button>
    </div>

    <div class="flex flex-1 overflow-hidden">

      <!-- Sidebar: Question Navigation -->
      <aside class="w-64 bg-base-100 border-r overflow-y-auto">
        <QuestionNavigation />
      </aside>

      <!-- Main: Question Display -->
      <main id="question-area" class="flex-1 overflow-y-auto p-6">
        <!-- Question will be dynamically rendered here -->
        <div id="current-question"></div>
      </main>

    </div>

  </div>

  <!-- Modals -->
  <div id="pause-modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Ujian Dijeda</h3>
      <p class="py-4">Ujian dijeda karena Anda keluar dari tampilan ujian.</p>
      <div class="modal-action">
        <button class="btn btn-primary" id="resume-btn">Lanjutkan Ujian</button>
      </div>
    </div>
  </div>

  <div id="submit-confirm-modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Konfirmasi Submit</h3>
      <p class="py-4">
        Anda telah menjawab <span id="answered-count">0</span> dari <span id="total-count">0</span> soal.
        <br>Yakin ingin submit ujian?
      </p>
      <div class="modal-action">
        <button class="btn" id="cancel-submit">Batal</button>
        <button class="btn btn-primary" id="confirm-submit">Ya, Submit</button>
      </div>
    </div>
  </div>

  <script>
    // Import dependencies
    import { db } from '@/lib/db/schema';
    import { decrypt } from '@/lib/db/encryption';
    import { ExamController } from '@/lib/exam/controller';
    import { AutoSaveManager } from '@/lib/exam/autoSave';
    import { TimerController } from '@/lib/exam/timer';
    import { ActivityLogger } from '@/lib/exam/activityLogger';

    // Initialize
    const examId = parseInt(window.location.pathname.split('/').pop()!);
    let examController: ExamController;
    let autoSaveManager: AutoSaveManager;
    let timerController: TimerController;
    let activityLogger: ActivityLogger;

    async function initExam() {
      try {
        // Load exam from IndexedDB
        const downloadedExam = await db.downloaded_exams.get(examId);
        if (!downloadedExam) {
          alert('Ujian belum didownload. Silakan download terlebih dahulu.');
          window.location.href = '/siswa/ujian';
          return;
        }

        // Decrypt exam data
        const exam = JSON.parse(decrypt(downloadedExam.exam_data));
        const questions = JSON.parse(decrypt(downloadedExam.questions));

        // Initialize controllers
        examController = new ExamController(exam, questions, downloadedExam.attempt_id);
        autoSaveManager = new AutoSaveManager(downloadedExam.attempt_id);
        timerController = new TimerController(exam.duration_minutes * 60);
        activityLogger = new ActivityLogger(downloadedExam.attempt_id);

        // Load saved state (if exam was paused)
        await examController.loadState();

        // Start exam
        await examController.start();
        await activityLogger.log('exam_started', { timestamp: new Date() });

        // Start timer
        timerController.start((timeRemaining) => {
          updateTimerDisplay(timeRemaining);

          // Auto-submit when time runs out
          if (timeRemaining === 0) {
            handleAutoSubmit();
          }

          // Warnings
          if (timeRemaining === 600) { // 10 minutes
            showTimeWarning('10 menit lagi!');
          }
          if (timeRemaining === 300) { // 5 minutes
            showTimeWarning('5 menit lagi!');
          }
          if (timeRemaining === 60) { // 1 minute
            showTimeWarning('1 menit lagi!');
          }
        });

        // Start auto-save (every 30 seconds)
        autoSaveManager.start(30000, async () => {
          const answers = examController.getAnswers();
          await db.exam_answers.bulkPut(answers);
          showAutoSaveIndicator();
        });

        // Render first question
        renderCurrentQuestion();

        // Setup event listeners
        setupEventListeners();

        // Detect activity
        setupActivityDetection();

      } catch (error) {
        console.error('Failed to initialize exam:', error);
        alert('Gagal memuat ujian. Silakan coba lagi.');
      }
    }

    function renderCurrentQuestion() {
      const question = examController.getCurrentQuestion();
      const questionArea = document.getElementById('current-question')!;

      // Clear previous content
      questionArea.innerHTML = '';

      // Render question based on type
      let componentHTML = '';

      switch (question.type) {
        case 'multiple_choice':
          componentHTML = renderMultipleChoice(question);
          break;
        case 'multiple_choice_complex':
          componentHTML = renderMultipleChoiceComplex(question);
          break;
        case 'true_false':
          componentHTML = renderTrueFalse(question);
          break;
        case 'matching':
          componentHTML = renderMatching(question);
          break;
        case 'short_answer':
          componentHTML = renderShortAnswer(question);
          break;
        case 'essay':
          componentHTML = renderEssay(question);
          break;
      }

      questionArea.innerHTML = componentHTML;

      // Load saved answer if exists
      const savedAnswer = examController.getAnswer(question.id);
      if (savedAnswer) {
        populateAnswer(question.type, savedAnswer);
      }

      // Setup answer change listeners
      setupAnswerListeners(question);

      // Log activity
      activityLogger.log('question_viewed', { question_id: question.id });
    }

    function setupAnswerListeners(question: any) {
      // Listen for answer changes
      const answerElements = document.querySelectorAll('[data-answer-input]');

      answerElements.forEach(element => {
        element.addEventListener('change', async () => {
          const answer = collectAnswer(question.type);
          examController.saveAnswer(question.id, answer);
          await activityLogger.log('answer_changed', {
            question_id: question.id,
            timestamp: new Date()
          });
        });
      });
    }

    function setupEventListeners() {
      // Navigation buttons
      document.getElementById('prev-btn')?.addEventListener('click', () => {
        examController.previousQuestion();
        renderCurrentQuestion();
      });

      document.getElementById('next-btn')?.addEventListener('click', () => {
        examController.nextQuestion();
        renderCurrentQuestion();
      });

      // Submit button
      document.getElementById('submit-btn')?.addEventListener('click', () => {
        showSubmitConfirmation();
      });

      document.getElementById('confirm-submit')?.addEventListener('click', async () => {
        await handleSubmit();
      });

      // Question navigation (sidebar)
      document.querySelectorAll('[data-question-index]').forEach(el => {
        el.addEventListener('click', (e) => {
          const index = parseInt((e.target as HTMLElement).dataset.questionIndex!);
          examController.goToQuestion(index);
          renderCurrentQuestion();
        });
      });
    }

    function setupActivityDetection() {
      // Detect tab/window switch
      document.addEventListener('visibilitychange', async () => {
        if (document.hidden) {
          await activityLogger.log('tab_switched', { timestamp: new Date() });

          // Pause exam
          timerController.pause();
          autoSaveManager.pause();
          showPauseModal('Anda keluar dari tampilan ujian');
        }
      });

      // Detect fullscreen exit
      document.addEventListener('fullscreenchange', async () => {
        if (!document.fullscreenElement) {
          await activityLogger.log('fullscreen_exited', { timestamp: new Date() });

          // Pause exam
          timerController.pause();
          showPauseModal('Anda keluar dari fullscreen');
        }
      });

      // Prevent copy-paste
      document.addEventListener('copy', (e) => {
        e.preventDefault();
        activityLogger.log('suspicious_activity', {
          type: 'copy_attempt',
          timestamp: new Date()
        });
      });

      document.addEventListener('paste', (e) => {
        e.preventDefault();
        activityLogger.log('suspicious_activity', {
          type: 'paste_attempt',
          timestamp: new Date()
        });
      });

      // Detect right-click
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }

    function showPauseModal(reason: string) {
      const modal = document.getElementById('pause-modal') as HTMLDialogElement;
      modal.querySelector('p')!.textContent = `Ujian dijeda. Alasan: ${reason}`;
      modal.showModal();

      // Resume button
      document.getElementById('resume-btn')?.addEventListener('click', async () => {
        await activityLogger.log('resume_triggered', { timestamp: new Date() });
        timerController.resume();
        autoSaveManager.resume();
        modal.close();
      }, { once: true });
    }

    async function handleSubmit() {
      try {
        // Stop timer & auto-save
        timerController.stop();
        autoSaveManager.stop();

        // Get all answers
        const answers = examController.getAnswers();

        // Save to IndexedDB
        await db.exam_answers.bulkPut(answers);

        // Mark as submitted (will be synced when online)
        const attemptId = examController.getAttemptId();
        await db.sync_queue.add({
          attempt_id: attemptId,
          type: 'submission',
          data: {
            submitted_at: new Date(),
            answers: answers,
            activity_logs: await activityLogger.getLogs(),
          },
          priority: 5, // Highest priority
          retry_count: 0,
          max_retries: 10,
          status: 'pending',
          created_at: new Date(),
        });

        // Log submission
        await activityLogger.log('exam_submitted', {
          timestamp: new Date(),
          answer_count: answers.length
        });

        // Show success message
        alert('Ujian berhasil disubmit! Data akan disinkronkan saat online.');

        // Redirect to result page
        window.location.href = `/siswa/ujian/result?attemptId=${attemptId}`;

      } catch (error) {
        console.error('Submit failed:', error);
        alert('Gagal submit ujian. Data telah disimpan dan akan dicoba lagi.');
      }
    }

    async function handleAutoSubmit() {
      alert('Waktu habis! Ujian akan disubmit otomatis.');
      await handleSubmit();
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initExam);
    } else {
      initExam();
    }
  </script>

</MainLayout>
```

---

## 📤 SYNC & UPLOAD FLOW

```typescript
// src/lib/offline/sync.ts
import { db, SyncQueueItem } from "../db/schema";
import { apiClient } from "../api/client";
import { uploadMediaChunked } from "../media/upload";

export class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;

  constructor() {
    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.stopSync();
    });
  }

  start() {
    // Check every 30 seconds if there's anything to sync
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, 30000);

    // Also try immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async processSyncQueue() {
    if (this.isSyncing) return;

    this.isSyncing = true;

    try {
      // Get pending items, sorted by priority (high to low)
      const pendingItems = await db.sync_queue
        .where("status")
        .equals("pending")
        .or("status")
        .equals("failed")
        .filter((item) => item.retry_count < item.max_retries)
        .sortBy("priority");

      for (const item of pendingItems.reverse()) {
        // High priority first
        await this.processItem(item);
      }
    } catch (error) {
      console.error("Sync queue processing failed:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processItem(item: SyncQueueItem) {
    try {
      // Update status to processing
      await db.sync_queue.update(item.id!, { status: "processing" });

      switch (item.type) {
        case "answer":
          await this.syncAnswer(item);
          break;
        case "media":
          await this.syncMedia(item);
          break;
        case "activity":
          await this.syncActivity(item);
          break;
        case "submission":
          await this.syncSubmission(item);
          break;
      }

      // Mark as completed
      await db.sync_queue.update(item.id!, {
        status: "completed",
        processed_at: new Date(),
      });

      // Emit sync progress event
      window.dispatchEvent(
        new CustomEvent("sync:progress", {
          detail: { item, status: "completed" },
        }),
      );
    } catch (error: any) {
      console.error(`Failed to sync item ${item.id}:`, error);

      // Increment retry count
      const newRetryCount = item.retry_count + 1;

      if (newRetryCount >= item.max_retries) {
        // Max retries reached, mark as failed
        await db.sync_queue.update(item.id!, {
          status: "failed",
          retry_count: newRetryCount,
          error_message: error.message,
        });

        // Emit error event
        window.dispatchEvent(
          new CustomEvent("sync:error", {
            detail: { item, error: error.message },
          }),
        );
      } else {
        // Reset to pending for retry
        await db.sync_queue.update(item.id!, {
          status: "pending",
          retry_count: newRetryCount,
          error_message: error.message,
        });
      }
    }
  }

  private async syncAnswer(item: SyncQueueItem) {
    const { attempt_id, answers } = item.data;

    await apiClient.post(`/student/attempts/${attempt_id}/answers`, {
      answers: answers,
    });
  }

  private async syncMedia(item: SyncQueueItem) {
    const { attempt_id, answer_id, media_blob, checksum } = item.data;

    // Chunked upload
    await uploadMediaChunked(
      attempt_id,
      answer_id,
      media_blob,
      checksum,
      (progress) => {
        window.dispatchEvent(
          new CustomEvent("sync:media-progress", {
            detail: { item, progress },
          }),
        );
      },
    );
  }

  private async syncActivity(item: SyncQueueItem) {
    const { attempt_id, events } = item.data;

    await apiClient.post(`/student/attempts/${attempt_id}/activity`, {
      events: events,
    });
  }

  private async syncSubmission(item: SyncQueueItem) {
    const { attempt_id, submitted_at, answers, activity_logs } = item.data;

    await apiClient.post(`/student/attempts/${attempt_id}/submit`, {
      submitted_at: submitted_at,
      answers: answers,
      activity_logs: activity_logs,
    });
  }

  async getSyncStatus(attemptId: number) {
    const items = await db.sync_queue
      .where("attempt_id")
      .equals(attemptId)
      .toArray();

    const total = items.length;
    const completed = items.filter((i) => i.status === "completed").length;
    const failed = items.filter((i) => i.status === "failed").length;
    const pending = items.filter(
      (i) => i.status === "pending" || i.status === "processing",
    ).length;

    return {
      total,
      completed,
      failed,
      pending,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}

// Initialize global sync manager
export const syncManager = new SyncManager();
```

---

## 🎤 MEDIA RECORDER COMPONENT

```astro
---
// src/components/exam/MediaRecorder.astro
interface Props {
  type: 'audio' | 'video';
  maxDuration: number; // seconds
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

const { type, maxDuration = 300 } = Astro.props; // Default 5 minutes
---

<div class="media-recorder card bg-base-200 p-4">
  <div class="flex items-center justify-between mb-4">
    <h3 class="font-bold">{type === 'audio' ? 'Rekam Audio' : 'Rekam Video'}</h3>
    <div class="text-lg font-mono" id="rec-timer">00:00</div>
  </div>

  {type === 'video' && (
    <video id="preview" class="w-full h-64 bg-black rounded mb-4" autoplay muted></video>
  )}

  {type === 'audio' && (
    <div class="h-32 flex items-center justify-center bg-base-300 rounded mb-4">
      <div id="audio-visualizer" class="flex gap-1">
        <!-- Audio bars will be rendered here -->
      </div>
    </div>
  )}

  <div class="flex gap-2 justify-center">
    <button id="start-rec" class="btn btn-error">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="6"/>
      </svg>
      Mulai Rekam
    </button>

    <button id="stop-rec" class="btn btn-primary" disabled>
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <rect x="6" y="6" width="8" height="8"/>
      </svg>
      Stop
    </button>

    <button id="retry-rec" class="btn btn-ghost" disabled>Ulangi</button>
  </div>

  <div id="playback-area" class="mt-4 hidden">
    <h4 class="font-semibold mb-2">Preview Rekaman</h4>
    {type === 'audio' ? (
      <audio id="playback-audio" class="w-full" controls></audio>
    ) : (
      <video id="playback-video" class="w-full rounded" controls></video>
    )}

    <div class="mt-2 flex gap-2 justify-end">
      <button id="confirm-rec" class="btn btn-success">Gunakan Rekaman Ini</button>
    </div>
  </div>
</div>

<script define:vars={{ type, maxDuration }}>
  let mediaRecorder;
  let recordedChunks = [];
  let stream;
  let startTime;
  let timerInterval;
  let recordingBlob;

  const startBtn = document.getElementById('start-rec');
  const stopBtn = document.getElementById('stop-rec');
  const retryBtn = document.getElementById('retry-rec');
  const confirmBtn = document.getElementById('confirm-rec');
  const timerEl = document.getElementById('rec-timer');
  const playbackArea = document.getElementById('playback-area');

  startBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
  retryBtn.addEventListener('click', retryRecording);
  confirmBtn.addEventListener('click', confirmRecording);

  async function startRecording() {
    try {
      // Request permissions
      const constraints = type === 'audio'
        ? { audio: true }
        : { audio: true, video: { facingMode: 'user' } };

      stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Setup preview
      if (type === 'video') {
        document.getElementById('preview').srcObject = stream;
      }

      // Setup MediaRecorder
      const options = type === 'audio'
        ? { mimeType: 'audio/webm;codecs=opus' }
        : { mimeType: 'video/webm;codecs=vp9' };

      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;

      // Start recording
      recordedChunks = [];
      mediaRecorder.start();
      startTime = Date.now();

      // Update UI
      startBtn.disabled = true;
      stopBtn.disabled = false;
      retryBtn.disabled = true;
      playbackArea.classList.add('hidden');

      // Start timer
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);

      // Auto-stop at max duration
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          stopRecording();
          alert(`Durasi maksimal ${maxDuration / 60} menit tercapai.`);
        }
      }, maxDuration * 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Gagal memulai rekaman. Pastikan izin mikrofon/kamera sudah diberikan.');
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Stop timer
      clearInterval(timerInterval);

      // Update UI
      startBtn.disabled = false;
      stopBtn.disabled = true;
      retryBtn.disabled = false;
    }
  }

  function handleRecordingStop() {
    // Create blob
    const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
    recordingBlob = new Blob(recordedChunks, { type: mimeType });

    // Calculate duration
    const duration = (Date.now() - startTime) / 1000;

    // Show playback
    const playbackEl = type === 'audio'
      ? document.getElementById('playback-audio')
      : document.getElementById('playback-video');

    playbackEl.src = URL.createObjectURL(recordingBlob);
    playbackArea.classList.remove('hidden');
  }

  function retryRecording() {
    // Reset
    recordedChunks = [];
    recordingBlob = null;
    timerEl.textContent = '00:00';
    playbackArea.classList.add('hidden');

    // Start new recording
    startRecording();
  }

  function confirmRecording() {
    if (!recordingBlob) return;

    const duration = (Date.now() - startTime) / 1000;

    // Call parent callback
    if (window.onRecordingComplete) {
      window.onRecordingComplete(recordingBlob, duration);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('recording-complete', {
      detail: { blob: recordingBlob, duration, type }
    }));
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Warning colors
    const remaining = maxDuration - elapsed;
    if (remaining <= 60) {
      timerEl.classList.add('text-error');
    } else if (remaining <= 120) {
      timerEl.classList.add('text-warning');
    }
  }
</script>

<style>
  #audio-visualizer {
    width: 200px;
    height: 80px;
  }

  #audio-visualizer > div {
    width: 4px;
    background: currentColor;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { height: 20%; }
    50% { height: 100%; }
  }
</style>
```

---

## 🌙 DARK MODE & ACCESSIBILITY

```typescript
// src/stores/ui.ts
import { atom } from "nanostores";

interface UIState {
  theme: "light" | "dark";
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
}

export const $uiStore = atom<UIState>({
  theme: "light",
  fontSize: "medium",
  highContrast: false,
});

// Load from localStorage
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("ui-settings");
  if (saved) {
    $uiStore.set(JSON.parse(saved));
  }
}

// Save to localStorage on change
$uiStore.subscribe((state) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("ui-settings", JSON.stringify(state));

    // Apply theme
    document.documentElement.setAttribute("data-theme", state.theme);

    // Apply font size
    document.documentElement.classList.remove(
      "text-sm",
      "text-base",
      "text-lg",
    );
    if (state.fontSize === "small")
      document.documentElement.classList.add("text-sm");
    if (state.fontSize === "large")
      document.documentElement.classList.add("text-lg");

    // Apply high contrast
    if (state.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }
});

export function setTheme(theme: "light" | "dark") {
  $uiStore.set({ ...$uiStore.get(), theme });
}

export function setFontSize(fontSize: "small" | "medium" | "large") {
  $uiStore.set({ ...$uiStore.get(), fontSize });
}

export function toggleHighContrast() {
  const current = $uiStore.get();
  $uiStore.set({ ...current, highContrast: !current.highContrast });
}
```

---

## 🕌 MADRASAH FEATURES

### Quran Display

```astro
---
// src/components/madrasah/QuranDisplay.astro
interface Props {
  surah: string;
  ayahStart: number;
  ayahEnd: number;
  showTajwid?: boolean;
  showTransliteration?: boolean;
}

const { surah, ayahStart, ayahEnd, showTajwid = true, showTransliteration = false } = Astro.props;
---

<div class="quran-display" dir="rtl">
  <div class="surah-header text-center mb-4">
    <h2 class="text-2xl font-arabic">{surah}</h2>
    <p class="text-sm text-base-content/70">Ayat {ayahStart} - {ayahEnd}</p>
  </div>

  <div id="ayat-container" class="space-y-4">
    <!-- Ayat akan dimuat via JS -->
  </div>

  <div class="audio-player mt-4">
    <audio id="murattal-player" class="w-full" controls>
      <source src={`/api/quran/audio/${surah}/${ayahStart}`} type="audio/mpeg">
    </audio>
  </div>
</div>

<script define:vars={{ surah, ayahStart, ayahEnd, showTajwid }}>
  async function loadAyat() {
    try {
      // Fetch ayat from API or local storage
      const response = await fetch(`/api/quran/${surah}/${ayahStart}/${ayahEnd}`);
      const ayatData = await response.json();

      const container = document.getElementById('ayat-container');

      ayatData.forEach(ayat => {
        const ayatDiv = document.createElement('div');
        ayatDiv.className = 'ayat-item p-4 bg-base-200 rounded';

        // Arabic text with tajwid
        let arabicText = ayat.text;
        if (showTajwid) {
          arabicText = applyTajwidColors(arabicText);
        }

        ayatDiv.innerHTML = `
          <div class="flex items-start gap-3">
            <span class="badge badge-primary">${ayat.number}</span>
            <p class="text-3xl font-arabic leading-loose flex-1">${arabicText}</p>
          </div>
          ${showTransliteration ? `
            <p class="text-sm text-base-content/70 mt-2 italic">${ayat.transliteration}</p>
          ` : ''}
          <p class="text-sm mt-2">${ayat.translation}</p>
        `;

        container.appendChild(ayatDiv);
      });

    } catch (error) {
      console.error('Failed to load ayat:', error);
    }
  }

  function applyTajwidColors(text) {
    // Apply tajwid color coding
    // Ikhfa (yellow), Idgham (green), Qalqalah (red), etc.
    // This requires tajwid rules database

    // Simplified example:
    return text
      .replace(/([نم])\s*([بم])/g, '<span class="tajwid-ikhfa">$1 $2</span>')
      .replace(/([نملر])\s*([نملر])/g, '<span class="tajwid-idgham">$1 $2</span>');
  }

  loadAyat();
</script>

<style>
  .font-arabic {
    font-family: 'Amiri', 'Traditional Arabic', serif;
  }

  .tajwid-ikhfa {
    background: rgba(255, 235, 59, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
  }

  .tajwid-idgham {
    background: rgba(76, 175, 80, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
  }

  .tajwid-qalqalah {
    background: rgba(244, 67, 54, 0.3);
    padding: 2px 4px;
    border-radius: 2px;
  }
</style>
```

---

## 📊 ANALYTICS & CHARTS

```typescript
// src/lib/analytics/charts.ts
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function createScoreDistributionChart(
  canvasId: string,
  scores: number[],
) {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

  // Create distribution bins
  const bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const distribution = bins.map((bin, i) => {
    if (i === bins.length - 1) return 0;
    return scores.filter((s) => s >= bin && s < bins[i + 1]).length;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: bins.slice(0, -1).map((b, i) => `${b}-${bins[i + 1]}`),
      datasets: [
        {
          label: "Jumlah Siswa",
          data: distribution,
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Distribusi Nilai",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

export function createItemAnalysisChart(
  canvasId: string,
  questions: { difficulty: number; discrimination: number; label: string }[],
) {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

  new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Soal",
          data: questions.map((q) => ({
            x: q.difficulty,
            y: q.discrimination,
          })),
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          pointRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Item Analysis (Difficulty vs Discrimination)",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const q = questions[context.dataIndex];
              return `${q.label}: D=${q.difficulty.toFixed(2)}, Disc=${q.discrimination.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Difficulty Index (P)",
          },
          min: 0,
          max: 1,
        },
        y: {
          title: {
            display: true,
            text: "Discrimination Index (D)",
          },
          min: -1,
          max: 1,
        },
      },
    },
  });
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Code Splitting

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],

  output: "hybrid", // SSR for dynamic pages, SSG for static

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "exam-engine": [
              "./src/lib/exam/controller",
              "./src/lib/exam/autoSave",
              "./src/lib/exam/timer",
            ],
            media: [
              "./src/lib/media/recorder",
              "./src/lib/media/player",
              "./src/lib/media/upload",
            ],
            offline: [
              "./src/lib/offline/download",
              "./src/lib/offline/sync",
              "./src/lib/db/indexedDB",
            ],
          },
        },
      },
    },
  },
});
```

### Image Optimization

```astro
---
import { Image } from 'astro:assets';
import questionImage from '@/assets/question.jpg';
---

<Image
  src={questionImage}
  alt="Question image"
  width={800}
  height={600}
  format="webp"
  loading="lazy"
/>
```

### Service Worker (PWA)

```javascript
// public/service-worker.js
const CACHE_NAME = "exam-app-v1";
const OFFLINE_CACHE = "exam-offline-v1";

const STATIC_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
  "/fonts/Amiri-Regular.ttf",
  // Add more static assets
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - network first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(OFFLINE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        }),
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Cache for future use
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    }),
  );
});
```

---

## 🚨 ERROR HANDLING & WARNINGS

```typescript
// src/lib/utils/warnings.ts
export async function checkDeviceRequirements() {
  const warnings = [];

  // 1. Check storage
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const availableGB = (estimate.quota - estimate.usage) / 1024 ** 3;

    if (availableGB < 2) {
      warnings.push({
        type: "storage",
        severity: "error",
        message: `Storage tersisa hanya ${availableGB.toFixed(2)} GB. Minimal 2 GB diperlukan. Silakan kosongkan storage.`,
      });
    }
  }

  // 2. Check battery
  if ("getBattery" in navigator) {
    const battery = await (navigator as any).getBattery();

    if (battery.level < 0.2 && !battery.charging) {
      warnings.push({
        type: "battery",
        severity: "warning",
        message: `Baterai tersisa ${(battery.level * 100).toFixed(0)}%. Charge device Anda.`,
      });
    }
  }

  // 3. Check internet (for download phase)
  if (!navigator.onLine) {
    warnings.push({
      type: "network",
      severity: "error",
      message:
        "Tidak ada koneksi internet. Silakan hubungkan ke WiFi untuk download soal.",
    });
  }

  // 4. Check browser compatibility
  if (!("indexedDB" in window)) {
    warnings.push({
      type: "compatibility",
      severity: "error",
      message:
        "Browser Anda tidak mendukung fitur offline. Gunakan browser terbaru.",
    });
  }

  if (!("mediaDevices" in navigator)) {
    warnings.push({
      type: "compatibility",
      severity: "error",
      message:
        "Browser Anda tidak mendukung rekaman media. Gunakan browser terbaru.",
    });
  }

  return warnings;
}

export function showWarningModal(warnings: any[]) {
  const modal = document.createElement("div");
  modal.className = "modal modal-open";

  const hasErrors = warnings.some((w) => w.severity === "error");

  modal.innerHTML = `
    <div class="modal-box">
      <h3 class="font-bold text-lg">${hasErrors ? "Perhatian!" : "Peringatan"}</h3>
      <div class="py-4 space-y-2">
        ${warnings
          .map(
            (w) => `
          <div class="alert ${w.severity === "error" ? "alert-error" : "alert-warning"}">
            <span>${w.message}</span>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="modal-action">
        ${
          hasErrors
            ? `
          <button class="btn" onclick="window.location.href='/siswa/dashboard'">Kembali</button>
        `
            : `
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Lanjutkan</button>
        `
        }
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}
```

---

## 🎨 TAILWIND & DAISYUI CONFIG

```javascript
// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["Amiri", "Traditional Arabic", "serif"],
        quran: ["Scheherazade", "serif"],
      },
      fontSize: {
        // Support for zoom in/out
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#10b981",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#10b981",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
};
```

---

## 📱 ANDROID WEBVIEW INTEGRATION

### MainActivity.java (Example)

```java
package com.example.examapp;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.webkit.JavascriptInterface;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);

        // Enable JavaScript
        webView.getSettings().setJavaScriptEnabled(true);

        // Enable DOM storage (for IndexedDB)
        webView.getSettings().setDomStorageEnabled(true);

        // Enable database
        webView.getSettings().setDatabaseEnabled(true);

        // Enable geolocation
        webView.getSettings().setGeolocationEnabled(true);

        // Enable media playback
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);

        // Set user agent
        webView.getSettings().setUserAgentString(
            webView.getSettings().getUserAgentString() + " ExamApp/1.0"
        );

        // Set WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return false; // Let WebView handle the URL
            }
        });

        // Set WebChromeClient for permissions
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // Auto-grant mic/camera permissions for exam
                request.grant(request.getResources());
            }
        });

        // Add JavaScript interface for native features
        webView.addJavascriptInterface(new NativeBridge(), "Android");

        // Load app
        webView.loadUrl("https://exam.app");
    }

    public class NativeBridge {
        @JavascriptInterface
        public String getDeviceInfo() {
            JSONObject info = new JSONObject();
            info.put("model", Build.MODEL);
            info.put("os", "Android " + Build.VERSION.RELEASE);
            info.put("manufacturer", Build.MANUFACTURER);
            return info.toString();
        }

        @JavascriptInterface
        public boolean checkStorageSpace() {
            StatFs stat = new StatFs(Environment.getDataDirectory().getPath());
            long availableBytes = stat.getAvailableBlocksLong() * stat.getBlockSizeLong();
            long availableGB = availableBytes / (1024 * 1024 * 1024);
            return availableGB >= 2;
        }

        @JavascriptInterface
        public int getBatteryLevel() {
            IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent battery = registerReceiver(null, filter);
            int level = battery.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
            int scale = battery.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
            return (int) ((level / (float) scale) * 100);
        }
    }
}
```

---

## ✅ DEPLOYMENT CHECKLIST

### Build Configuration

```bash
# package.json
{
  "name": "exam-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "daisyui": "^4.0.0",
    "nanostores": "^0.10.0",
    "@nanostores/react": "^0.7.0",
    "dexie": "^3.2.0",
    "axios": "^1.6.0",
    "chart.js": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

### Environment Variables

```bash
# .env.production
PUBLIC_API_URL=https://api.exam.app
PUBLIC_SCHOOL_SUBDOMAIN=your-school
PUBLIC_APP_VERSION=1.0.0
```

### Build & Deploy

```bash
# Build for production
npm run build

# Output will be in /dist

# Test production build
npm run preview

# Deploy to server
rsync -avz --delete dist/ user@server:/var/www/exam-frontend/
```

---

## 🎯 SUCCESS CRITERIA

Frontend is production-ready when:

1. ✅ All pages implemented and responsive
2. ✅ Offline download & sync working flawlessly
3. ✅ Exam page fully functional (all question types)
4. ✅ Media recorder working (audio & video)
5. ✅ Auto-save working reliably
6. ✅ Timer accurate and persistent
7. ✅ Activity logging complete
8. ✅ Dark mode & accessibility features working
9. ✅ Load time < 3s on 3G
10. ✅ Bundle size < 1MB (initial load)
11. ✅ PWA installable
12. ✅ Works offline 100%
13. ✅ Compatible with Android WebView
14. ✅ No console errors
15. ✅ Security best practices followed

---

## 📚 ADDITIONAL NOTES

### Best Practices

1. **Always encrypt** exam data in IndexedDB
2. **Always validate** checksums for downloaded content
3. **Always log** user activities during exam
4. **Always save** exam state (resume-able)
5. **Always show** sync status to user
6. **Never** send sensitive data unencrypted
7. **Never** store tokens in localStorage unencrypted
8. **Never** trust client time (validate with server)

### Testing Checklist

- [ ] Test on various Android devices (5 min, 7 inch, 10 inch)
- [ ] Test offline mode (airplane mode)
- [ ] Test with slow network (3G)
- [ ] Test with limited storage (<2GB)
- [ ] Test battery drain during exam
- [ ] Test app kill & resume
- [ ] Test media recording quality
- [ ] Test chunked upload for large files
- [ ] Test sync retry mechanism
- [ ] Test time validation
- [ ] Test device lock (single device)
- [ ] Test all question types
- [ ] Test dark mode
- [ ] Test font size adjustment
- [ ] Test Arabic/Quran display

---

## 🚀 PRIORITY IMPLEMENTATION ORDER

### Phase 1: MVP (Essential)

1. Authentication & device lock
2. Exam download system
3. Basic exam page (at least multiple choice)
4. Timer & auto-save
5. Offline storage (IndexedDB)
6. Basic sync mechanism
7. Answer submission

### Phase 2: Core Features

8. All 6 question types
9. Media player (for question media)
10. Media recorder (audio/video answers)
11. Activity logging
12. Question navigation
13. Chunked upload
14. Retry mechanism

### Phase 3: Advanced

15. Analytics dashboard
16. Grading interface
17. Monitoring (for pengawas)
18. Import/export features
19. Madrasah features (Quran, tajwid)
20. Dark mode & accessibility

### Phase 4: Polish

21. Performance optimization
22. PWA features
23. Error handling improvements
24. UI/UX refinements
25. Documentation

---

## 🎉 FINAL NOTES

This is a **complex, mission-critical frontend** for an exam system. The most important aspects are:

1. **Reliability** - Must work 100% offline
2. **Data integrity** - Never lose student answers
3. **Security** - Protect exam content
4. **Performance** - Smooth on low-end devices
5. **User experience** - Stress-free for students

Take your time to implement features correctly. Test thoroughly before deployment. The exam experience will make or break this system!

**GOOD LUCK BUILDING! 🚀**
