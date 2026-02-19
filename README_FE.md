# Exam Frontend

Web-based examination system untuk sekolah dan madrasah dengan kemampuan offline penuh, dibangun dengan Next.js 15 (App Router).

---

## Tech Stack

| Layer           | Teknologi                            |
|-----------------|--------------------------------------|
| Framework       | Next.js 15 (App Router), TypeScript  |
| Styling         | Tailwind CSS, DaisyUI                |
| State           | Zustand (persisted)                  |
| Offline Storage | Dexie (IndexedDB)                    |
| Offline Sync    | PowerSync                            |
| HTTP            | ky                                   |
| Validasi        | Zod                                  |
| Enkripsi        | Web Crypto API (AES-GCM)             |
| Kompresi        | CompressionStream (native)           |
| Chart           | Chart.js                             |
| Tanggal         | date-fns                             |
| Security        | next-safe (CSP)                      |

---

## Architecture Overview

```
Browser (Offline-capable PWA)
        │
        ├── Next.js App Router
        │    ├── [tenant].exam.app/               ← subdomain routing
        │    ├── /(siswa)/ujian/[sessionId]/       ← ruang ujian
        │    ├── /(siswa)/ujian/[sessionId]/review ← review jawaban
        │    └── /(guru|operator|pengawas)/        ← dashboard per role
        │
        ├── Zustand Store
        │    ├── authStore    (session, token, device)
        │    ├── examStore    (paket soal, timer, status)
        │    ├── answerStore  (jawaban, auto-save state)
        │    └── syncStore    (antrian sync, status koneksi)
        │
        ├── Dexie (IndexedDB)
        │    ├── examPackages  (soal terenkripsi)
        │    ├── answers       (jawaban peserta)
        │    ├── activityLogs  (log aktivitas)
        │    └── syncQueue     (antrian submission)
        │
        └── PowerSync
             └── Sinkronisasi dua arah dengan backend saat online
```

---

## Offline Flow

```
1. DOWNLOAD
   Login → verifikasi device → download paket soal terenkripsi
   → simpan ke IndexedDB via Dexie

2. EXAM (online atau offline)
   Buka paket → dekripsi di memori via Web Crypto API (AES-GCM)
   → jawab soal → auto-save ke IndexedDB (debounce)
   → rekam audio/video → simpan blob ke IndexedDB (chunked)

3. SYNC
   Koneksi tersedia → PowerSync push jawaban ke backend
   → idempotency key mencegah duplikasi
   → konfirmasi dari server → tandai sesi selesai di IndexedDB
```

---

## Security Model

| Layer          | Mekanisme                                                                                         |
|----------------|--------------------------------------------------------------------------------------------------|
| Enkripsi soal  | AES-GCM via Web Crypto API; key hanya di memori selama sesi, tidak pernah dipersist              |
| CSP            | `next-safe` mengkonfigurasi Content Security Policy ketat; tidak memblokir Web Crypto/PowerSync   |
| Device locking | Fingerprint diverifikasi backend saat download dan sync; perangkat tidak terdaftar ditolak        |
| Activity log   | Perpindahan tab, blur window, paste, dan aksi mencurigakan dicatat ke IndexedDB → backend         |

---

## Halaman & Routes

| Route                                     | Role       | Deskripsi                           |
|-------------------------------------------|------------|-------------------------------------|
| `/`                                       | All        | Landing / redirect ke login         |
| `/login`                                  | All        | Login dengan verifikasi device      |
| `/(siswa)/ujian/[sessionId]`              | Siswa      | Ruang ujian utama                   |
| `/(siswa)/ujian/[sessionId]/review`       | Siswa      | Review jawaban sebelum submit       |
| `/(siswa)/ujian/[sessionId]/result`       | Siswa      | Hasil ujian                         |
| `/(siswa)/dashboard`                      | Siswa      | Daftar ujian tersedia               |
| `/(guru)/dashboard`                       | Guru       | Manajemen soal, ujian, penilaian    |
| `/(guru)/soal`                            | Guru       | Bank soal                           |
| `/(guru)/ujian`                           | Guru       | Manajemen ujian                     |
| `/(guru)/grading`                         | Guru       | Manual grading uraian/esai          |
| `/(operator)/dashboard`                   | Operator   | Manajemen sesi, ruang, peserta      |
| `/(operator)/sesi`                        | Operator   | Manajemen sesi ujian                |
| `/(operator)/peserta`                     | Operator   | Import dan manajemen peserta        |
| `/(pengawas)/monitoring`                  | Pengawas   | Monitoring live ujian               |
| `/(superadmin)/dashboard`                 | Superadmin | Manajemen sekolah, audit log        |

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

## Features

### Soal & Ujian
- 6 tipe soal: pilihan ganda, pilihan ganda kompleks, benar/salah, menjodohkan, isian singkat, uraian/esai
- Multimedia pada soal dan jawaban: gambar, audio, video
- Perekaman jawaban audio/video (maks. 5 menit / 1 GB per file)
- Auto-save dengan debounce ke IndexedDB
- Timer per peserta dengan notifikasi sisa waktu

### Antarmuka & Aksesibilitas
- Mobile-first, dioptimalkan untuk Android
- Kontrol ukuran font, dark mode, navigasi keyboard
- Fitur Arab/Islam: teks Al-Quran, penanda tajwid, keyboard Arab
- Responsive untuk tablet dan desktop

### PWA & Performance
- Service Worker dikelola PowerSync; tidak ada konflik dengan Next.js SW
- Lazy load komponen soal per tipe untuk mengurangi initial bundle
- Gambar soal di-cache di IndexedDB saat download paket, bukan saat ujian berlangsung
- Video dan audio jawaban di-chunk sebelum disimpan untuk menghindari memory pressure pada perangkat low-end Android

---

## Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://exam.example.com
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_POWERSYNC_URL=https://sync.example.com
NEXT_PUBLIC_MINIO_ENDPOINT=minio.example.com
NEXT_PUBLIC_TENANT_DOMAIN=exam.example.com

NEXT_PUBLIC_ENABLE_RECORDING=true
NEXT_PUBLIC_AUTOSAVE_INTERVAL=30000
NEXT_PUBLIC_MAX_RECORDING_DURATION=300
NEXT_PUBLIC_MAX_RECORDING_SIZE=1073741824
NEXT_PUBLIC_MIN_STORAGE_MB=2048
```

---

## Testing

```bash
# Unit test
npx vitest

# Unit test watch mode
npx vitest --watch

# E2E test (Playwright)
npx playwright test

# E2E test dengan UI
npx playwright test --ui
```

---

## Deployment Checklist

- [ ] `next-safe` CSP tidak memblokir Web Crypto atau PowerSync
- [ ] Subdomain wildcard `*.exam.example.com` diarahkan ke server yang sama
- [ ] Service Worker PowerSync tidak konflik dengan cache Next.js
- [ ] Auto-save diuji pada kondisi IndexedDB hampir penuh
- [ ] Recording diuji pada Android low-end (RAM 2–3 GB)
- [ ] Offline flow end-to-end: download → airplane mode → ujian → sync
- [ ] Playwright E2E mencakup skenario offline (mock service worker)
- [ ] Semua env variable production tidak mengandung nilai development/staging
