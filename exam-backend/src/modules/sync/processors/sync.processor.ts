import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SyncProcessorService } from '../services/sync-processor.service';

@Processor('sync', { concurrency: 5 })
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private processorSvc: SyncProcessorService) {
    super();
  }

  async process(job: Job<{ syncItemId: string }>) {
    this.logger.log(`Processing sync job ${job.id} — item ${job.data.syncItemId}`);
    await this.processorSvc.process(job.data.syncItemId);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Sync job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(`Sync job ${job?.id ?? '?'} failed: ${err.message}`);
  }
}
