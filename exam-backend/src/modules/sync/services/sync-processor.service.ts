// ── services/sync-processor.service.ts ──────────────────
@Injectable()
export class SyncProcessorService {
  private readonly logger = new Logger(SyncProcessorService.name);

  constructor(private prisma: PrismaService) {}

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
    await this.prisma.examAttempt.update({
      where: { id: payload.attemptId as string },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
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
