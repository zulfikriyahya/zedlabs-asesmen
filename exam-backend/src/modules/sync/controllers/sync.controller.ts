import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import {
  ThrottleModerate,
  ThrottleRelaxed,
} from '../../../common/decorators/throttle-tier.decorator';
import { SyncService } from '../services/sync.service';
import { ChunkedUploadService } from '../services/chunked-upload.service';
import { MediaUploadService } from '../../media/services/media-upload.service';
import { AddSyncItemDto } from '../dto/add-sync-item.dto';
import { RetrySyncDto } from '../dto/retry-sync.dto';
import { UploadChunkDto } from '../dto/upload-chunk.dto';
import { PrismaService } from '../../../prisma/prisma.service';

const MAX_CHUNK_SIZE = 50 * 1024 * 1024;

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(
    private svc: SyncService,
    private chunkedSvc: ChunkedUploadService,
    private mediaUploadSvc: MediaUploadService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @ThrottleModerate()
  add(@Body() dto: AddSyncItemDto) {
    return this.svc.addItem(dto);
  }

  @Get(':attemptId/status')
  @ThrottleRelaxed()
  status(@Param('attemptId') id: string) {
    return this.svc.getStatus(id);
  }

  @Post('retry')
  @ThrottleModerate()
  retry(@Body() dto: RetrySyncDto) {
    return this.svc.retryFailed(dto);
  }

  @Post('upload/chunk')
  @ThrottleModerate()
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_CHUNK_SIZE })],
      }),
    )
    file: Express.Multer.File,
    @Body('meta') metaRaw: string,
    @CurrentUser() u: CurrentUserPayload,
  ) {
    let dto: UploadChunkDto;
    try {
      dto = JSON.parse(metaRaw) as UploadChunkDto;
    } catch {
      throw new BadRequestException('Field `meta` harus berupa JSON valid');
    }

    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: dto.attemptId, userId: u.sub },
      select: { id: true, status: true },
    });
    if (!attempt) throw new BadRequestException('Attempt tidak ditemukan atau bukan milik Anda');
    if (attempt.status === 'SUBMITTED' || attempt.status === 'TIMED_OUT') {
      throw new BadRequestException('Ujian sudah selesai, upload tidak diizinkan');
    }

    const { saved, total } = await this.chunkedSvc.saveChunk({
      fileId: dto.fileId,
      chunkIndex: dto.chunkIndex,
      totalChunks: dto.totalChunks,
      data: file.buffer,
    });

    return { fileId: dto.fileId, saved, total, isComplete: saved >= total };
  }

  @Post('upload/finalize')
  @ThrottleModerate()
  async finalizeUpload(@Body() dto: UploadChunkDto, @CurrentUser() u: CurrentUserPayload) {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: dto.attemptId, userId: u.sub },
      select: { id: true },
    });
    if (!attempt) throw new BadRequestException('Attempt tidak ditemukan atau bukan milik Anda');

    if (!this.chunkedSvc.isComplete(dto.fileId, dto.totalChunks)) {
      throw new BadRequestException(
        `Upload belum lengkap. Kirim semua ${dto.totalChunks} chunk terlebih dahulu.`,
      );
    }

    const buffer = await this.chunkedSvc.assemble(dto.fileId, dto.totalChunks);
    const { objectName } = await this.mediaUploadSvc.uploadAndQueue(
      buffer,
      dto.originalName,
      dto.type,
    );

    const answer = await this.prisma.examAnswer.findFirst({
      where: { attemptId: dto.attemptId, questionId: dto.questionId },
      select: { id: true, mediaUrls: true },
    });
    if (answer) {
      await this.prisma.examAnswer.update({
        where: { id: answer.id },
        data: {
          mediaUrls: [...new Set([...answer.mediaUrls, objectName])],
          updatedAt: new Date(),
        },
      });
    }

    this.logger.log(`Finalize: attempt=${dto.attemptId} q=${dto.questionId} obj=${objectName}`);
    return { objectName, questionId: dto.questionId, attemptId: dto.attemptId };
  }
}
