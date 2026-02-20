#!/bin/bash
# scripts/cleanup-media.sh
# Hapus media orphan dari MinIO yang tidak ada referensinya di DB
# Jalankan: DATABASE_DIRECT_URL=... bash scripts/cleanup-media.sh [--dry-run]

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 DRY RUN mode — tidak ada yang dihapus"
fi

BUCKET=${MINIO_BUCKET:-exam-assets}
PREFIXES=("questions/images" "answers/video" "answers/audio")
REPORTS_PREFIX="reports"
TEMP_DIR=$(mktemp -d)
DB_OBJECTS_FILE="${TEMP_DIR}/db_objects.txt"
MINIO_OBJECTS_FILE="${TEMP_DIR}/minio_objects.txt"
ORPHAN_FILE="${TEMP_DIR}/orphans.txt"
DELETED=0
SKIPPED=0

echo "[$(date)] Memulai cleanup media orphan..."

# Ambil semua objectName yang masih ada di DB
echo "  Mengambil daftar media dari database..."
psql "${DATABASE_DIRECT_URL:-}" --no-psqlrc -t -c "
  SELECT UNNEST(media_urls) FROM exam_answers
  UNION
  SELECT object_name FROM (
    SELECT return_value->>'objectName' AS object_name
    FROM (SELECT return_value::jsonb FROM bullmq_jobs WHERE status='completed') t
    WHERE return_value->>'objectName' IS NOT NULL
  ) r
" 2>/dev/null | tr -d ' ' | sort -u > "${DB_OBJECTS_FILE}" || {
  echo "⚠️  Tidak bisa query DB — hanya cleanup berdasarkan umur file"
  touch "${DB_OBJECTS_FILE}"
}

mc alias set minio \
  "http://${MINIO_ENDPOINT:-localhost}:${MINIO_PORT:-9000}" \
  "${MINIO_ACCESS_KEY:-minioadmin}" \
  "${MINIO_SECRET_KEY:-minioadmin}" \
  --quiet

# Untuk setiap prefix, cari file lebih dari 7 hari yang tidak ada di DB
for PREFIX in "${PREFIXES[@]}"; do
  echo "  Memeriksa prefix: ${PREFIX}/"
  mc find "minio/${BUCKET}/${PREFIX}" \
    --older-than 7d \
    --name "*" 2>/dev/null | \
    sed "s|minio/${BUCKET}/||" | sort > "${MINIO_OBJECTS_FILE}" || true

  if [[ -s "${MINIO_OBJECTS_FILE}" && -s "${DB_OBJECTS_FILE}" ]]; then
    comm -23 "${MINIO_OBJECTS_FILE}" "${DB_OBJECTS_FILE}" > "${ORPHAN_FILE}" || true
  elif [[ -s "${MINIO_OBJECTS_FILE}" ]]; then
    # Tidak ada data DB, skip agar aman
    echo "  ⚠️  Tidak ada data DB untuk ${PREFIX}, dilewati"
    continue
  fi

  while IFS= read -r OBJECT; do
    [[ -z "${OBJECT}" ]] && continue
    if [[ "${DRY_RUN}" == "true" ]]; then
      echo "  [DRY] Akan hapus: ${OBJECT}"
      ((SKIPPED++)) || true
    else
      mc rm "minio/${BUCKET}/${OBJECT}" --quiet && {
        echo "  ✓ Dihapus: ${OBJECT}"
        ((DELETED++)) || true
      } || echo "  ✗ Gagal hapus: ${OBJECT}"
    fi
  done < "${ORPHAN_FILE}"
done

# Hapus report lebih dari 30 hari (selalu aman karena generated on-demand)
echo "  Membersihkan report lama (>30 hari)..."
mc find "minio/${BUCKET}/${REPORTS_PREFIX}" \
  --older-than 30d \
  --name "*.xlsx" --name "*.pdf" \
  --exec "$([ "${DRY_RUN}" == "true" ] && echo 'echo [DRY] Akan hapus: {}' || echo 'mc rm {}')" \
  2>/dev/null || true

# Cleanup temp
rm -rf "${TEMP_DIR}"

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "[$(date)] Dry run selesai — ${SKIPPED} objek akan dihapus"
else
  echo "[$(date)] Cleanup selesai — ${DELETED} objek dihapus ✅"
fi
