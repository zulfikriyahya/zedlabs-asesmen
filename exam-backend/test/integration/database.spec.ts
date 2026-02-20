import { Test } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

describe('Database Integration', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
    }).compile();
    prisma = mod.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('dapat terhubung ke PostgreSQL', async () => {
    const result = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW() as now`;
    expect(result[0].now).toBeInstanceOf(Date);
  });

  it('tenant query isolation — tenant A tidak melihat data tenant B', async () => {
    // Buat 2 tenant sementara
    const [tA, tB] = await Promise.all([
      prisma.tenant.create({
        data: { name: 'Tenant A', code: `TA-${Date.now()}`, subdomain: `ta-${Date.now()}` },
      }),
      prisma.tenant.create({
        data: { name: 'Tenant B', code: `TB-${Date.now()}`, subdomain: `tb-${Date.now()}` },
      }),
    ]);

    // Buat subject di tenant A
    const subj = await prisma.subject.create({
      data: { tenantId: tA.id, name: 'Matematika', code: 'MTK-TEST' },
    });

    // Query dengan tenantId B harus kosong
    const result = await prisma.subject.findMany({
      where: { tenantId: tB.id, id: subj.id },
    });
    expect(result).toHaveLength(0);

    // Query dengan tenantId A harus ada
    const resultA = await prisma.subject.findMany({
      where: { tenantId: tA.id, id: subj.id },
    });
    expect(resultA).toHaveLength(1);

    // Cleanup
    await prisma.subject.delete({ where: { id: subj.id } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tA.id, tB.id] } } });
  });

  it('idempotency constraint — ExamAnswer.idempotencyKey unique', async () => {
    // Verifikasi constraint ada di schema
    const result = await prisma.$queryRaw<{ indexname: string }[]>`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'exam_answers'
      AND indexname LIKE '%idempotency%'
    `;
    expect(result.length).toBeGreaterThan(0);
  });

  it('audit_logs tidak punya trigger UPDATE/DELETE (append-only policy)', async () => {
    // Verifikasi tidak ada trigger DELETE pada audit_logs
    const triggers = await prisma.$queryRaw<{ trigger_name: string }[]>`
      SELECT trigger_name FROM information_schema.triggers
      WHERE event_object_table = 'audit_logs'
      AND event_manipulation IN ('UPDATE', 'DELETE')
    `;
    // Append-only diimplementasi di application layer, bukan trigger DB
    // Test ini memastikan tidak ada trigger yang mengoverride kebijakan tersebut
    expect(triggers).toHaveLength(0);
  });
});
