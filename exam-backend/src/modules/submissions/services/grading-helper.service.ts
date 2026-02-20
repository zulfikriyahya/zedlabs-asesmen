import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { AutoGradingService } from './auto-grading.service';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { QuestionType } from '../../../common/enums/question-type.enum';
import type { GradingCompletedEvent } from '../processors/submission.events.listener';

@Injectable()
export class GradingHelperService {
  private readonly logger = new Logger(GradingHelperService.name);

  constructor(
    private prisma: PrismaService,
    private autoGrading: AutoGradingService,
    private eventEmitter: EventEmitter2,
  ) {}

  async runAutoGrade(attemptId: string): Promise<void> {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        session: {
          include: {
            examPackage: {
              include: { questions: { include: { question: true } } },
            },
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException(`Attempt ${attemptId} tidak ditemukan`);

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

      let result;
      try {
        result = this.autoGrading.gradeAnswer(
          epq.question.type as QuestionType,
          epq.question.correctAnswer as unknown as string,
          ans.answer,
          pts,
        );
      } catch (err) {
        this.logger.error(`Grade error questionId=${epq.questionId}: ${(err as Error).message}`);
        needsManual = true;
        await this.prisma.examAnswer.update({ where: { id: ans.id }, data: { maxScore: pts } });
        continue;
      }

      if (!result.requiresManual) {
        totalScore += result.score;
        await this.prisma.examAnswer.update({
          where: { id: ans.id },
          data: {
            score: result.score,
            maxScore: pts,
            isAutoGraded: true,
            gradedAt: new Date(),
          },
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

    this.logger.log(
      `Attempt ${attemptId} graded: ${totalScore}/${maxScore}, status=${gradingStatus}`,
    );

    // Emit domain event
    const event: GradingCompletedEvent = {
      attemptId,
      userId: attempt.userId,
      tenantId: attempt.session.tenantId,
      totalScore,
      maxScore,
      gradingStatus,
    };
    this.eventEmitter.emit('grading.completed', event);
  }
}
