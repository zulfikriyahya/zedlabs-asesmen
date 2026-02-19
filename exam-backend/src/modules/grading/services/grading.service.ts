// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/services/grading.service.ts  (standalone — fix import)
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { QuestionType } from '../../../common/enums/question-type.enum';
import { AutoGradingService } from '../../submissions/services/auto-grading.service';

@Injectable()
export class GradingService {
  constructor(
    private prisma: PrismaService,
    private autoGrading: AutoGradingService,
  ) {}

  async runAutoGrade(attemptId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        session: {
          include: {
            examPackage: { include: { questions: { include: { question: true } } } },
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');

    let totalScore = 0;
    let maxScore = 0;
    let needsManual = false;

    for (const ans of attempt.answers) {
      const epq = attempt.session.examPackage.questions.find(
        (q) => q.questionId === ans.questionId,
      );
      if (!epq) continue;

      const pts = epq.points ?? epq.question.points;
      maxScore += pts;

      const result = this.autoGrading.gradeAnswer(
        epq.question.type as QuestionType,
        epq.question.correctAnswer as unknown as string,
        ans.answer,
        pts,
      );

      if (!result.requiresManual) {
        totalScore += result.score;
        await this.prisma.examAnswer.update({
          where: { id: ans.id },
          data: { score: result.score, maxScore: pts, isAutoGraded: true, gradedAt: new Date() },
        });
      } else {
        await this.prisma.examAnswer.update({ where: { id: ans.id }, data: { maxScore: pts } });
        needsManual = true;
      }
    }

    const gradingStatus = needsManual ? GradingStatus.MANUAL_REQUIRED : GradingStatus.AUTO_GRADED;
    await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        totalScore,
        maxScore,
        gradingStatus,
        gradingCompletedAt: needsManual ? undefined : new Date(),
      },
    });
  }

  async findPendingManual(tenantId: string, q: BaseQueryDto) {
    const where = { session: { tenantId }, gradingStatus: GradingStatus.MANUAL_REQUIRED };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.examAttempt.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        include: {
          user: { select: { username: true } },
          session: { select: { title: true } },
          answers: { where: { isAutoGraded: false, score: null } },
        },
      }),
      this.prisma.examAttempt.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }
}
