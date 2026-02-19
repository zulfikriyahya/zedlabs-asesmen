# Exam Frontend

Web-based examination system untuk sekolah dan madrasah dengan kemampuan offline penuh, dibangun dengan Next.js (App Router).

---

## Features

### Core System
- Offline-first: download paket soal → ujian offline → sinkronisasi via PowerSync
- Multi-tenant dengan subdomain-based routing per institusi
- PWA: installable sebagai native app di Android dan iOS
- Enkripsi paket soal di sisi klien via Web Crypto API

### Soal & Ujian
- 6 tipe soal: pilihan ganda, pilihan ganda kompleks, benar/salah, menjodohkan, isian singkat, uraian/esai
- Dukungan multimedia pada soal dan jawaban: gambar, audio, video
- Perekaman jawaban audio/video langsung dari perangkat (maks. 5 menit, maks. 1 GB)
- Auto-save jawaban setiap 30 detik ke IndexedDB (Dexie)
- Timer per peserta dengan notifikasi peringatan waktu tersisa

### Antarmuka & Aksesibilitas
- Desain mobile-first, dioptimalkan untuk perangkat Android
- Kontrol ukuran font, dark mode, dan navigasi keyboard
- Fitur Arab/Islam: tampilan teks Al-Quran, penanda tajwid, keyboard Arab
- Responsive untuk tablet dan desktop

### Keamanan & Monitoring
- Activity logging seluruh aksi peserta selama ujian berlangsung
- Device fingerprinting untuk verifikasi perangkat terdaftar
- Content Security Policy ketat via `next-safe`

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS, DaisyUI |
| State Management | Zustand (persisted state) |
| Offline Storage | Dexie (IndexedDB) |
| Offline Sync | PowerSync |
| HTTP Client | ky |
| Validasi | Zod |
| Enkripsi | Web Crypto API |
| Kompresi | CompressionStream (native) |
| Grafik & Chart | Chart.js |
| Tanggal | date-fns |
| Security Headers | next-safe |

---

## Architecture Overview

```
Browser (Offline-capable PWA)
        │
        ├── Next.js App Router
        │    ├── [tenant].exam.app/         ← subdomain routing
        │    ├── /exam/[sessionId]/         ← ruang ujian
        │    ├── /exam/[sessionId]/review   ← review jawaban
        │    └── /dashboard/               ← monitoring (guru/admin)
        │
        ├── Zustand Store
        │    ├── authStore       (session, token, device)
        │    ├── examStore       (paket soal, timer, status)
        │    ├── answerStore     (jawaban, auto-save state)
        │    └── syncStore       (antrian sync, status koneksi)
        │
        ├── Dexie (IndexedDB)
        │    ├── examPackages    (soal terenkripsi)
        │    ├── answers         (jawaban peserta)
        │    ├── activityLogs    (log aktivitas)
        │    └── syncQueue       (antrian submission)
        │
        └── PowerSync
             └── Sinkronisasi dua arah dengan backend saat online
```

---

## Offline Flow

```
1. DOWNLOAD
   Peserta login → verifikasi device → download paket soal terenkripsi
   → simpan ke IndexedDB via Dexie

2. EXAM (online atau offline)
   Buka paket → dekripsi di memori via Web Crypto API
   → jawab soal → auto-save ke IndexedDB setiap 30 detik
   → rekam audio/video → simpan blob ke IndexedDB

3. SYNC
   Koneksi tersedia → PowerSync push jawaban ke backend
   → idempotency key mencegah duplikasi → konfirmasi dari server
   → tandai sesi selesai di IndexedDB
```

---

## Security Model

- **Enkripsi soal** — Paket soal dienkripsi dengan key unik per sesi menggunakan Web Crypto API (AES-GCM). Key tidak pernah disimpan di storage, hanya di memori selama sesi aktif.
- **CSP ketat** — `next-safe` mengkonfigurasi Content Security Policy untuk mencegah XSS, terutama kritis karena ada eksekusi Web Crypto di klien.
- **Device locking** — Fingerprint perangkat diverifikasi backend saat download dan sync. Perangkat tidak terdaftar ditolak.
- **Activity log** — Setiap perpindahan tab, blur window, paste, dan aksi mencurigakan dicatat ke IndexedDB dan disinkronkan ke backend.

---

## Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=https://exam.example.com
NEXT_PUBLIC_API_URL=https://api.example.com

# PowerSync
NEXT_PUBLIC_POWERSYNC_URL=https://sync.example.com

# Tenant
NEXT_PUBLIC_TENANT_DOMAIN=exam.example.com

# Feature Flags
NEXT_PUBLIC_ENABLE_RECORDING=true
NEXT_PUBLIC_AUTOSAVE_INTERVAL=30000
NEXT_PUBLIC_MAX_RECORDING_DURATION=300
NEXT_PUBLIC_MAX_RECORDING_SIZE=1073741824
```

---

## Halaman Utama

| Route | Deskripsi |
|---|---|
| `/` | Landing / redirect ke login |
| `/login` | Login peserta dengan verifikasi device |
| `/exam/[sessionId]` | Ruang ujian utama |
| `/exam/[sessionId]/review` | Review jawaban sebelum submit |
| `/exam/[sessionId]/result` | Hasil ujian (jika langsung tersedia) |
| `/dashboard` | Dashboard monitoring guru/admin |
| `/dashboard/sessions/[id]` | Detail sesi ujian real-time |
| `/dashboard/analytics/[id]` | Item analysis dan statistik |

---

## Zustand Store Structure

```typescript
// examStore — inti state ujian
interface ExamStore {
  package: ExamPackage | null
  currentQuestion: number
  timeRemaining: number
  status: 'idle' | 'downloading' | 'ready' | 'active' | 'paused' | 'submitted'
  startExam: () => void
  submitExam: () => Promise<void>
}

// answerStore — jawaban dan auto-save
interface AnswerStore {
  answers: Record<string, Answer>
  isDirty: boolean
  lastSaved: Date | null
  setAnswer: (questionId: string, value: Answer) => void
  persistToDexie: () => Promise<void>
}

// syncStore — status koneksi dan antrian
interface SyncStore {
  isOnline: boolean
  pendingCount: number
  lastSyncAt: Date | null
  syncNow: () => Promise<void>
}
```

---

## Testing

```bash
# Unit test
vitest

# Unit test watch mode
vitest --watch

# E2E test (Playwright)
playwright test

# E2E test dengan UI
playwright test --ui
```

---

## PWA & Performance

- Service Worker dikelola PowerSync; tidak ada konflik dengan Next.js SW
- Lazy load komponen soal per tipe untuk mengurangi initial bundle
- Gambar soal di-cache di IndexedDB saat download paket, bukan saat ujian berlangsung
- Video dan audio jawaban di-chunk sebelum disimpan untuk menghindari memory pressure pada perangkat low-end Android

---

## Deployment Checklist

- [ ] `next-safe` CSP dikonfigurasi dan diverifikasi tidak memblokir Web Crypto atau PowerSync
- [ ] Subdomain wildcard `*.exam.example.com` diarahkan ke server yang sama
- [ ] Service Worker PowerSync tidak konflik dengan cache Next.js
- [ ] Auto-save interval diuji pada kondisi storage IndexedDB hampir penuh
- [ ] Recording diuji pada perangkat Android low-end (RAM 2–3 GB)
- [ ] Offline flow diuji end-to-end: download → airplane mode → ujian → sync
- [ ] Playwright E2E mencakup skenario offline (mock service worker)
- [ ] Semua env variable production tidak mengandung nilai development/staging
