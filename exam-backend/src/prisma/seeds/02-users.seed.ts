// ── src/prisma/seeds/02-users.seed.ts ────────────────────
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  const tenant = await prisma.tenant.findFirst({ where: { code: 'SMKN1' } });
  if (!tenant) throw new Error('Tenant SMKN1 tidak ditemukan');

  const hash = await bcrypt.hash('password123', 12);

  const users = [
    { email: 'admin@smkn1.test',    username: 'admin',     role: 'ADMIN'      },
    { email: 'guru@smkn1.test',     username: 'guru1',     role: 'TEACHER'    },
    { email: 'operator@smkn1.test', username: 'operator1', role: 'OPERATOR'   },
    { email: 'pengawas@smkn1.test', username: 'pengawas1', role: 'SUPERVISOR' },
    { email: 'siswa@smkn1.test',    username: 'siswa1',    role: 'STUDENT'    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { tenantId_username: { tenantId: tenant.id, username: u.username } },
      create: {
        tenantId: tenant.id,
        email: u.email,
        username: u.username,
        passwordHash: hash,
        role: u.role as import('@prisma/client').UserRole,
      },
      update: {},
    });
  }
  console.log('✅ Users seeded');
}
