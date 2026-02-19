// ════════════════════════════════════════════════════════════════════════════
// src/modules/sync/sync.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SyncService } from './services/sync.service';
import { SyncProcessorService } from './services/sync-processor.service';
import { ChunkedUploadService } from './services/chunked-upload.service';
import { SyncProcessor } from './processors/sync.processor';
import { SyncController } from './controllers/sync.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'sync' })],
  providers: [SyncService, SyncProcessorService, ChunkedUploadService, SyncProcessor],
  controllers: [SyncController],
  exports: [SyncService],
})
export class SyncModule {}
