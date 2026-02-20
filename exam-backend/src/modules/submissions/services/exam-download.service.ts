// ────────────────────────────────────────────────────────────────────────────
// src/modules/submissions/services/exam-download.service.ts — fix isNewAttempt
// ────────────────────────────────────────────────────────────────────────────
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExamPackageBuilderService } from '../../exam-packages/services/exam-package-builder.service';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { ExamSubmissionService } from './exam-submission.service';
import { sha256 } from '../../../common/utils/checksum.util';
import { SessionStatus, AttemptStatus } from '../../../common/enums/exam-status.enum';
import { isWithinWindow } from '../../../common/utils/time-validation.util';
import { hashFingerprint } from '../../../common/utils/device-fingerprint.util';
import type {
  DownloadablePackage,
  DownloadableQuestion,
} from '../interfaces/exam-package.interface';

@Injectable()
export class ExamDownloadService {
  constructor(
    private prisma: PrismaService,
    private builder: ExamPackageBuilderService,
    private auditLogs: AuditLogsService,
    private submissionSvc: ExamSubmissionService,
  ) {}

  async downloadPackage(
    tenantId: string,
    sessionId: string,
    userId: string,
    tokenCode: string,
    deviceFingerprint: string,
    idempotencyKey: string,
  ): Promise<DownloadablePackage> {
    const session = await this.prisma.examSession.findFirst({
      where: { id: sessionId, tenantId, status: SessionStatus.ACTIVE },
      include: { examPackage: true },
    });
    if (!session) throw new NotFoundException('Sesi tidak aktif atau tidak ditemukan');

    if (!isWithinWindow(session.startTime, session.endTime)) {
      throw new BadRequestException('Ujian tidak dalam jangka waktu yang valid');
    }

    const ss = await this.prisma.sessionStudent.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!ss || ss.tokenCode !== tokenCode) {
      throw new BadRequestException('Token tidak valid');
    }

    // Cek apakah attempt sudah ada sebelum upsert (untuk deteksi isNewAttempt yang akurat)
    const existingAttempt = await this.prisma.examAttempt.findUnique({
      where: { idempotencyKey },
    });
    const isNewAttempt = !existingAttempt;

    const attempt = await this.prisma.examAttempt.upsert({
      where: { idempotencyKey },
      create: {
        sessionId,
        userId,
        idempotencyKey,
        deviceFingerprint: hashFingerprint(deviceFingerprint),
        status: AttemptStatus.IN_PROGRESS,
      },
      update: {},
    });

    const settings = session.examPackage.settings as {
      shuffleQuestions?: boolean;
      duration?: number;
    };

    const pkg = await this.builder.buildForDownload(
      tenantId,
      session.examPackageId,
      settings.shuffleQuestions ?? false,
    );

    await this.auditLogs.log({
      tenantId,
      userId,
      action: 'DOWNLOAD_EXAM_PACKAGE',
      entityType: 'ExamAttempt',
      entityId: attempt.id,
      after: { sessionId, packageId: session.examPackageId, checksum: pkg.checksum },
    });

    if (isNewAttempt && settings.duration) {
      await this.submissionSvc.scheduleTimeout(attempt.id, tenantId, sessionId, settings.duration);
    }

    return {
      packageId: pkg.packageId,
      title: pkg.title,
      settings: pkg.settings as Record<string, unknown>,
      questions: pkg.questions as unknown as DownloadableQuestion[],
      sessionId,
      attemptId: attempt.id,
      checksum: pkg.checksum,
      encryptedKey: '',
      expiresAt: session.endTime.toISOString(),
    };
  }
}
