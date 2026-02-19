
<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/deployment/production-checklist.md                   -->
<!-- ══════════════════════════════════════════════════════════ -->

# Production Checklist

## Environment Variables
- [ ] `JWT_ACCESS_SECRET` min 32 chars, random
- [ ] `JWT_REFRESH_SECRET` min 32 chars, random, berbeda dari access
- [ ] `ENCRYPTION_KEY` 64 hex chars (32 bytes random)
- [ ] `DATABASE_URL` dan `DATABASE_DIRECT_URL` set ke PgBouncer dan Postgres
- [ ] MinIO credentials diganti dari default
- [ ] `SENTRY_DSN` diset untuk error tracking

## Database
- [ ] Jalankan `prisma migrate deploy`
- [ ] Enable RLS di PostgreSQL
- [ ] Setup backup otomatis (lihat `scripts/backup.sh`)
- [ ] PgBouncer pool size sesuai dengan `max_connections` Postgres

## Security
- [ ] HTTPS dengan valid TLS certificate
- [ ] Helmet headers aktif
- [ ] Rate limiting dikonfigurasi per tenant
- [ ] CORS origin dikonfigurasi spesifik (bukan wildcard)

## Performance
- [ ] PM2 cluster mode aktif (`instances: 'max'`)
- [ ] Redis persistence enabled (`appendonly yes`)
- [ ] MinIO dengan erasure coding untuk HA
- [ ] CDN untuk static assets frontend

## Monitoring
- [ ] Health check endpoint `/health` terdaftar di load balancer
- [ ] Log rotation dikonfigurasi (winston-daily-rotate-file)
- [ ] Alerting untuk dead letter queue BullMQ
