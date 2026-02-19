// ── factories/question.factory.ts ────────────────────────
import { QuestionType as QT } from '../../common/enums/question-type.enum';

export const questionFactory = (
  overrides: Partial<{
    tenantId: string;
    subjectId: string;
    type: QT;
  }> = {},
) => ({
  tenantId: overrides.tenantId ?? 'test-tenant-id',
  subjectId: overrides.subjectId ?? 'test-subject-id',
  type: overrides.type ?? QT.MULTIPLE_CHOICE,
  content: { text: 'Test question?', images: [] },
  options: { a: 'Option A', b: 'Option B', c: 'Option C', d: 'Option D' },
  correctAnswer: 'encrypted-answer',
  points: 10,
  difficulty: 2,
  status: 'approved',
});
