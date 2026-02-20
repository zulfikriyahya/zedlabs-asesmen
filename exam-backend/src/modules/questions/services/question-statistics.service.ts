// ══════════════════════════════════════════════════════════════
// src/modules/questions/services/question-statistics.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class QuestionStatisticsService {
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string, questionId: string) {
    const q = await this.prisma.question.findFirst({ where: { id: questionId, tenantId } });
    if (!q) throw new NotFoundException('Soal tidak ditemukan');

    const answers = await this.prisma.examAnswer.findMany({
      where: { questionId },
      select: { score: true, maxScore: true, isAutoGraded: true },
    });

    const total = answers.length;
    const correct = answers.filter(
      (a) => a.score != null && a.maxScore != null && a.score >= a.maxScore,
    ).length;
    const avgScore = total ? answers.reduce((s, a) => s + (a.score ?? 0), 0) / total : 0;

    return {
      questionId,
      totalAttempts: total,
      correctCount: correct,
      difficultyIndex: total ? correct / total : 0,
      avgScore: Math.round(avgScore * 100) / 100,
    };
  }
}
