// ── seeds/01-tenants.seed.ts ─────────────────────────────
import { PrismaClient } from '@prisma/client';
export async function seedTenants(prisma: PrismaClient) {
  const tenants = [
    { name: 'SMKN 1 Contoh', code: 'SMKN1', subdomain: 'smkn1' },
    { name: 'SMA Demo', code: 'SMADEMO', subdomain: 'smademo' },
  ];
  for (const t of tenants) {
    await prisma.tenant.upsert({ where: { code: t.code }, create: t, update: {} });
  }
  console.log('✅ Tenants seeded');
}
