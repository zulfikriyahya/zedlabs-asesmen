// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/processors/submission.processor.ts  (FINAL)
// Gunakan GradingHelperService, bukan GradingService (circular dep resolved)
// ════════════════════════════════════════════════════════════════════════════
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { GradingHelperService } from '../services/grading-helper.service';
import { AttemptStatus } from '../../../common/enums/exam-status.enum';

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
    private gradingHelper: GradingHelperService,
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {
    super();
  }

  async process(job: Job<AutoGradeJobData | TimeoutJobData>): Promise<void> {
    this.logger.log(`[${job.name}] id=${job.id} attempt=${job.attemptsMade + 1}`);

    switch (job.name) {
      case 'auto-grade':
        await this.handleAutoGrade(job as Job<AutoGradeJobData>);
        break;
      case 'timeout-attempt':
        await this.handleTimeout(job as Job<TimeoutJobData>);
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`[${job.name}] id=${job.id} ✓`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(
      `[${job?.name ?? '?'}] id=${job?.id ?? '?'} attempt=${job?.attemptsMade ?? '?'} ✗ ${err.message}`,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Job id=${jobId} stalled.`);
  }

  // ── Auto-grade ─────────────────────────────────────────────────────────────
  private async handleAutoGrade(job: Job<AutoGradeJobData>) {
    const { attemptId, tenantId } = job.data;

    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId },
      select: { id: true, status: true, userId: true },
    });

    if (!attempt) {
      this.logger.warn(`Attempt ${attemptId} tidak ditemukan, skip.`);
      return;
    }

    if (attempt.status !== AttemptStatus.SUBMITTED && attempt.status !== AttemptStatus.TIMED_OUT) {
      this.logger.warn(`Attempt ${attemptId} belum disubmit (${attempt.status}), skip.`);
      return;
    }

    await this.gradingHelper.runAutoGrade(attemptId);

    await this.auditLogs.log({
      tenantId,
      userId: attempt.userId,
      action: 'AUTO_GRADE_COMPLETED',
      entityType: 'ExamAttempt',
      entityId: attemptId,
    });
  }

  // ── Timeout ────────────────────────────────────────────────────────────────
  private async handleTimeout(job: Job<TimeoutJobData>) {
    const { attemptId, tenantId } = job.data;

    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, status: AttemptStatus.IN_PROGRESS },
      select: { id: true, userId: true },
    });

    if (!attempt) {
      // Sudah di-submit manual atau sudah timeout sebelumnya
      this.logger.log(`Attempt ${attemptId} sudah tidak IN_PROGRESS, timeout skip.`);
      return;
    }

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

    // Auto-grade meski timeout — guru masih bisa review manual
    await this.gradingHelper.runAutoGrade(attemptId);
  }
}
