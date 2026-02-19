// ════════════════════════════════════════════════════════════════════════════
// test/unit/submissions/grading-helper.service.spec.ts
// ════════════════════════════════════════════════════════════════════════════
import { Test } from '@nestjs/testing';
import { GradingHelperService } from '../../../src/modules/submissions/services/grading-helper.service';
import { AutoGradingService } from '../../../src/modules/submissions/services/auto-grading.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { GradingStatus } from '../../../src/common/enums/grading-status.enum';
import { QuestionType } from '../../../src/common/enums/question-type.enum';
import { encrypt } from '../../../src/common/utils/encryption.util';
import { ConfigService } from '@nestjs/config';

describe('GradingHelperService', () => {
  let svc: GradingHelperService;
  const testKey = 'a'.repeat(64);

  const mockAttempt = (answers: object[], questions: object[]) => ({
    id: 'att-1',
    answers,
    session: {
      examPackage: {
        questions: questions.map((q: any) => ({
          questionId: q.id,
          points: q.points ?? 10,
          question: q,
        })),
      },
    },
  });

  const mockPrisma = {
    examAttempt: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    examAnswer: { update: jest.fn() },
  };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        GradingHelperService,
        AutoGradingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: { get: jest.fn(() => testKey) } },
      ],
    }).compile();

    svc = mod.get(GradingHelperService);
    jest.clearAllMocks();
  });

  it('auto-grade pilihan ganda benar → AUTO_GRADED', async () => {
    const ca = encrypt(JSON.stringify({ type: 'single', value: 'a' }), testKey);
    mockPrisma.examAttempt.findUnique.mockResolvedValue(
      mockAttempt(
        [{ id: 'ans-1', questionId: 'q-1', answer: 'a' }],
        [{ id: 'q-1', type: QuestionType.MULTIPLE_CHOICE, correctAnswer: ca, points: 10 }],
      ),
    );
    mockPrisma.examAnswer.update.mockResolvedValue({});
    mockPrisma.examAttempt.update.mockResolvedValue({});

    await svc.runAutoGrade('att-1');

    expect(mockPrisma.examAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gradingStatus: GradingStatus.AUTO_GRADED, totalScore: 10 }),
      }),
    );
  });

  it('essay → MANUAL_REQUIRED', async () => {
    const ca = encrypt(JSON.stringify({ type: 'text', value: 'jawaban model' }), testKey);
    mockPrisma.examAttempt.findUnique.mockResolvedValue(
      mockAttempt(
        [{ id: 'ans-1', questionId: 'q-1', answer: 'jawaban siswa' }],
        [{ id: 'q-1', type: QuestionType.ESSAY, correctAnswer: ca, points: 20 }],
      ),
    );
    mockPrisma.examAnswer.update.mockResolvedValue({});
    mockPrisma.examAttempt.update.mockResolvedValue({});

    await svc.runAutoGrade('att-1');

    expect(mockPrisma.examAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gradingStatus: GradingStatus.MANUAL_REQUIRED }),
      }),
    );
  });
});
