import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MediaModule } from '../media/media.module';
import { PowerSyncController } from './controllers/powersync.controller';
import { SyncController } from './controllers/sync.controller';
import { SyncProcessor } from './processors/sync.processor';
import { ChunkedUploadService } from './services/chunked-upload.service';
import { SyncProcessorService } from './services/sync-processor.service';
import { SyncService } from './services/sync.service';
import { SyncScheduler } from './sync.scheduler';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'sync' }),
    // [Fix #9] Daftarkan submission queue agar SyncProcessorService bisa inject
    BullModule.registerQueue({ name: 'submission' }),
    ScheduleModule.forRoot(),
    MediaModule,
  ],
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
