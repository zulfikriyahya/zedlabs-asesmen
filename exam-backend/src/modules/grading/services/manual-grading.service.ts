// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/services/manual-grading.service.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { GradeAnswerDto } from '../dto/grade-answer.dto';
import { CompleteGradingDto } from '../dto/complete-grading.dto';
import { PublishResultDto } from '../dto/publish-result.dto';

@Injectable()
export class ManualGradingService {
  constructor(private prisma: PrismaService) {}

  async gradeAnswer(dto: GradeAnswerDto, gradedById: string) {
    const answer = await this.prisma.examAnswer.findFirst({
      where: { attemptId: dto.attemptId, questionId: dto.questionId },
    });
    if (!answer) throw new NotFoundException('Jawaban tidak ditemukan');
    if (answer.score !== null && answer.isAutoGraded) {
      throw new BadRequestException('Jawaban ini sudah dinilai otomatis');
    }
    return this.prisma.examAnswer.update({
      where: { id: answer.id },
      data: { score: dto.score, feedback: dto.feedback, gradedById, gradedAt: new Date() },
    });
  }

  async completeGrading(dto: CompleteGradingDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      include: { answers: { select: { score: true, maxScore: true } } },
    });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');

    const ungradedCount = attempt.answers.filter((a) => a.score === null).length;
    if (ungradedCount > 0) {
      throw new BadRequestException(`Masih ada ${ungradedCount} jawaban belum dinilai`);
    }

    const totalScore = attempt.answers.reduce((s, a) => s + (a.score ?? 0), 0);
    const maxScore = attempt.answers.reduce((s, a) => s + (a.maxScore ?? 0), 0);

    return this.prisma.examAttempt.update({
      where: { id: dto.attemptId },
      data: {
        totalScore,
        maxScore,
        gradingStatus: GradingStatus.COMPLETED,
        gradingCompletedAt: new Date(),
      },
    });
  }

  async publishResults(dto: PublishResultDto) {
    const updated = await this.prisma.examAttempt.updateMany({
      where: {
        id: { in: dto.attemptIds },
        gradingStatus: { in: [GradingStatus.COMPLETED, GradingStatus.AUTO_GRADED] },
      },
      data: { gradingStatus: GradingStatus.PUBLISHED },
    });
    return { published: updated.count };
  }
}
