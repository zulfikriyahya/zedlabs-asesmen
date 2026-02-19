# scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_DIRECT_URL > backups/exam_db_$DATE.sql
echo "Backup saved: exam_db_$DATE.sql"
