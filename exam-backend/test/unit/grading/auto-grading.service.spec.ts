// ── test/unit/grading/auto-grading.service.spec.ts ───────────────────────────
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { QuestionType } from '../../../src/common/enums/question-type.enum';
import { encrypt } from '../../../src/common/utils/encryption.util';
import { AutoGradingService } from '../../../src/modules/submissions/services/auto-grading.service';

describe('AutoGradingService', () => {
  let svc: AutoGradingService;
  const testKey = 'a'.repeat(64);

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        AutoGradingService,
        { provide: ConfigService, useValue: { get: jest.fn(() => testKey) } },
      ],
    }).compile();
    svc = mod.get(AutoGradingService);
  });

  it('grades multiple choice correctly', () => {
    const ca = encrypt(JSON.stringify({ type: 'single', value: 'a' }), testKey);
    const result = svc.gradeAnswer(QuestionType.MULTIPLE_CHOICE, ca, 'a', 10);
    expect(result.score).toBe(10);
    expect(result.isCorrect).toBe(true);
  });

  it('grades multiple choice incorrectly', () => {
    const ca = encrypt(JSON.stringify({ type: 'single', value: 'a' }), testKey);
    const result = svc.gradeAnswer(QuestionType.MULTIPLE_CHOICE, ca, 'b', 10);
    expect(result.score).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  it('marks essay as manual', () => {
    const ca = encrypt(JSON.stringify({ type: 'text', value: 'answer' }), testKey);
    const result = svc.gradeAnswer(QuestionType.ESSAY, ca, 'student essay', 10);
    expect(result.requiresManual).toBe(true);
  });
});
