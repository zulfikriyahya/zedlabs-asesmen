// ── processors/sync.processor.ts ────────────────────────
@Processor('sync')
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private processorSvc: SyncProcessorService) {
    super();
  }

  async process(job: Job<{ syncItemId: string }>) {
    this.logger.log(`Processing sync job ${job.id}`);
    await this.processorSvc.process(job.data.syncItemId);
  }
}
