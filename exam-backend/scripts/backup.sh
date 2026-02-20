#!/bin/bash
# scripts/backup.sh
# Backup PostgreSQL ke MinIO
# Jalankan via cron: 0 2 * * * /app/scripts/backup.sh

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"
BUCKET=${MINIO_BUCKET:-exam-assets}
BACKUP_PREFIX="backups/db"

echo "[$(date)] Memulai backup database..."

# Dump + compress
PGPASSWORD="${POSTGRES_PASSWORD:-exam_password}" pg_dump \
  -h "${POSTGRES_HOST:-postgres}" \
  -U "${POSTGRES_USER:-exam_user}" \
  -d "${POSTGRES_DB:-exam_db}" \
  --no-owner \
  --no-acl \
  | gzip > "/tmp/${BACKUP_FILE}"

echo "[$(date)] Dump selesai: /tmp/${BACKUP_FILE} ($(du -sh /tmp/${BACKUP_FILE} | cut -f1))"

# Upload ke MinIO
mc alias set minio \
  "http://${MINIO_ENDPOINT:-localhost}:${MINIO_PORT:-9000}" \
  "${MINIO_ACCESS_KEY:-minioadmin}" \
  "${MINIO_SECRET_KEY:-minioadmin}" \
  --quiet

mc cp "/tmp/${BACKUP_FILE}" "minio/${BUCKET}/${BACKUP_PREFIX}/${BACKUP_FILE}"
echo "[$(date)] Upload selesai: minio/${BUCKET}/${BACKUP_PREFIX}/${BACKUP_FILE}"

# Hapus backup lokal
rm -f "/tmp/${BACKUP_FILE}"

# Hapus backup lebih dari 30 hari di MinIO
mc find "minio/${BUCKET}/${BACKUP_PREFIX}" \
  --name "*.sql.gz" \
  --older-than 30d \
  --exec "mc rm {}" 2>/dev/null || true

echo "[$(date)] Backup selesai ✅"
