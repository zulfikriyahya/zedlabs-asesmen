// ══════════════════════════════════════════════════════════════
// src/modules/sync/processors/sync.processor.ts
// ══════════════════════════════════════════════════════════════
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SyncProcessorService } from '../services/sync-processor.service';

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
