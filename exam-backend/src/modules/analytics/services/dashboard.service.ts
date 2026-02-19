// ════════════════════════════════════════════════════════════════════════════
// src/modules/analytics/services/dashboard.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const [totalUsers, totalSessions, activeAttempts, pendingGrading] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { tenantId, isActive: true } }),
        this.prisma.examSession.count({ where: { tenantId } }),
        this.prisma.examAttempt.count({
          where: { session: { tenantId }, status: 'IN_PROGRESS' },
        }),
        this.prisma.examAttempt.count({
          where: { session: { tenantId }, gradingStatus: 'MANUAL_REQUIRED' },
        }),
      ]);
    return { totalUsers, totalSessions, activeAttempts, pendingGrading };
  }
}
