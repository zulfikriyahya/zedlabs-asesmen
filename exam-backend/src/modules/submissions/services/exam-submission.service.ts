import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { AttemptStatus } from '../../../common/enums/exam-status.enum';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { SubmitExamDto } from '../dto/submit-exam.dto';
import { AutoGradeJobData } from '../processors/submission.processor';
import type {
  ExamSubmittedEvent,
  GradingCompletedEvent,
} from '../processors/submission.events.listener';

@Injectable()
export class ExamSubmissionService {
  private readonly logger = new Logger(ExamSubmissionService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    private eventEmitter: EventEmitter2,
    @InjectQueue('submission') private submissionQueue: Queue,
  ) {}

  async submitAnswer(dto: SubmitAnswerDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      select: { status: true },
    });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');
    if (attempt.status === AttemptStatus.SUBMITTED) {
      throw new BadRequestException('Ujian sudah disubmit, jawaban tidak bisa diubah');
    }
    if (attempt.status === AttemptStatus.TIMED_OUT) {
      throw new BadRequestException('Ujian sudah timeout');
    }

    return this.prisma.examAnswer.upsert({
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
  }

  async submitExam(dto: SubmitExamDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      include: {
        session: {
          select: {
            tenantId: true,
            title: true,
            id: true,
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');

    if (attempt.status === AttemptStatus.SUBMITTED || attempt.status === AttemptStatus.TIMED_OUT) {
      return { message: 'Ujian sudah disubmit sebelumnya', attemptId: dto.attemptId };
    }

    const tenantId = attempt.session.tenantId;

    await this.prisma.examAttempt.update({
      where: { id: dto.attemptId },
      data: { status: AttemptStatus.SUBMITTED, submittedAt: new Date() },
    });

    await this.auditLogs.log({
      tenantId,
      userId: attempt.userId,
      action: 'SUBMIT_EXAM',
      entityType: 'ExamAttempt',
      entityId: dto.attemptId,
      after: { submittedAt: new Date().toISOString() },
    });

    // Emit domain event — ditangkap oleh SubmissionEventsListener
    const event: ExamSubmittedEvent = {
      attemptId: dto.attemptId,
      userId: attempt.userId,
      tenantId,
      sessionId: attempt.session.id,
      sessionTitle: attempt.session.title,
    };
    this.eventEmitter.emit('exam.submitted', event);

    const jobData: AutoGradeJobData = { attemptId: dto.attemptId, tenantId };
    await this.submissionQueue.add('auto-grade', jobData, {
      jobId: `grade-${dto.attemptId}`,
      removeOnComplete: 50,
      removeOnFail: false,
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return { message: 'Ujian berhasil disubmit', attemptId: dto.attemptId };
  }

  async scheduleTimeout(
    attemptId: string,
    tenantId: string,
    sessionId: string,
    durationMinutes: number,
  ) {
    const delayMs = durationMinutes * 60 * 1000;
    await this.submissionQueue.add(
      'timeout-attempt',
      { attemptId, tenantId, sessionId },
      {
        jobId: `timeout-${attemptId}`,
        delay: delayMs,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
      },
    );
    this.logger.log(`Timeout dijadwalkan untuk attempt ${attemptId} dalam ${durationMinutes}m`);
  }

  /** Dipanggil oleh GradingHelperService setelah auto-grade selesai */
  emitGradingCompleted(event: GradingCompletedEvent) {
    this.eventEmitter.emit('grading.completed', event);
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        session: {
          select: {
            title: true,
            examPackage: { select: { title: true, settings: true } },
          },
        },
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
      return {
        attemptId,
        status: attempt.status,
        gradingStatus: attempt.gradingStatus,
        message: this.gradingStatusMessage(attempt.gradingStatus as GradingStatus),
      };
    }

    const pct =
      attempt.maxScore && attempt.maxScore > 0
        ? Math.round(((attempt.totalScore ?? 0) / attempt.maxScore) * 1000) / 10
        : 0;

    const settings = attempt.session.examPackage.settings as { passingScore?: number };
    const isPassed = settings.passingScore != null ? pct >= settings.passingScore : null;

    return {
      attemptId,
      sessionTitle: attempt.session.title,
      packageTitle: attempt.session.examPackage.title,
      status: attempt.status,
      gradingStatus: attempt.gradingStatus,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage: pct,
      isPassed,
      submittedAt: attempt.submittedAt,
      gradingCompletedAt: attempt.gradingCompletedAt,
      answers: attempt.answers,
    };
  }

  private gradingStatusMessage(status: GradingStatus): string {
    const map: Record<GradingStatus, string> = {
      [GradingStatus.PENDING]: 'Jawaban sedang diproses',
      [GradingStatus.AUTO_GRADED]: 'Penilaian otomatis selesai, menunggu review guru',
      [GradingStatus.MANUAL_REQUIRED]: 'Menunggu penilaian manual dari guru',
      [GradingStatus.COMPLETED]: 'Penilaian selesai, menunggu dipublish',
      [GradingStatus.PUBLISHED]: 'Nilai telah dipublish',
    };
    return map[status] ?? 'Status tidak diketahui';
  }
}
