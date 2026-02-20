// ══════════════════════════════════════════════════════════════
// src/modules/sync/services/sync.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { SyncStatus } from '../../../common/enums/sync-status.enum';
import { AddSyncItemDto } from '../dto/add-sync-item.dto';
import { RetrySyncDto } from '../dto/retry-sync.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SyncService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('sync') private syncQueue: Queue,
  ) {}

  async addItem(dto: AddSyncItemDto) {
    const item = await this.prisma.syncQueue.upsert({
      where: { idempotencyKey: dto.idempotencyKey },
      create: {
        attemptId: dto.attemptId,
        idempotencyKey: dto.idempotencyKey,
        type: dto.type,
        payload: dto.payload as Prisma.InputJsonValue,
        status: SyncStatus.PENDING,
      },
      update: {},
    });

    await this.syncQueue.add(
      'process',
      { syncItemId: item.id },
      {
        jobId: item.id,
        removeOnFail: false,
      },
    );

    return item;
  }

  async getStatus(attemptId: string) {
    const items = await this.prisma.syncQueue.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'desc' },
    });
    const pending = items.filter((i) => i.status === SyncStatus.PENDING).length;
    const failed = items.filter((i) => i.status === SyncStatus.FAILED).length;
    return { total: items.length, pending, failed, items };
  }

  async retryFailed(dto: RetrySyncDto) {
    const item = await this.prisma.syncQueue.findUnique({ where: { id: dto.syncItemId } });
    if (!item) throw new NotFoundException('Sync item tidak ditemukan');
    if (item.status !== SyncStatus.FAILED)
      throw new BadRequestException('Hanya item FAILED yang bisa di-retry');

    await this.prisma.syncQueue.update({
      where: { id: item.id },
      data: { status: SyncStatus.PENDING, retryCount: { increment: 1 } },
    });
    await this.syncQueue.add('process', { syncItemId: item.id }, { removeOnFail: false });
    return { message: 'Sync item dijadwalkan ulang' };
  }
}
