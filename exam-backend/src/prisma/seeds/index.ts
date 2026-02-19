// ── seeds/index.ts ────────────────────────────────────────
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
main().catch(console.error);
