// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/processors/submission.processor.ts
// ════════════════════════════════════════════════════════════════════════════
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { GradingService } from '../../grading/services/grading.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AttemptStatus } from '../../../common/enums/exam-status.enum';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';

export interface AutoGradeJobData {
  attemptId: string;
  tenantId: string;
}

export interface TimeoutJobData {
  attemptId: string;
  tenantId: string;
  sessionId: string;
}

@Processor('submission')
export class SubmissionProcessor extends WorkerHost {
  private readonly logger = new Logger(SubmissionProcessor.name);

  constructor(
    private gradingSvc: GradingService,
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {
    super();
  }

  async process(job: Job<AutoGradeJobData | TimeoutJobData>): Promise<void> {
    this.logger.log(`Processing job [${job.name}] id=${job.id}`);

    switch (job.name) {
      case 'auto-grade':
        await this.handleAutoGrade(job as Job<AutoGradeJobData>);
        break;
      case 'timeout-attempt':
        await this.handleTimeout(job as Job<TimeoutJobData>);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  // ── Auto-grade setelah submit ──────────────────────────────────────────────
  private async handleAutoGrade(job: Job<AutoGradeJobData>) {
    const { attemptId, tenantId } = job.data;

    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId },
      select: { id: true, status: true, userId: true, sessionId: true },
    });

    if (!attempt) {
      this.logger.warn(`Attempt ${attemptId} tidak ditemukan, skip.`);
      return;
    }

    if (attempt.status !== AttemptStatus.SUBMITTED) {
      this.logger.warn(`Attempt ${attemptId} status=${attempt.status}, skip auto-grade.`);
      return;
    }

    try {
      await this.gradingSvc.runAutoGrade(attemptId);

      await this.auditLogs.log({
        tenantId,
        userId: attempt.userId,
        action: 'AUTO_GRADE_COMPLETED',
        entityType: 'ExamAttempt',
        entityId: attemptId,
        after: { attemptId, gradedAt: new Date().toISOString() },
      });

      this.logger.log(`Auto-grade selesai untuk attempt ${attemptId}`);
    } catch (err) {
      this.logger.error(`Auto-grade gagal untuk attempt ${attemptId}`, (err as Error).stack);
      throw err; // BullMQ akan retry sesuai konfigurasi
    }
  }

  // ── Timeout: paksa submit attempt yang melebihi durasi ────────────────────
  private async handleTimeout(job: Job<TimeoutJobData>) {
    const { attemptId, tenantId } = job.data;

    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, status: AttemptStatus.IN_PROGRESS },
      select: { id: true, userId: true },
    });

    if (!attempt) return; // sudah di-submit manual, tidak perlu timeout

    await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: { status: AttemptStatus.TIMED_OUT, submittedAt: new Date() },
    });

    await this.auditLogs.log({
      tenantId,
      userId: attempt.userId,
      action: 'ATTEMPT_TIMED_OUT',
      entityType: 'ExamAttempt',
      entityId: attemptId,
    });

    // Tetap jalankan auto-grade meski timeout
    await this.gradingSvc.runAutoGrade(attemptId);

    this.logger.log(`Attempt ${attemptId} di-timeout dan di-auto-grade.`);
  }
}
