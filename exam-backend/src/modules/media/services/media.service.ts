// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/services/media.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { generateObjectName } from '../../../common/utils/file.util';

@Injectable()
export class MediaService {
  private minio: Minio.Client;
  private bucket: string;

  constructor(private cfg: ConfigService) {
    this.minio = new Minio.Client({
      endPoint: cfg.get('MINIO_ENDPOINT', 'localhost'),
      port: cfg.get<number>('MINIO_PORT', 9000),
      useSSL: cfg.get('MINIO_USE_SSL') === 'true',
      accessKey: cfg.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: cfg.get('MINIO_SECRET_KEY', 'minioadmin'),
    });
    this.bucket = cfg.get('MINIO_BUCKET', 'exam-assets');
  }

  async upload(buffer: Buffer, originalName: string, prefix = 'media'): Promise<string> {
    const objectName = generateObjectName(originalName, prefix);
    await this.minio.putObject(this.bucket, objectName, buffer);
    return objectName;
  }

  async getPresignedUrl(objectName: string): Promise<string> {
    const ttl = this.cfg.get<number>('MINIO_PRESIGNED_TTL', 3600);
    return this.minio.presignedGetObject(this.bucket, objectName, ttl);
  }

  async delete(objectName: string): Promise<void> {
    await this.minio.removeObject(this.bucket, objectName);
  }
}
