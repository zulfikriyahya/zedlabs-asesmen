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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('Sync')
@ApiBearerAuth()
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
  @ApiOperation({
    summary: 'Tambah item ke sync queue',
    description: 'Endpoint utama untuk offline recovery. Idempoten via idempotencyKey.',
  })
  @ApiResponse({ status: 200, description: 'Item ditambahkan / sudah ada (idempoten)' })
  add(@Body() dto: AddSyncItemDto) {
    return this.svc.addItem(dto);
  }

  @Get(':attemptId/status')
  @ThrottleRelaxed()
  @ApiOperation({ summary: 'Status sync queue untuk satu attempt' })
  @ApiParam({ name: 'attemptId', description: 'Attempt ID' })
  @ApiResponse({ status: 200, description: 'Total, pending, failed, dan list item' })
  status(@Param('attemptId') id: string) {
    return this.svc.getStatus(id);
  }

  @Post('retry')
  @ThrottleModerate()
  @ApiOperation({ summary: 'Retry item sync yang gagal (status FAILED)' })
  @ApiResponse({ status: 200, description: 'Item dijadwalkan ulang' })
  @ApiResponse({ status: 400, description: 'Hanya item FAILED yang bisa di-retry' })
  @ApiResponse({ status: 404, description: 'Sync item tidak ditemukan' })
  retry(@Body() dto: RetrySyncDto) {
    return this.svc.retryFailed(dto);
  }

  @Post('upload/chunk')
  @ThrottleModerate()
  @UseInterceptors(FileInterceptor('chunk'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload satu chunk file media',
    description:
      'Kirim chunk satu per satu. Setelah semua chunk diterima, panggil /sync/upload/finalize.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        chunk: { type: 'string', format: 'binary', description: 'Data chunk (maks 50MB)' },
        meta: { type: 'string', description: 'JSON string dari UploadChunkDto' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '{ fileId, saved, total, isComplete }' })
  @ApiResponse({ status: 400, description: 'meta JSON tidak valid / attempt tidak ditemukan' })
  async uploadChunk(
    @UploadedFile(
      new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: MAX_CHUNK_SIZE })] }),
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
  @ApiOperation({
    summary: 'Finalize chunked upload',
    description: 'Gabungkan semua chunk, upload ke MinIO, update mediaUrls pada ExamAnswer.',
  })
  @ApiResponse({ status: 200, description: '{ objectName, questionId, attemptId }' })
  @ApiResponse({ status: 400, description: 'Upload belum lengkap / attempt tidak ditemukan' })
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
        data: { mediaUrls: [...new Set([...answer.mediaUrls, objectName])], updatedAt: new Date() },
      });
    }

    this.logger.log(`Finalize: attempt=${dto.attemptId} q=${dto.questionId} obj=${objectName}`);
    return { objectName, questionId: dto.questionId, attemptId: dto.attemptId };
  }
}
