import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { SyncStatus, SyncType } from '../../../common/enums/sync-status.enum';
import type { AutoGradeJobData } from '../../submissions/processors/submission.processor';

@Injectable()
export class SyncProcessorService {
  private readonly logger = new Logger(SyncProcessorService.name);

  constructor(
    private prisma: PrismaService,
    // [Fix #9] Inject submission queue untuk trigger auto-grade
    @InjectQueue('submission') private submissionQueue: Queue,
  ) {}

  async process(syncItemId: string) {
    const item = await this.prisma.syncQueue.findUnique({ where: { id: syncItemId } });
    if (!item || item.status === SyncStatus.COMPLETED) return;

    await this.prisma.syncQueue.update({
      where: { id: syncItemId },
      data: { status: SyncStatus.PROCESSING },
    });

    try {
      switch (item.type) {
        case SyncType.SUBMIT_ANSWER:
          await this.processSubmitAnswer(item.payload as Record<string, unknown>);
          break;
        case SyncType.SUBMIT_EXAM:
          // [Fix #9] Sekarang juga trigger auto-grade
          await this.processSubmitExam(item.payload as Record<string, unknown>);
          break;
        case SyncType.ACTIVITY_LOG:
          await this.processActivityLog(item.payload as Record<string, unknown>);
          break;
        default:
          this.logger.warn(`Unknown sync type: ${item.type}`);
      }

      await this.prisma.syncQueue.update({
        where: { id: syncItemId },
        data: { status: SyncStatus.COMPLETED, processedAt: new Date() },
      });
    } catch (err) {
      const retryCount = item.retryCount + 1;
      const status = retryCount >= item.maxRetries ? SyncStatus.DEAD_LETTER : SyncStatus.FAILED;
      await this.prisma.syncQueue.update({
        where: { id: syncItemId },
        data: { status, retryCount, lastError: (err as Error).message },
      });
      throw err;
    }
  }

  private async processSubmitAnswer(payload: Record<string, unknown>) {
    await this.prisma.examAnswer.upsert({
      where: { idempotencyKey: payload.idempotencyKey as string },
      create: {
        attemptId: payload.attemptId as string,
        questionId: payload.questionId as string,
        idempotencyKey: payload.idempotencyKey as string,
        answer: payload.answer as object,
        mediaUrls: (payload.mediaUrls as string[]) ?? [],
      },
      update: { answer: payload.answer as object, updatedAt: new Date() },
    });
  }

  private async processSubmitExam(payload: Record<string, unknown>) {
    const attemptId = payload.attemptId as string;

    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: { status: true, session: { select: { tenantId: true } } },
    });

    // Idempoten: skip jika sudah disubmit
    if (!attempt || attempt.status === 'SUBMITTED' || attempt.status === 'TIMED_OUT') {
      this.logger.log(`Attempt ${attemptId} sudah disubmit sebelumnya, skip.`);
      return;
    }

    await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });

    // [Fix #9] Trigger auto-grade setelah submit
    const jobData: AutoGradeJobData = {
      attemptId,
      tenantId: attempt.session.tenantId,
    };

    await this.submissionQueue.add('auto-grade', jobData, {
      jobId: `grade-${attemptId}`,
      removeOnComplete: 50,
      removeOnFail: false,
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });

    this.logger.log(`Auto-grade dijadwalkan untuk attempt ${attemptId} via sync`);
  }

  private async processActivityLog(payload: Record<string, unknown>) {
    await this.prisma.examActivityLog.create({
      data: {
        attemptId: payload.attemptId as string,
        userId: payload.userId as string,
        type: payload.type as string,
        metadata: payload.metadata as object,
      },
    });
  }
}
