// ════════════════════════════════════════════════════════════════════════════
// src/modules/sessions/services/session-monitoring.service.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SessionMonitoringService {
  constructor(private prisma: PrismaService) {}

  async getLiveStatus(sessionId: string) {
    return this.prisma.examAttempt.findMany({
      where: { sessionId },
      select: {
        id: true,
        userId: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        user: { select: { username: true } },
        _count: { select: { answers: true } },
      },
    });
  }
}
