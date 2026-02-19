// ── services/exam-submission.service.ts ──────────────────
import { Injectable as IS } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AttemptStatus, GradingStatus } from '../../../common/enums/exam-status.enum';

@IS()
export class ExamSubmissionService {
  constructor(
    private prisma: PrismaService,
    private autoGrading: AutoGradingService,
    @InjectQueue('submission') private submissionQueue: Queue,
  ) {}

  async submitAnswer(dto: SubmitAnswerDto) {
    // idempotent upsert
    const answer = await this.prisma.examAnswer.upsert({
      where: { idempotencyKey: dto.idempotencyKey },
      create: {
        attemptId: dto.attemptId,
        questionId: dto.questionId,
        idempotencyKey: dto.idempotencyKey,
        answer: dto.answer as object,
        mediaUrls: dto.mediaUrls ?? [],
      },
      update: {
        answer: dto.answer as object,
        mediaUrls: dto.mediaUrls ?? [],
        updatedAt: new Date(),
      },
    });
    return answer;
  }

  async submitExam(dto: SubmitExamDto) {
    const attempt = await this.prisma.examAttempt.findUnique({ where: { id: dto.attemptId } });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');
    if (attempt.status === AttemptStatus.SUBMITTED) {
      return { message: 'Ujian sudah disubmit sebelumnya' };
    }

    // Update status
    await this.prisma.examAttempt.update({
      where: { id: dto.attemptId },
      data: { status: AttemptStatus.SUBMITTED, submittedAt: new Date() },
    });

    // Enqueue auto-grade
    await this.submissionQueue.add(
      'auto-grade',
      { attemptId: dto.attemptId },
      { jobId: `grade-${dto.attemptId}`, removeOnFail: false },
    );

    return { message: 'Ujian berhasil disubmit' };
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        answers: {
          select: {
            questionId: true,
            score: true,
            maxScore: true,
            feedback: true,
            isAutoGraded: true,
            gradedAt: true,
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException('Hasil ujian tidak ditemukan');
    if (attempt.gradingStatus !== GradingStatus.PUBLISHED) {
      return { status: attempt.gradingStatus, message: 'Hasil belum dipublish' };
    }
    return attempt;
  }
}
