// ── test/unit/questions/questions.service.spec.ts ────────────────────────────
import { QuestionsService } from '../../../src/modules/questions/services/questions.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('QuestionsService', () => {
  it('should be defined', () => {
    const svc = new QuestionsService({} as PrismaService, {} as ConfigService);
    expect(svc).toBeDefined();
  });
});
