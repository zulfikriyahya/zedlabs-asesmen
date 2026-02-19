// ── seeds/03-subjects.seed.ts ─────────────────────────────
export async function seedSubjects(prisma: PrismaClient) {
  const tenant = await prisma.tenant.findFirst({ where: { code: 'SMKN1' } });
  if (!tenant) throw new Error('Tenant tidak ditemukan');

  const subjects = [
    { name: 'Matematika', code: 'MTK' },
    { name: 'Bahasa Indonesia', code: 'BIN' },
    { name: 'Bahasa Inggris', code: 'BIG' },
    { name: 'Fisika', code: 'FIS' },
    { name: 'Kimia', code: 'KIM' },
  ];

  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: s.code } },
      create: { tenantId: tenant.id, ...s },
      update: {},
    });
  }
  console.log('✅ Subjects seeded');
}
