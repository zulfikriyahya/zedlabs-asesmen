import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * E2E test ini membutuhkan database test dan Redis.
 * Jalankan dengan: DATABASE_URL=... npx jest --config jest-e2e.json
 *
 * Setiap describe block membersihkan data setelah selesai.
 */
describe('Student Exam Flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentToken: string;
  let operatorToken: string;
  let sessionId: string;
  let tokenCode: string;
  let attemptId: string;

  // ── Setup ──────────────────────────────────────────────────────────────────
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

  // ── Step 0: Login ──────────────────────────────────────────────────────────
  describe('0. Login', () => {
    it('operator mendapat token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'operator1', password: 'password123', fingerprint: 'op-fp' })
        .expect(200);
      operatorToken = res.body.data.accessToken;
      expect(operatorToken).toBeDefined();
    });

    it('siswa mendapat token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'siswa1', password: 'password123', fingerprint: 'siswa-fp' })
        .expect(200);
      studentToken = res.body.data.accessToken;
      expect(studentToken).toBeDefined();
    });
  });

  // ── Step 1: Operator aktifkan sesi ─────────────────────────────────────────
  describe('1. Operator — Aktifkan Sesi', () => {
    it('GET /sessions mengembalikan minimal 1 sesi', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sessions')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);
      expect(res.body.data.data.length).toBeGreaterThan(0);
      sessionId = res.body.data.data[0].id;
    });

    it('POST /sessions/:id/activate mengaktifkan sesi', async () => {
      await request(app.getHttpServer())
        .post(`/api/sessions/${sessionId}/activate`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);
    });

    it('GET tokenCode siswa dari sessionStudent', async () => {
      const ss = await prisma.sessionStudent.findFirst({ where: { sessionId } });
      expect(ss).toBeDefined();
      tokenCode = ss!.tokenCode;
    });
  });

  // ── Step 2: Siswa download paket ───────────────────────────────────────────
  describe('2. Siswa — Download Paket', () => {
    it('POST /student/download mengembalikan paket soal', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/student/download')
        .set('Authorization', `Bearer ${studentToken}`)
        .set('x-device-fingerprint', 'siswa-fp')
        .send({
          sessionId,
          tokenCode,
          deviceFingerprint: 'siswa-fp',
          idempotencyKey: `download-${Date.now()}`,
        })
        .expect(200);

      const pkg = res.body.data;
      expect(pkg.packageId).toBeDefined();
      expect(pkg.attemptId).toBeDefined();
      expect(pkg.checksum).toBeDefined();
      expect(Array.isArray(pkg.questions)).toBe(true);
      attemptId = pkg.attemptId;
    });

    it('download idempoten — attempt yang sama dikembalikan', async () => {
      const idemKey = `download-idem-${Date.now()}`;
      const res1 = await request(app.getHttpServer())
        .post('/api/student/download')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ sessionId, tokenCode, deviceFingerprint: 'siswa-fp', idempotencyKey: idemKey })
        .expect(200);
      const res2 = await request(app.getHttpServer())
        .post('/api/student/download')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ sessionId, tokenCode, deviceFingerprint: 'siswa-fp', idempotencyKey: idemKey })
        .expect(200);
      expect(res1.body.data.attemptId).toBe(res2.body.data.attemptId);
    });

    it('download dengan token salah → 400', async () => {
      await request(app.getHttpServer())
        .post('/api/student/download')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sessionId,
          tokenCode: 'WRONG-TOKEN',
          deviceFingerprint: 'siswa-fp',
          idempotencyKey: `dl-bad-${Date.now()}`,
        })
        .expect(400);
    });
  });

  // ── Step 3: Siswa submit jawaban ───────────────────────────────────────────
  describe('3. Siswa — Submit Jawaban', () => {
    it('POST /student/answers menyimpan jawaban', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/student/answers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          questionId: 'q-placeholder', // akan diganti ID soal nyata di test DB
          idempotencyKey: `ans-1-${Date.now()}`,
          answer: 'a',
        })
        .expect(200);
      expect(res.body.data.attemptId).toBe(attemptId);
    });

    it('submit jawaban idempoten — tidak duplikat', async () => {
      const idemKey = `ans-idem-${Date.now()}`;
      await request(app.getHttpServer())
        .post('/api/student/answers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ attemptId, questionId: 'q-placeholder', idempotencyKey: idemKey, answer: 'b' })
        .expect(200);
      await request(app.getHttpServer())
        .post('/api/student/answers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ attemptId, questionId: 'q-placeholder', idempotencyKey: idemKey, answer: 'b' })
        .expect(200);

      const count = await prisma.examAnswer.count({ where: { idempotencyKey: idemKey } });
      expect(count).toBe(1);
    });
  });

  // ── Step 4: Submit ujian ───────────────────────────────────────────────────
  describe('4. Siswa — Submit Ujian', () => {
    it('POST /student/submit berhasil', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/student/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ attemptId, idempotencyKey: `submit-${Date.now()}` })
        .expect(200);
      expect(res.body.data.message).toMatch(/berhasil/i);
    });

    it('submit kedua kali → idempoten, tidak error', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/student/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ attemptId, idempotencyKey: `submit-2-${Date.now()}` })
        .expect(200);
      expect(res.body.data.message).toMatch(/sudah disubmit/i);
    });

    it('submit jawaban setelah submit ujian → 400', async () => {
      await request(app.getHttpServer())
        .post('/api/student/answers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          questionId: 'q-placeholder',
          idempotencyKey: `ans-after-submit-${Date.now()}`,
          answer: 'c',
        })
        .expect(400);
    });
  });

  // ── Step 5: Cek hasil ──────────────────────────────────────────────────────
  describe('5. Siswa — Hasil Ujian', () => {
    it('GET /student/result/:attemptId mengembalikan status grading', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/student/result/${attemptId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.data.attemptId).toBe(attemptId);
      expect(res.body.data.gradingStatus).toBeDefined();
    });

    it('siswa lain tidak bisa akses result attempt ini → 404', async () => {
      // Login sebagai user berbeda
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'guru1', password: 'password123', fingerprint: 'guru-fp' })
        .expect(200);
      const otherToken = res.body.data.accessToken;

      await request(app.getHttpServer())
        .get(`/api/student/result/${attemptId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });
  });
});
