import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { MediaModule } from '../media/media.module';
import { SyncService } from './services/sync.service';
import { SyncProcessorService } from './services/sync-processor.service';
import { ChunkedUploadService } from './services/chunked-upload.service';
import { SyncProcessor } from './processors/sync.processor';
import { SyncController } from './controllers/sync.controller';
import { SyncScheduler } from './sync.scheduler';
import { PowerSyncController } from './controllers/powersync.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'sync' }), ScheduleModule.forRoot(), MediaModule],
  providers: [
    SyncService,
    SyncProcessorService,
    ChunkedUploadService,
    SyncProcessor,
    SyncScheduler,
  ],
  controllers: [SyncController, PowerSyncController],
  exports: [SyncService, ChunkedUploadService],
})
export class SyncModule {}
