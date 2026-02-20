// ── test/unit/exam-packages/exam-packages.service.spec.ts ───────────────────
import { ExamPackagesService } from '../../../src/modules/exam-packages/services/exam-packages.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('ExamPackagesService', () => {
  it('should be defined', () => {
    const svc = new ExamPackagesService({ examPackage: {} } as unknown as PrismaService);
    expect(svc).toBeDefined();
  });
});
