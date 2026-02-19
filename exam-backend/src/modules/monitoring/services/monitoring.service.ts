// ════════════════════════════════════════════════════════════════════════════
// src/modules/monitoring/services/monitoring.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async getSessionOverview(sessionId: string) {
    const [attempts, total] = await this.prisma.$transaction([
      this.prisma.examAttempt.findMany({
        where: { sessionId },
        select: {
          id: true,
          userId: true,
          status: true,
          startedAt: true,
          submittedAt: true,
          user: { select: { username: true } },
          _count: { select: { answers: true, activityLogs: true } },
        },
      }),
      this.prisma.sessionStudent.count({ where: { sessionId } }),
    ]);

    const submitted = attempts.filter((a) => a.status === 'SUBMITTED').length;
    return {
      total,
      started: attempts.length,
      submitted,
      inProgress: attempts.length - submitted,
      attempts,
    };
  }

  async getActivityLogs(attemptId: string, q: BaseQueryDto) {
    return this.prisma.examActivityLog.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'desc' },
      skip: q.skip,
      take: q.limit,
    });
  }
}
