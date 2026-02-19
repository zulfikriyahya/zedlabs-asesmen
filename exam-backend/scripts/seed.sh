# scripts/seed.sh
#!/bin/bash
set -e
echo "Running database seeds..."
npx ts-node src/prisma/seeds/index.ts
echo "Done!"
