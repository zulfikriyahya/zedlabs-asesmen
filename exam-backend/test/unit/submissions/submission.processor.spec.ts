// ════════════════════════════════════════════════════════════════════════════
// test/unit/submissions/submission.processor.spec.ts
// ════════════════════════════════════════════════════════════════════════════
import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionProcessor } from '../../../src/modules/submissions/processors/submission.processor';
import { GradingHelperService } from '../../../src/modules/submissions/services/grading-helper.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { AuditLogsService } from '../../../src/modules/audit-logs/services/audit-logs.service';
import { AttemptStatus } from '../../../src/common/enums/exam-status.enum';

describe('SubmissionProcessor', () => {
  let processor: SubmissionProcessor;
  const mockPrisma = {
    examAttempt: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const mockGradingHelper = { runAutoGrade: jest.fn() };
  const mockAuditLogs = { log: jest.fn() };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionProcessor,
        { provide: GradingHelperService, useValue: mockGradingHelper },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogsService, useValue: mockAuditLogs },
      ],
    }).compile();

    processor = mod.get(SubmissionProcessor);
    jest.clearAllMocks();
  });

  describe('auto-grade job', () => {
    it('menjalankan auto-grade untuk attempt SUBMITTED', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.SUBMITTED,
        userId: 'user-1',
      });
      mockGradingHelper.runAutoGrade.mockResolvedValue(undefined);
      mockAuditLogs.log.mockResolvedValue(undefined);

      await processor.process({
        name: 'auto-grade',
        data: { attemptId: 'att-1', tenantId: 'tenant-1' },
        attemptsMade: 0,
      } as any);

      expect(mockGradingHelper.runAutoGrade).toHaveBeenCalledWith('att-1');
      expect(mockAuditLogs.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'AUTO_GRADE_COMPLETED' }),
      );
    });

    it('skip jika attempt tidak ditemukan', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue(null);

      await processor.process({
        name: 'auto-grade',
        data: { attemptId: 'att-missing', tenantId: 'tenant-1' },
        attemptsMade: 0,
      } as any);

      expect(mockGradingHelper.runAutoGrade).not.toHaveBeenCalled();
    });

    it('skip jika status bukan SUBMITTED atau TIMED_OUT', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.IN_PROGRESS,
        userId: 'user-1',
      });

      await processor.process({
        name: 'auto-grade',
        data: { attemptId: 'att-1', tenantId: 'tenant-1' },
        attemptsMade: 0,
      } as any);

      expect(mockGradingHelper.runAutoGrade).not.toHaveBeenCalled();
    });

    it('melempar error agar BullMQ retry', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.SUBMITTED,
        userId: 'user-1',
      });
      mockGradingHelper.runAutoGrade.mockRejectedValue(new Error('DB error'));

      await expect(
        processor.process({
          name: 'auto-grade',
          data: { attemptId: 'att-1', tenantId: 'tenant-1' },
          attemptsMade: 0,
        } as any),
      ).rejects.toThrow('DB error');
    });
  });

  describe('timeout-attempt job', () => {
    it('update status ke TIMED_OUT dan auto-grade', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
      });
      mockPrisma.examAttempt.update.mockResolvedValue({});
      mockGradingHelper.runAutoGrade.mockResolvedValue(undefined);
      mockAuditLogs.log.mockResolvedValue(undefined);

      await processor.process({
        name: 'timeout-attempt',
        data: { attemptId: 'att-1', tenantId: 'tenant-1', sessionId: 'sess-1' },
        attemptsMade: 0,
      } as any);

      expect(mockPrisma.examAttempt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att-1' },
          data: expect.objectContaining({ status: AttemptStatus.TIMED_OUT }),
        }),
      );
      expect(mockGradingHelper.runAutoGrade).toHaveBeenCalledWith('att-1');
    });

    it('skip jika attempt sudah tidak IN_PROGRESS', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue(null); // tidak IN_PROGRESS

      await processor.process({
        name: 'timeout-attempt',
        data: { attemptId: 'att-1', tenantId: 'tenant-1', sessionId: 'sess-1' },
        attemptsMade: 0,
      } as any);

      expect(mockPrisma.examAttempt.update).not.toHaveBeenCalled();
      expect(mockGradingHelper.runAutoGrade).not.toHaveBeenCalled();
    });
  });
});
