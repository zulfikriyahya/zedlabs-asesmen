// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/services/exam-submission.service.ts  (updated)
// — tambah: timeout scheduling, audit log, guard duplikat submit
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { AttemptStatus } from '../../../common/enums/exam-status.enum';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { SubmitExamDto } from '../dto/submit-exam.dto';
import { AutoGradeJobData } from '../processors/submission.processor';

@Injectable()
export class ExamSubmissionService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    @InjectQueue('submission') private submissionQueue: Queue,
  ) {}

  // ── Submit satu jawaban (idempotent) ───────────────────────────────────────
  async submitAnswer(dto: SubmitAnswerDto) {
    // Guard: pastikan attempt masih IN_PROGRESS
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      select: { status: true, session: { select: { tenantId: true, endTime: true } } },
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

  // ── Submit ujian (idempotent) ──────────────────────────────────────────────
  async submitExam(dto: SubmitExamDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      include: { session: { select: { tenantId: true, examPackage: true } } },
    });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');

    // Idempotency: sudah submit sebelumnya
    if (attempt.status === AttemptStatus.SUBMITTED || attempt.status === AttemptStatus.TIMED_OUT) {
      return { message: 'Ujian sudah disubmit sebelumnya', attemptId: dto.attemptId };
    }

    const tenantId = attempt.session.tenantId;

    // Update status
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

    // Enqueue auto-grade — jobId unik agar tidak duplikat jika retry
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

  // ── Schedule timeout untuk attempt yang sedang berjalan ───────────────────
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
    this.logger?.log?.(`Timeout dijadwalkan untuk attempt ${attemptId} dalam ${durationMinutes}m`);
  }

  // ── Ambil hasil attempt (hanya jika PUBLISHED) ─────────────────────────────
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

    // Jika belum published, kembalikan status saja
    if (attempt.gradingStatus !== GradingStatus.PUBLISHED) {
      return {
        attemptId,
        status: attempt.status,
        gradingStatus: attempt.gradingStatus,
        message: this.gradingStatusMessage(attempt.gradingStatus as GradingStatus),
      };
    }

    const percentage =
      attempt.maxScore && attempt.maxScore > 0
        ? Math.round(((attempt.totalScore ?? 0) / attempt.maxScore) * 100 * 10) / 10
        : 0;

    const settings = attempt.session.examPackage.settings as { passingScore?: number };
    const isPassed = settings.passingScore != null ? percentage >= settings.passingScore : null; // tidak ada passing score = tidak ada keterangan lulus/tidak

    return {
      attemptId,
      sessionTitle: attempt.session.title,
      packageTitle: attempt.session.examPackage.title,
      status: attempt.status,
      gradingStatus: attempt.gradingStatus,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage,
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

  // logger optional agar tidak crash jika DI belum setup
  private get logger() {
    return { log: (msg: string) => console.log(`[ExamSubmissionService] ${msg}`) };
  }
}
