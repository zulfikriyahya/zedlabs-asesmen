import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamDownloadService } from '../../../src/modules/submissions/services/exam-download.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ExamPackageBuilderService } from '../../../src/modules/exam-packages/services/exam-package-builder.service';
import { AuditLogsService } from '../../../src/modules/audit-logs/services/audit-logs.service';
import { ExamSubmissionService } from '../../../src/modules/submissions/services/exam-submission.service';
import { SessionStatus, AttemptStatus } from '../../../src/common/enums/exam-status.enum';

describe('ExamDownloadService', () => {
  let svc: ExamDownloadService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let builder: { buildForDownload: jest.Mock };
  let submissionSvc: { scheduleTimeout: jest.Mock };

  const mockSession = {
    id: 'sess-1',
    tenantId: 'tenant-1',
    examPackageId: 'pkg-1',
    startTime: new Date(Date.now() - 1000),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    status: SessionStatus.ACTIVE,
    examPackage: { settings: { shuffleQuestions: false, duration: 90 } },
  };

  const mockBuiltPackage = {
    packageId: 'pkg-1',
    title: 'Paket Test',
    settings: { duration: 90 },
    questions: [],
    checksum: 'abc123',
  };

  beforeEach(async () => {
    prisma = {
      examSession: { findFirst: jest.fn() },
      sessionStudent: { findUnique: jest.fn() },
      examAttempt: { findUnique: jest.fn(), upsert: jest.fn() },
    };
    builder = { buildForDownload: jest.fn().mockResolvedValue(mockBuiltPackage) };
    submissionSvc = { scheduleTimeout: jest.fn().mockResolvedValue(undefined) };

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ExamDownloadService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExamPackageBuilderService, useValue: builder },
        { provide: AuditLogsService, useValue: { log: jest.fn() } },
        { provide: ExamSubmissionService, useValue: submissionSvc },
      ],
    }).compile();

    svc = mod.get(ExamDownloadService);
    jest.clearAllMocks();
  });

  it('throw NotFoundException jika sesi tidak aktif', async () => {
    prisma.examSession.findFirst.mockResolvedValue(null);
    await expect(
      svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN', 'fp', 'idem-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throw BadRequestException jika di luar jangka waktu sesi', async () => {
    prisma.examSession.findFirst.mockResolvedValue({
      ...mockSession,
      startTime: new Date(Date.now() + 60_000), // belum dimulai
      endTime: new Date(Date.now() + 120_000),
    });
    await expect(
      svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN', 'fp', 'idem-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throw BadRequestException jika tokenCode tidak valid', async () => {
    prisma.examSession.findFirst.mockResolvedValue(mockSession);
    prisma.sessionStudent.findUnique.mockResolvedValue({ tokenCode: 'CORRECT' });
    await expect(
      svc.downloadPackage('t1', 'sess-1', 'u1', 'WRONG', 'fp', 'idem-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('berhasil download dan return DownloadablePackage', async () => {
    prisma.examSession.findFirst.mockResolvedValue(mockSession);
    prisma.sessionStudent.findUnique.mockResolvedValue({ tokenCode: 'TOKEN123' });
    prisma.examAttempt.findUnique.mockResolvedValue(null); // attempt belum ada
    prisma.examAttempt.upsert.mockResolvedValue({ id: 'att-new' });

    const result = await svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN123', 'fp', 'idem-1');

    expect(result).toMatchObject({
      packageId: 'pkg-1',
      sessionId: 'sess-1',
      attemptId: 'att-new',
      checksum: 'abc123',
    });
    expect(result.expiresAt).toBeDefined();
  });

  it('jadwalkan timeout hanya untuk attempt baru', async () => {
    prisma.examSession.findFirst.mockResolvedValue(mockSession);
    prisma.sessionStudent.findUnique.mockResolvedValue({ tokenCode: 'TOKEN123' });
    prisma.examAttempt.findUnique.mockResolvedValue(null); // baru
    prisma.examAttempt.upsert.mockResolvedValue({ id: 'att-new' });

    await svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN123', 'fp', 'idem-1');
    expect(submissionSvc.scheduleTimeout).toHaveBeenCalledWith('att-new', 't1', 'sess-1', 90);
  });

  it('tidak jadwalkan timeout jika attempt sudah ada (idempoten)', async () => {
    prisma.examSession.findFirst.mockResolvedValue(mockSession);
    prisma.sessionStudent.findUnique.mockResolvedValue({ tokenCode: 'TOKEN123' });
    prisma.examAttempt.findUnique.mockResolvedValue({ id: 'att-existing' }); // sudah ada
    prisma.examAttempt.upsert.mockResolvedValue({ id: 'att-existing' });

    await svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN123', 'fp', 'idem-1');
    expect(submissionSvc.scheduleTimeout).not.toHaveBeenCalled();
  });
});
