// ── src/prisma/seeds/index.ts ─────────────────────────────
import { PrismaClient } from '@prisma/client';
import { seedTenants } from './01-tenants.seed';
import { seedUsers } from './02-users.seed';
import { seedSubjects } from './03-subjects.seed';

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedTenants(prisma);
    await seedUsers(prisma);
    await seedSubjects(prisma);
    console.log('🌱 Database seeded successfully');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
