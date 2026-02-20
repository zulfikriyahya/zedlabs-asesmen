import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChunkedUploadService } from './services/chunked-upload.service';

@Injectable()
export class SyncScheduler {
  private readonly logger = new Logger(SyncScheduler.name);

  constructor(private chunkedSvc: ChunkedUploadService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  handleCleanup() {
    const removed = this.chunkedSvc.cleanupStale(120);
    if (removed > 0) this.logger.log(`Stale temp cleanup: ${removed} dirs removed`);
  }
}
