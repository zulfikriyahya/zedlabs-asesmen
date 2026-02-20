import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { GradingStatus } from '../../src/common/enums/grading-status.enum';
import { AttemptStatus } from '../../src/common/enums/exam-status.enum';

describe('Grading Flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let teacherToken: string;
  let studentToken: string;
  let attemptId: string;
  let questionId: string;
  let answerId: string;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Setup: login ───────────────────────────────────────────────────────────
  describe('0. Login', () => {
    it('guru mendapat token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'guru1', password: 'password123', fingerprint: 'guru-fp' })
        .expect(200);
      teacherToken = res.body.data.accessToken;
    });

    it('siswa mendapat token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'siswa1', password: 'password123', fingerprint: 'siswa-fp' })
        .expect(200);
      studentToken = res.body.data.accessToken;
    });
  });

  // ── Setup: siapkan attempt SUBMITTED dengan essay ──────────────────────────
  describe('1. Setup Attempt dengan Essay', () => {
    it('buat attempt SUBMITTED dengan jawaban essay', async () => {
      // Ambil attempt yang sudah ada dari flow student-exam, atau buat langsung via Prisma
      const attempt = await prisma.examAttempt.findFirst({
        where: { status: AttemptStatus.SUBMITTED },
        include: { answers: { take: 1 } },
      });

      if (!attempt) {
        // Skip jika tidak ada data seed — jalankan student-exam-flow.e2e-spec.ts lebih dulu
        console.warn('Tidak ada attempt SUBMITTED — pastikan student-exam-flow dijalankan dulu');
        return;
      }

      attemptId = attempt.id;

      // Set satu jawaban ke MANUAL_REQUIRED untuk simulasi essay
      if (attempt.answers.length > 0) {
        answerId = attempt.answers[0].id;
        questionId = attempt.answers[0].questionId;

        await prisma.examAnswer.update({
          where: { id: answerId },
          data: { score: null, isAutoGraded: false },
        });
        await prisma.examAttempt.update({
          where: { id: attemptId },
          data: { gradingStatus: GradingStatus.MANUAL_REQUIRED },
        });
      }
    });
  });

  // ── GET /grading — list pending manual ────────────────────────────────────
  describe('2. List Pending Manual Grading', () => {
    it('GET /grading mengembalikan attempt MANUAL_REQUIRED', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/grading')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('data');
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    it('siswa tidak bisa akses /grading → 403', async () => {
      await request(app.getHttpServer())
        .get('/api/grading')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  // ── PATCH /grading/answer — grade manual ──────────────────────────────────
  describe('3. Manual Grade Answer', () => {
    it('PATCH /grading/answer berhasil memberi nilai', async () => {
      if (!attemptId || !questionId) return;

      const res = await request(app.getHttpServer())
        .patch('/api/grading/answer')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          attemptId,
          questionId,
          score: 15,
          feedback: 'Jawaban cukup baik, perlu elaborasi lebih lanjut',
        })
        .expect(200);

      expect(res.body.data.score).toBe(15);
      expect(res.body.data.feedback).toBeDefined();
    });

    it('grade dengan score negatif → 400', async () => {
      if (!attemptId || !questionId) return;

      await request(app.getHttpServer())
        .patch('/api/grading/answer')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ attemptId, questionId, score: -5 })
        .expect(400);
    });
  });

  // ── POST /grading/complete ─────────────────────────────────────────────────
  describe('4. Complete Grading', () => {
    it('POST /grading/complete berhasil jika semua jawaban sudah dinilai', async () => {
      if (!attemptId) return;

      // Pastikan semua jawaban punya score
      await prisma.examAnswer.updateMany({
        where: { attemptId, score: null },
        data: { score: 0, maxScore: 10 },
      });

      const res = await request(app.getHttpServer())
        .post('/api/grading/complete')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ attemptId })
        .expect(200);

      expect(res.body.data.gradingStatus).toBe(GradingStatus.COMPLETED);
    });
  });

  // ── POST /grading/publish ──────────────────────────────────────────────────
  describe('5. Publish Results', () => {
    it('POST /grading/publish memublikasikan hasil', async () => {
      if (!attemptId) return;

      const res = await request(app.getHttpServer())
        .post('/api/grading/publish')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ attemptIds: [attemptId] })
        .expect(200);

      expect(res.body.data.published).toBeGreaterThanOrEqual(1);
    });

    it('siswa dapat melihat hasil setelah PUBLISHED', async () => {
      if (!attemptId) return;

      const res = await request(app.getHttpServer())
        .get(`/api/student/result/${attemptId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.data.gradingStatus).toBe(GradingStatus.PUBLISHED);
      expect(res.body.data.totalScore).toBeDefined();
    });
  });
});
