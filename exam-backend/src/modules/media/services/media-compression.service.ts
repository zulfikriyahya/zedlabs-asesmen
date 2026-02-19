// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/services/media-compression.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class MediaCompressionService {
  private readonly logger = new Logger(MediaCompressionService.name);

  async compressImage(input: Buffer, quality = 80): Promise<Buffer> {
    return sharp(input)
      .webp({ quality })
      .toBuffer()
      .catch((err) => {
        this.logger.error('Image compression failed', err);
        return input; // fallback ke original
      });
  }

  async resizeImage(input: Buffer, width: number, height?: number): Promise<Buffer> {
    return sharp(input)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
  }
}
