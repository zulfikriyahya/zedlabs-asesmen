# scripts/rotate-keys.sh
#!/bin/bash
NEW_KEY=$(openssl rand -hex 32)
echo "New ENCRYPTION_KEY: $NEW_KEY"
echo "⚠️  Update .env dan re-deploy sebelum key lama expired"
echo "⚠️  Re-enkripsi semua correctAnswer di database setelah rotate"
