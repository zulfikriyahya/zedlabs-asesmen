// ════════════════════════════════════════════════════════════════════════════
// src/modules/analytics/services/analytics.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSessionAnalytics(tenantId: string, sessionId: string) {
    const attempts = await this.prisma.examAttempt.findMany({
      where: { session: { tenantId }, sessionId },
      include: { answers: { select: { score: true, maxScore: true } } },
    });

    const scores = attempts.map((a) => ({
      userId: a.userId,
      totalScore: a.totalScore ?? 0,
      maxScore: a.maxScore ?? 0,
      percentage: a.maxScore ? ((a.totalScore ?? 0) / a.maxScore) * 100 : 0,
    }));

    const avg = scores.length ? scores.reduce((s, a) => s + a.percentage, 0) / scores.length : 0;

    return {
      sessionId,
      totalStudents: scores.length,
      avg: Math.round(avg * 10) / 10,
      highest: scores.length ? Math.max(...scores.map((s) => s.percentage)) : 0,
      lowest: scores.length ? Math.min(...scores.map((s) => s.percentage)) : 0,
      scores,
    };
  }
}
