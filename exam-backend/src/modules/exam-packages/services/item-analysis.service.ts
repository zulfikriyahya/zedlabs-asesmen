// ══════════════════════════════════════════════════════════════
// src/modules/exam-packages/services/item-analysis.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ItemAnalysisService {
  constructor(private prisma: PrismaService) {}

  async analyze(tenantId: string, packageId: string) {
    const pkg = await this.prisma.examPackage.findFirst({
      where: { id: packageId, tenantId },
      include: { questions: { include: { question: true } } },
    });
    if (!pkg) throw new NotFoundException('Paket tidak ditemukan');

    const results = await Promise.all(
      pkg.questions.map(async (pq) => {
        const answers = await this.prisma.examAnswer.findMany({
          where: { questionId: pq.questionId },
          select: { score: true, maxScore: true },
        });
        const n = answers.length;
        const correct = answers.filter(
          (a) => a.score != null && a.maxScore != null && a.score >= a.maxScore,
        ).length;
        return {
          questionId: pq.questionId,
          order: pq.order,
          totalAnswers: n,
          correctCount: correct,
          difficultyIndex: n ? correct / n : 0,
        };
      }),
    );

    return results;
  }
}
