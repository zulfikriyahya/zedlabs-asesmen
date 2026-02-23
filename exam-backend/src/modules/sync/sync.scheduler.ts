import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChunkedUploadService } from './services/chunked-upload.service';

@Injectable()
export class SyncScheduler {
  private readonly logger = new Logger(SyncScheduler.name);

  constructor(private chunkedSvc: ChunkedUploadService) {}

  /**
   * Cleanup hanya relevan saat fallback in-memory (dev tanpa Redis).
   * Di production dengan Redis, TTL menangani expiry otomatis.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  handleCleanup() {
    // Signature tetap kompatibel dengan parameter opsional
    const removed = this.chunkedSvc.cleanupStale(120);
    if (removed > 0) this.logger.log(`In-memory chunk cleanup: ${removed} entries removed`);
  }
}
