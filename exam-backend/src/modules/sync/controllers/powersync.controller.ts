import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { SyncService } from '../services/sync.service';
import { SyncType, SyncStatus } from '../../../common/enums/sync-status.enum';
import { PrismaService } from '../../../prisma/prisma.service';

interface PowerSyncCheckpoint {
  last_op_id: string;
  write_checkpoint?: string;
}

interface PowerSyncDataLine {
  op: 'PUT' | 'REMOVE' | 'CLEAR';
  object_type?: string;
  object_id?: string;
  data?: Record<string, unknown>;
}

@ApiTags('PowerSync')
@ApiBearerAuth()
@Controller('powersync')
@UseGuards(JwtAuthGuard)
export class PowerSyncController {
  private readonly logger = new Logger(PowerSyncController.name);

  constructor(
    private syncSvc: SyncService,
    private prisma: PrismaService,
  ) {}

  /**
   * POST /powersync/data
   * Terima batch mutations dari PowerSync client (offline recovery).
   * Format: NDJSON — setiap baris adalah satu operasi.
   */
  @Post('data')
  @ApiOperation({ summary: 'Terima batch mutations dari PowerSync client' })
  async receiveData(
    @CurrentUser() u: CurrentUserPayload,
    @Body()
    body: {
      batch: Array<{
        type: SyncType;
        payload: Record<string, unknown>;
        idempotencyKey: string;
        attemptId: string;
      }>;
    },
  ) {
    if (!Array.isArray(body.batch) || body.batch.length === 0) {
      throw new BadRequestException('batch harus array non-kosong');
    }

    const results = await Promise.allSettled(
      body.batch.map((item) =>
        this.syncSvc.addItem({
          attemptId: item.attemptId,
          idempotencyKey: item.idempotencyKey,
          type: item.type,
          payload: item.payload,
        }),
      ),
    );

    const accepted = results.filter((r) => r.status === 'fulfilled').length;
    const rejected = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(`PowerSync batch: ${accepted} accepted, ${rejected} rejected — user=${u.sub}`);
    return { accepted, rejected };
  }

  /**
   * GET /powersync/checkpoint
   * Kembalikan checkpoint terakhir untuk klien — digunakan PowerSync
   * untuk menentukan titik sync selanjutnya.
   */
  @Get('checkpoint')
  @ApiOperation({ summary: 'Checkpoint terakhir untuk PowerSync client' })
  async getCheckpoint(@CurrentUser() u: CurrentUserPayload): Promise<PowerSyncCheckpoint> {
    // Ambil syncQueue item terbaru milik user sebagai last_op_id
    const latest = await this.prisma.syncQueue.findFirst({
      where: {
        attempt: { userId: u.sub },
        status: SyncStatus.COMPLETED,
      },
      orderBy: { processedAt: 'desc' },
      select: { id: true, processedAt: true },
    });

    return {
      last_op_id: latest?.id ?? '0',
      write_checkpoint: latest?.processedAt?.toISOString(),
    };
  }

  /**
   * GET /powersync/status
   * Status sync queue untuk user — digunakan UI untuk menampilkan
   * indikator "N item belum tersinkron".
   */
  @Get('status')
  @ApiOperation({ summary: 'Status sync queue milik user' })
  async getStatus(@CurrentUser() u: CurrentUserPayload) {
    const counts = await this.prisma.syncQueue.groupBy({
      by: ['status'],
      where: { attempt: { userId: u.sub } },
      _count: { status: true },
    });

    const byStatus = Object.fromEntries(counts.map((c) => [c.status, c._count.status]));

    return {
      pending: byStatus[SyncStatus.PENDING] ?? 0,
      processing: byStatus[SyncStatus.PROCESSING] ?? 0,
      failed: byStatus[SyncStatus.FAILED] ?? 0,
      deadLetter: byStatus[SyncStatus.DEAD_LETTER] ?? 0,
      completed: byStatus[SyncStatus.COMPLETED] ?? 0,
    };
  }
}
