# scripts/restore.sh
#!/bin/bash
BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then echo "Usage: ./restore.sh <backup_file>"; exit 1; fi
psql $DATABASE_DIRECT_URL < $BACKUP_FILE
echo "Restore completed"
