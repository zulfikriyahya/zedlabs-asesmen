import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamSubmissionService } from '../../../src/modules/submissions/services/exam-submission.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { AuditLogsService } from '../../../src/modules/audit-logs/services/audit-logs.service';
import { AttemptStatus } from '../../../src/common/enums/exam-status.enum';

describe('ExamSubmissionService', () => {
  let svc: ExamSubmissionService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let queue: { add: jest.Mock };
  let auditLogs: { log: jest.Mock };

  beforeEach(async () => {
    prisma = {
      examAttempt: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      examAnswer: {
        upsert: jest.fn(),
      },
    };
    queue = { add: jest.fn().mockResolvedValue({ id: 'job-1' }) };
    auditLogs = { log: jest.fn().mockResolvedValue({}) };

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ExamSubmissionService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
        { provide: 'BullQueue_submission', useValue: queue },
      ],
    }).compile();

    svc = mod.get(ExamSubmissionService);
    jest.clearAllMocks();
  });

  // ── submitAnswer ──────────────────────────────────────────────────────────
  describe('submitAnswer', () => {
    const dto = {
      attemptId: 'att-1',
      questionId: 'q-1',
      idempotencyKey: 'idem-1',
      answer: 'a',
    };

    it('throw NotFoundException jika attempt tidak ada', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue(null);
      await expect(svc.submitAnswer(dto)).rejects.toThrow(NotFoundException);
    });

    it('throw BadRequestException jika sudah SUBMITTED', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue({ status: AttemptStatus.SUBMITTED });
      await expect(svc.submitAnswer(dto)).rejects.toThrow(BadRequestException);
    });

    it('throw BadRequestException jika sudah TIMED_OUT', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue({ status: AttemptStatus.TIMED_OUT });
      await expect(svc.submitAnswer(dto)).rejects.toThrow(BadRequestException);
    });

    it('upsert jawaban jika attempt IN_PROGRESS', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue({ status: AttemptStatus.IN_PROGRESS });
      prisma.examAnswer.upsert.mockResolvedValue({ id: 'ans-1' });

      const result = await svc.submitAnswer(dto);
      expect(prisma.examAnswer.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idempotencyKey: dto.idempotencyKey },
          create: expect.objectContaining({ answer: dto.answer }),
        }),
      );
      expect(result).toEqual({ id: 'ans-1' });
    });
  });

  // ── submitExam ────────────────────────────────────────────────────────────
  describe('submitExam', () => {
    const dto = { attemptId: 'att-1', idempotencyKey: 'idem-submit-1' };
    const mockAttempt = {
      id: 'att-1',
      userId: 'user-1',
      status: AttemptStatus.IN_PROGRESS,
      session: { tenantId: 'tenant-1' },
    };

    it('throw NotFoundException jika attempt tidak ada', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue(null);
      await expect(svc.submitExam(dto)).rejects.toThrow(NotFoundException);
    });

    it('return pesan idempoten jika sudah SUBMITTED sebelumnya', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue({
        ...mockAttempt,
        status: AttemptStatus.SUBMITTED,
      });
      const result = await svc.submitExam(dto);
      expect(result.message).toMatch(/sudah disubmit/);
      expect(prisma.examAttempt.update).not.toHaveBeenCalled();
    });

    it('update status ke SUBMITTED dan enqueue auto-grade', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue(mockAttempt);
      prisma.examAttempt.update.mockResolvedValue({});

      await svc.submitExam(dto);

      expect(prisma.examAttempt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att-1' },
          data: expect.objectContaining({ status: AttemptStatus.SUBMITTED }),
        }),
      );
      expect(queue.add).toHaveBeenCalledWith(
        'auto-grade',
        expect.objectContaining({ attemptId: 'att-1', tenantId: 'tenant-1' }),
        expect.objectContaining({ jobId: 'grade-att-1' }),
      );
      expect(auditLogs.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SUBMIT_EXAM' }),
      );
    });

    it('enqueue timeout saat scheduleTimeout dipanggil', async () => {
      await svc.scheduleTimeout('att-1', 'tenant-1', 'sess-1', 90);
      expect(queue.add).toHaveBeenCalledWith(
        'timeout-attempt',
        expect.objectContaining({ attemptId: 'att-1' }),
        expect.objectContaining({
          jobId: 'timeout-att-1',
          delay: 90 * 60 * 1000,
        }),
      );
    });
  });

  // ── getAttemptResult ──────────────────────────────────────────────────────
  describe('getAttemptResult', () => {
    it('throw jika attempt tidak ditemukan atau bukan milik user', async () => {
      prisma.examAttempt.findFirst = jest.fn().mockResolvedValue(null);
      await expect(svc.getAttemptResult('att-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('return status message jika belum PUBLISHED', async () => {
      (prisma.examAttempt as any).findFirst = jest.fn().mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.SUBMITTED,
        gradingStatus: 'PENDING',
        session: { title: 'Ujian', examPackage: { title: 'Paket', settings: {} } },
        answers: [],
      });
      const result = await svc.getAttemptResult('att-1', 'user-1');
      expect(result).toMatchObject({ gradingStatus: 'PENDING', message: expect.any(String) });
      expect(result).not.toHaveProperty('totalScore');
    });

    it('return hasil lengkap jika PUBLISHED', async () => {
      (prisma.examAttempt as any).findFirst = jest.fn().mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.SUBMITTED,
        gradingStatus: 'PUBLISHED',
        totalScore: 80,
        maxScore: 100,
        submittedAt: new Date(),
        gradingCompletedAt: new Date(),
        session: {
          title: 'Ujian MTK',
          examPackage: { title: 'Paket MTK', settings: { passingScore: 75 } },
        },
        answers: [
          {
            questionId: 'q-1',
            score: 80,
            maxScore: 100,
            feedback: null,
            isAutoGraded: true,
            gradedAt: new Date(),
          },
        ],
      });
      const result = await svc.getAttemptResult('att-1', 'user-1');
      expect(result).toMatchObject({
        totalScore: 80,
        maxScore: 100,
        percentage: 80,
        isPassed: true,
      });
    });
  });
});
