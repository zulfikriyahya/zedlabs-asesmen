// ── media.module.ts ──────────────────────────────────
import { BullModule, InjectQueue as IQ } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { generateObjectName } from '../../common/utils/file.util';

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

@Injectable()
export class MediaUploadService {
  constructor(
    private mediaSvc: MediaService,
    @IQ('media') private mediaQueue: Queue,
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

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private mediaSvc: MediaService,
    private uploadSvc: MediaUploadService,
  ) {}

  @Get('presigned/:key') getUrl(@Param('key') key: string) {
    return this.mediaSvc.getPresignedUrl(key);
  }
}

@Module({
  imports: [BullModule.registerQueue({ name: 'media' })],
  providers: [MediaService, MediaUploadService],
  controllers: [MediaController],
  exports: [MediaService, MediaUploadService],
})
export class MediaModule {}
