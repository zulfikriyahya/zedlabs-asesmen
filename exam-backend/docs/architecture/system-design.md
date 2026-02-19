<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/architecture/system-design.md                        -->
<!-- ══════════════════════════════════════════════════════════ -->

# System Design — Offline-First Multi-Tenant Exam System

## Overview
Sistem ujian berbasis web dengan kemampuan offline-first untuk lingkungan sekolah/madrasah.
Mendukung multi-tenant via subdomain isolation (smkn1.exam.app → tenantId `smkn1`).

## Komponen Utama

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Next.js 14)                                       │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐                │
│  │  Zustand │ │  Dexie   │ │  PowerSync  │                │
│  │ (memory) │ │(IndexedDB│ │  (2-way     │                │
│  └──────────┘ └──────────┘ │   sync)     │                │
│                             └─────────────┘                │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS / Socket.IO
┌─────────────────────▼───────────────────────────────────────┐
│  NestJS API (PM2 Cluster)                                   │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐                │
│  │  Auth     │ │Submissions│ │   Sync     │                │
│  │  Module   │ │  Module   │ │  Module    │                │
│  └───────────┘ └──────────┘ └────────────┘                │
│  ┌───────────────────────────────────────┐                │
│  │  BullMQ (submission, sync, media,     │                │
│  │          report, notification)        │                │
│  └───────────────────────────────────────┘                │
└────────┬──────────────┬───────────────┬────────────────────┘
         │              │               │
    ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐
    │Postgres │   │   Redis   │  │  MinIO  │
    │(+PgBouncer) │(BullMQ+   │  │(S3-like)│
    └─────────┘   │ cache)    │  └─────────┘
                  └───────────┘
```

## Keputusan Arsitektur Kunci

| Area | Keputusan | Alasan |
|------|-----------|--------|
| Offline storage | Dexie (IndexedDB) | Structured queries, migrasi schema |
| Sinkronisasi | PowerSync + BullMQ | Real-time sync + reliable queue |
| Enkripsi | AES-256-GCM (Web Crypto) | Native browser, key hanya di memori |
| Multi-tenant | Subdomain + tenantId per query | Isolasi data, satu deployment |
| Connection pooling | PgBouncer (transaction mode) | Mendukung 1000+ koneksi klien |
