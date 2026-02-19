
<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/architecture/offline-sync-flow.md                    -->
<!-- ══════════════════════════════════════════════════════════ -->

# Offline Sync Flow

## Download Phase (Online → Offline)

```
Siswa klik "Mulai Ujian"
  → POST /api/student/download (StartAttemptDto)
  → Server validasi: sesi ACTIVE, tokenCode valid, waktu valid
  → Server buat ExamAttempt (idempotent via idempotencyKey)
  → Server kembalikan DownloadablePackage (soal terenkripsi)
  → Client decrypt dengan AES-GCM session key (hanya di memori)
  → Client simpan ke IndexedDB (Dexie: examPackages)
  → Client hapus key dari memori jika tab ditutup
```

## Answering Phase (Offline)

```
Siswa jawab soal
  → useAutoSave (debounce 2s)
  → answerStore.setAnswer(questionId, answer)
  → Dexie.answers.put({ attemptId, questionId, answer, isDirty: true })
  → AutoSaveIndicator menampilkan status "Tersimpan"
```

## Submit Phase (Offline → Online)

```
Siswa klik Submit
  → SyncQueue.push({ type: SUBMIT_EXAM, payload: { attemptId } })
  → Jika online: langsung POST /api/student/submit
  → Jika offline: PowerSync menampung di syncQueue IndexedDB
  → Saat online kembali: PowerSync push ke /api/sync
  → BullMQ process-sync-batch → auto-grade
```

## Idempotency Guarantee

Setiap request submit membawa `idempotencyKey` unik (UUID v4 di-generate klien).
Server menggunakan `upsert` dengan `idempotencyKey` sebagai unique constraint.
Duplicate request (retry) akan mendapat response yang sama tanpa side-effect.
