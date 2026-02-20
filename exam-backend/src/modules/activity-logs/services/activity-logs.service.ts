// ════════════════════════════════════════════════════════════════════════════
// src/modules/activity-logs/services/activity-logs.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MonitoringGateway } from '../../monitoring/gateways/monitoring.gateway';
import { CreateActivityLogDto } from '../dto/create-activity-log.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ActivityLogsService {
  constructor(
    private prisma: PrismaService,
    private monitorGateway: MonitoringGateway,
  ) {}

  async create(dto: CreateActivityLogDto) {
    const log = await this.prisma.examActivityLog.create({
      data: {
        attemptId: dto.attemptId,
        userId: dto.userId,
        type: dto.type,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      select: { sessionId: true },
    });
    if (attempt) this.monitorGateway.broadcastActivityLog(attempt.sessionId, log);

    return log;
  }

  findByAttempt(attemptId: string) {
    return this.prisma.examActivityLog.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
