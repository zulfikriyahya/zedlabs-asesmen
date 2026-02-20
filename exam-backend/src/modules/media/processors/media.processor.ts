// ────────────────────────────────────────────────────────────────────────────
// src/modules/media/processors/media.processor.ts — BARU (belum ada di struktur tapi dibutuhkan)
// ────────────────────────────────────────────────────────────────────────────
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MediaService } from '../services/media.service';
import { MediaCompressionService } from '../services/media-compression.service';

@Processor('media')
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);

  constructor(
    private mediaSvc: MediaService,
    private compressionSvc: MediaCompressionService,
  ) {
    super();
  }

  async process(job: Job<{ objectName: string }>) {
    switch (job.name) {
      case 'compress-image':
        await this.handleCompressImage(job.data.objectName);
        break;
      case 'transcode-video':
        this.logger.warn(`transcode-video untuk ${job.data.objectName} — perlu ffmpeg impl`);
        break;
      default:
        this.logger.warn(`Unknown media job: ${job.name}`);
    }
  }

  private async handleCompressImage(objectName: string) {
    this.logger.log(`Compressing image: ${objectName}`);
    // Dalam produksi: download dari MinIO, compress, re-upload
    // Ini placeholder — implementasi penuh perlu stream dari MinIO
    this.logger.log(`Image ${objectName} compression queued`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Media job [${job.name}] ${job.id} done`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(`Media job [${job?.name}] ${job?.id} failed: ${err.message}`);
  }
}
