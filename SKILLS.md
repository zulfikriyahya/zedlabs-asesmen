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

## Format Respons AI

- Jawaban langsung pada solusi teknis tanpa pembuka panjang.
- Kode menggunakan nama variabel ringkas namun deskriptif.
- Jika ada beberapa pendekatan, tampilkan perbedaan dan trade-off secara singkat — bukan semua opsi secara panjang lebar.
- Tidak perlu menyertakan instruksi instalasi, struktur folder standar, atau penjelasan umum yang sudah diketahui senior developer, kecuali diminta secara spesifik.
- Gunakan Bahasa Indonesia untuk penjelasan, Bahasa Inggris untuk kode dan nama teknis.
