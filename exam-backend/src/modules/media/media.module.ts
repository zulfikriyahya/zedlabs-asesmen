// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/media.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaService } from './services/media.service';
import { MediaUploadService } from './services/media-upload.service';
import { MediaCompressionService } from './services/media-compression.service';
import { MediaProcessor } from './processors/media.processor';
import { MediaController } from './controllers/media.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'media' })],
  providers: [MediaService, MediaUploadService, MediaCompressionService, MediaProcessor],
  controllers: [MediaController],
  exports: [MediaService, MediaUploadService],
})
export class MediaModule {}
