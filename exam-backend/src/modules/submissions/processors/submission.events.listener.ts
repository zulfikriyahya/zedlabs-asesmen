import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';

export interface ExamSubmittedEvent {
  attemptId: string;
  userId: string;
  tenantId: string;
  sessionId: string;
  sessionTitle: string;
}

export interface GradingCompletedEvent {
  attemptId: string;
  userId: string;
  tenantId: string;
  totalScore: number;
  maxScore: number;
  gradingStatus: string;
}

export interface ResultPublishedEvent {
  attemptIds: string[];
  tenantId: string;
}

@Injectable()
export class SubmissionEventsListener {
  private readonly logger = new Logger(SubmissionEventsListener.name);

  constructor(
    private readonly notifSvc: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('exam.submitted')
  async handleExamSubmitted(event: ExamSubmittedEvent) {
    this.logger.log(`exam.submitted — attemptId=${event.attemptId} userId=${event.userId}`);

    try {
      await this.notifSvc.create({
        userId: event.userId,
        title: 'Ujian Berhasil Dikumpulkan',
        body: `Jawaban Anda untuk sesi "${event.sessionTitle}" telah berhasil dikirim. Tunggu hasil penilaian.`,
        type: 'EXAM_SUBMITTED',
        metadata: {
          attemptId: event.attemptId,
          sessionId: event.sessionId,
          tenantId: event.tenantId,
        },
      });
    } catch (err) {
      this.logger.error(`Gagal kirim notifikasi exam.submitted: ${(err as Error).message}`);
    }
  }

  @OnEvent('grading.completed')
  async handleGradingCompleted(event: GradingCompletedEvent) {
    this.logger.log(`grading.completed — attemptId=${event.attemptId}`);

    // Notifikasi ke guru/admin bahwa auto-grading selesai
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          tenantId: event.tenantId,
          role: { in: ['TEACHER', 'ADMIN'] },
          isActive: true,
        },
        select: { id: true },
      });

      await Promise.allSettled(
        admins.map((a) =>
          this.notifSvc.create({
            userId: a.id,
            title: 'Auto-Grading Selesai',
            body: `Attempt ${event.attemptId} selesai dinilai otomatis. Status: ${event.gradingStatus}.`,
            type: 'GRADING_COMPLETED',
            metadata: {
              attemptId: event.attemptId,
              gradingStatus: event.gradingStatus,
              totalScore: event.totalScore,
              maxScore: event.maxScore,
            },
          }),
        ),
      );
    } catch (err) {
      this.logger.error(`Gagal kirim notifikasi grading.completed: ${(err as Error).message}`);
    }
  }

  @OnEvent('result.published')
  async handleResultPublished(event: ResultPublishedEvent) {
    this.logger.log(`result.published — ${event.attemptIds.length} attempt(s)`);

    try {
      const attempts = await this.prisma.examAttempt.findMany({
        where: { id: { in: event.attemptIds } },
        select: {
          id: true,
          userId: true,
          totalScore: true,
          maxScore: true,
          session: { select: { title: true } },
        },
      });

      await Promise.allSettled(
        attempts.map((a) => {
          const pct =
            a.maxScore && a.maxScore > 0 ? Math.round(((a.totalScore ?? 0) / a.maxScore) * 100) : 0;
          return this.notifSvc.create({
            userId: a.userId,
            title: 'Nilai Ujian Telah Dipublikasi',
            body: `Nilai Anda untuk sesi "${a.session.title}" telah tersedia. Skor: ${a.totalScore ?? 0}/${a.maxScore ?? 0} (${pct}%).`,
            type: 'RESULT_PUBLISHED',
            metadata: {
              attemptId: a.id,
              totalScore: a.totalScore,
              maxScore: a.maxScore,
              percentage: pct,
              tenantId: event.tenantId,
            },
          });
        }),
      );
    } catch (err) {
      this.logger.error(`Gagal kirim notifikasi result.published: ${(err as Error).message}`);
    }
  }
}
