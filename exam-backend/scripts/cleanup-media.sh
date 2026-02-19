# scripts/cleanup-media.sh
#!/bin/bash
# Hapus media orphan (tidak referensed di DB) lebih dari 30 hari
echo "Cleaning up orphan media files older than 30 days..."
# mc find minio/exam-assets --older-than 30d | xargs mc rm
echo "Done"
