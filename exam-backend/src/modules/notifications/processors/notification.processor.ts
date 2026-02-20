// ────────────────────────────────────────────────────────────────────────────
// src/modules/notifications/processors/notification.processor.ts — BARU
// ────────────────────────────────────────────────────────────────────────────
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job) {
    // 'send-realtime' → broadcast via Socket.IO
    // Dalam produksi: inject MonitoringGateway dan emit ke room yang tepat
    this.logger.log(`Notification job [${job.name}] processed: ${JSON.stringify(job.data)}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(`Notification job ${job?.id} failed: ${err.message}`);
  }
}
