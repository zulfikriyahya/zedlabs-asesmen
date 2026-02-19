# Exam System — Offline-First Multi-Tenant

Repositori ini berisi skrip setup, konfigurasi, dan dokumentasi untuk sistem ujian berbasis web yang dirancang untuk sekolah dan madrasah. Sistem dibangun dengan arsitektur offline-first dan mendukung multi-tenant via subdomain.

---

## Struktur Repositori

```
.
├── generate.sh          # Generator blueprint kode untuk konteks AI
├── README.md            # Dokumen ini
├── README_BE.md         # Dokumentasi teknis backend
├── README_FE.md         # Dokumentasi teknis frontend
├── setup-backend.sh     # Setup struktur project NestJS (backend)
├── setup-frontend.sh    # Setup struktur project Next.js (frontend)
└── SKILLS.md            # Konteks project dan konvensi untuk AI assistant
```

---

## Komponen Sistem

### Frontend (`exam-frontend`)
Next.js 15 (App Router) dengan kemampuan offline penuh. Peserta mengunduh paket soal terenkripsi, mengerjakan ujian tanpa koneksi, lalu menyinkronkan jawaban saat online kembali.

Dokumentasi lengkap: [README_FE.md](./README_FE.md)

### Backend (`exam-backend`)
NestJS REST API sebagai pusat data multi-tenant. Menangani autentikasi, distribusi paket soal, penilaian otomatis, sinkronisasi offline, dan pelaporan.

Dokumentasi lengkap: [README_BE.md](./README_BE.md)

---

## Memulai

### 1. Setup Backend

```bash
bash setup-backend.sh
cd exam-backend
npm install
cp .env.example .env
# Edit .env sesuai konfigurasi lokal
docker-compose up -d postgres redis minio
npm run db:migrate:dev
npm run db:seed
npm run start:dev
```

### 2. Setup Frontend

```bash
bash setup-frontend.sh
cd exam-frontend
npm install
# Edit .env.local sesuai konfigurasi lokal
npm run dev
```

### 3. Generate Blueprint untuk AI

Jalankan dari direktori ini (sejajar dengan `exam-frontend` dan `exam-backend`):

```bash
bash generate.sh ../exam-frontend ../exam-backend
```

Menghasilkan `draft_fe.md` dan `draft_be.md` yang berisi seluruh kode sumber dalam format Markdown, siap dilampirkan sebagai konteks ke AI assistant.

---

## Alur Offline-First

```
1. DOWNLOAD   — Peserta login → verifikasi device → unduh paket soal terenkripsi
2. EXAM       — Kerjakan soal offline → auto-save ke IndexedDB setiap 30 detik
3. SYNC       — Koneksi tersedia → PowerSync kirim jawaban ke backend
4. GRADING    — Auto-grade soal objektif → manual grade esai oleh guru
5. RESULT     — Hasil dipublikasikan → peserta lihat nilai
```

---

## Peran Pengguna

| Peran | Akses |
|---|---|
| Siswa | Ambil ujian, lihat hasil |
| Guru | Buat soal, kelola ujian, nilai esai |
| Pengawas | Monitor sesi ujian real-time |
| Operator | Kelola sesi, ruang, peserta |
| Superadmin | Administrasi sistem dan tenant |

---

## Tech Stack Ringkas

| Layer | Teknologi Utama |
|---|---|
| Frontend | Next.js 15, TypeScript, Zustand, Dexie, PowerSync, Web Crypto API |
| Backend | NestJS, Prisma, PostgreSQL, Redis, BullMQ, MinIO |
| Testing | Vitest, Jest, Playwright, k6 |

Detail lengkap ada di [SKILLS.md](./SKILLS.md).
