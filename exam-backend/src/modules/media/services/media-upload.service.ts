// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/services/media-upload.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MediaService } from './media.service';

@Injectable()
export class MediaUploadService {
  constructor(
    private mediaSvc: MediaService,
    @InjectQueue('media') private mediaQueue: Queue,
  ) {}

  async uploadAndQueue(buffer: Buffer, originalName: string, type: 'image' | 'video' | 'audio') {
    const prefix =
      type === 'image' ? 'questions/images' : type === 'video' ? 'answers/video' : 'answers/audio';
    const objectName = await this.mediaSvc.upload(buffer, originalName, prefix);

    if (type === 'video') {
      await this.mediaQueue.add('transcode-video', { objectName }, { removeOnFail: false });
    } else if (type === 'image') {
      await this.mediaQueue.add('compress-image', { objectName }, { removeOnFail: false });
    }

    return { objectName };
  }
}
