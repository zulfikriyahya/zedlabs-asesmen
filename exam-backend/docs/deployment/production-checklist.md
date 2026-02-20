# Production Checklist

## Pre-Deploy

### Environment Variables
- [ ] `JWT_ACCESS_SECRET` — min 32 chars, random (`openssl rand -base64 48`)
- [ ] `JWT_REFRESH_SECRET` — min 32 chars, random, **berbeda** dari access secret
- [ ] `ENCRYPTION_KEY` — 64 hex chars (`openssl rand -hex 32`)
- [ ] `DATABASE_URL` → PgBouncer (port 6432, transaction mode)
- [ ] `DATABASE_DIRECT_URL` → Postgres langsung (port 5432, hanya untuk migration)
- [ ] MinIO credentials diganti dari default (`minioadmin`)
- [ ] `REDIS_PASSWORD` diset untuk production
- [ ] `SENTRY_DSN` diset untuk error tracking
- [ ] `SMTP_USER` dan `SMTP_PASS` diset jika email notification dipakai
- [ ] `APP_URL` sesuai domain production (untuk CORS)

### Database
- [ ] Jalankan `npm run db:migrate` (prisma migrate deploy)
- [ ] Jalankan `npm run db:rls` untuk setup PostgreSQL RLS
- [ ] Jalankan `npm run db:seed` untuk data awal (tenant, superadmin)
- [ ] Verifikasi PgBouncer pool size ≤ `max_connections` Postgres - 5
- [ ] Setup cron backup: `0 2 * * * /app/scripts/backup.sh`
- [ ] Test restore dari backup

### Security
- [ ] HTTPS dengan valid TLS certificate (Let's Encrypt / CA)
- [ ] Helmet headers aktif (cek via `curl -I https://yourdomain`)
- [ ] CORS hanya izinkan domain yang dikenal (`APP_URL`)
- [ ] Rate limiting dikonfigurasi: `THROTTLE_TTL=60`, `THROTTLE_LIMIT=100`
- [ ] Verifikasi `ENCRYPTION_KEY` bukan default (`0000...`)
- [ ] Verifikasi `JWT_*_SECRET` bukan default

### Key Management
- [ ] `ENCRYPTION_KEY` disimpan di secrets manager (AWS Secrets Manager / Vault)
- [ ] Jadwalkan rotasi key setiap 90 hari via `npm run keys:rotate`
- [ ] Backup `ENCRYPTION_KEY` lama sebelum rotasi

## Deploy

### Runtime
- [ ] PM2 cluster mode aktif (`instances: 'max'`)
- [ ] Memory limit dikonfigurasi (`max_memory_restart: '2G'`)
- [ ] Log rotation aktif (winston `winston-daily-rotate-file`)
- [ ] `NODE_ENV=production` di-set

### Infrastructure
- [ ] Redis `appendonly yes` untuk persistence
- [ ] MinIO dengan erasure coding (min 4 node untuk HA)
- [ ] PostgreSQL dengan replica untuk read scaling
- [ ] CDN di depan MinIO untuk media serving

## Post-Deploy Verification

### Health Checks
- [ ] `GET /health` → status 200, database UP
- [ ] `GET /api` → API info response
- [ ] BullMQ worker aktif (cek via Redis: `KEYS bull:*`)
- [ ] WebSocket `/monitoring` dapat dikoneksi

### Functional Tests
- [ ] Login berhasil: `POST /api/auth/login`
- [ ] Subdomain routing: `smkn1.exam.app` → tenantId resolved
- [ ] Download paket soal berhasil
- [ ] Submit jawaban dan ujian berhasil
- [ ] Auto-grading berjalan via BullMQ

### Monitoring
- [ ] Sentry menerima test event
- [ ] Alerting untuk dead letter queue BullMQ
- [ ] Slow query log dikonfigurasi (>500ms)
- [ ] Disk space monitoring untuk MinIO dan Postgres
