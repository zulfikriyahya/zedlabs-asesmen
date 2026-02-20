import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { SyncType, SyncStatus } from '../../src/common/enums/sync-status.enum';

describe('Offline Sync Flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentToken: string;
  let attemptId: string;

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

  // ── Login ──────────────────────────────────────────────────────────────────
  describe('0. Setup', () => {
    it('siswa login', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'siswa1', password: 'password123', fingerprint: 'siswa-fp' })
        .expect(200);
      studentToken = res.body.data.accessToken;

      // Ambil attempt IN_PROGRESS yang ada dari seed/flow sebelumnya
      const attempt = await prisma.examAttempt.findFirst({
        where: { status: 'IN_PROGRESS' },
      });
      if (attempt) attemptId = attempt.id;
    });
  });

  // ── Add Sync Item ──────────────────────────────────────────────────────────
  describe('1. POST /sync — tambah item ke antrian', () => {
    it('menambahkan SUBMIT_ANSWER ke sync queue', async () => {
      if (!attemptId) return;

      const idemKey = `sync-ans-${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post('/api/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          idempotencyKey: idemKey,
          type: SyncType.SUBMIT_ANSWER,
          payload: {
            attemptId,
            questionId: 'q-placeholder',
            idempotencyKey: idemKey,
            answer: 'a',
          },
        })
        .expect(200);

      expect(res.body.data.idempotencyKey).toBe(idemKey);
      expect(res.body.data.status).toBe(SyncStatus.PENDING);
    });

    it('idempotent — duplikat key tidak membuat item baru', async () => {
      if (!attemptId) return;

      const idemKey = `sync-idem-${Date.now()}`;
      const payload = {
        attemptId,
        idempotencyKey: idemKey,
        type: SyncType.SUBMIT_ANSWER,
        payload: { attemptId, questionId: 'q-1', idempotencyKey: idemKey, answer: 'b' },
      };

      await request(app.getHttpServer())
        .post('/api/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(payload)
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(payload)
        .expect(200);

      const count = await prisma.syncQueue.count({ where: { idempotencyKey: idemKey } });
      expect(count).toBe(1);
    });

    it('tanpa auth → 401', async () => {
      await request(app.getHttpServer())
        .post('/api/sync')
        .send({ attemptId: 'x', idempotencyKey: 'x', type: SyncType.SUBMIT_ANSWER, payload: {} })
        .expect(401);
    });
  });

  // ── GET Status ─────────────────────────────────────────────────────────────
  describe('2. GET /sync/:attemptId/status', () => {
    it('mengembalikan status sync untuk attempt', async () => {
      if (!attemptId) return;

      const res = await request(app.getHttpServer())
        .get(`/api/sync/${attemptId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('pending');
      expect(res.body.data).toHaveProperty('failed');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });
  });

  // ── Retry Failed ──────────────────────────────────────────────────────────
  describe('3. POST /sync/retry — retry item gagal', () => {
    it('retry item FAILED berhasil dijadwalkan ulang', async () => {
      if (!attemptId) return;

      // Buat item FAILED langsung via Prisma
      const failedItem = await prisma.syncQueue.create({
        data: {
          attemptId,
          idempotencyKey: `failed-${Date.now()}`,
          type: SyncType.ACTIVITY_LOG,
          payload: { type: 'tab_blur' },
          status: SyncStatus.FAILED,
          retryCount: 1,
        },
      });

      const res = await request(app.getHttpServer())
        .post('/api/sync/retry')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ syncItemId: failedItem.id })
        .expect(200);

      expect(res.body.data.message).toMatch(/dijadwalkan ulang/i);

      // Verifikasi status kembali ke PENDING
      const updated = await prisma.syncQueue.findUnique({ where: { id: failedItem.id } });
      expect(updated?.status).toBe(SyncStatus.PENDING);
    });

    it('retry item COMPLETED → 400', async () => {
      if (!attemptId) return;

      const completedItem = await prisma.syncQueue.create({
        data: {
          attemptId,
          idempotencyKey: `completed-${Date.now()}`,
          type: SyncType.ACTIVITY_LOG,
          payload: {},
          status: SyncStatus.COMPLETED,
        },
      });

      await request(app.getHttpServer())
        .post('/api/sync/retry')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ syncItemId: completedItem.id })
        .expect(400);
    });

    it('retry item tidak ada → 404', async () => {
      await request(app.getHttpServer())
        .post('/api/sync/retry')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ syncItemId: 'nonexistent-id' })
        .expect(404);
    });
  });

  // ── Chunked Upload ─────────────────────────────────────────────────────────
  describe('4. POST /sync/upload/chunk — chunked upload', () => {
    const fileId = `e2e-file-${Date.now()}`;

    it('upload chunk 0/2 berhasil', async () => {
      if (!attemptId) return;

      const meta = JSON.stringify({
        fileId,
        attemptId,
        questionId: 'q-1',
        chunkIndex: 0,
        totalChunks: 2,
        type: 'image',
        originalName: 'test.jpg',
      });

      const res = await request(app.getHttpServer())
        .post('/api/sync/upload/chunk')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('chunk', Buffer.from('chunk-data-0'), 'chunk0')
        .field('meta', meta)
        .expect(200);

      expect(res.body.data.saved).toBe(1);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.isComplete).toBe(false);
    });

    it('upload chunk 1/2 → isComplete true', async () => {
      if (!attemptId) return;

      const meta = JSON.stringify({
        fileId,
        attemptId,
        questionId: 'q-1',
        chunkIndex: 1,
        totalChunks: 2,
        type: 'image',
        originalName: 'test.jpg',
      });

      const res = await request(app.getHttpServer())
        .post('/api/sync/upload/chunk')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('chunk', Buffer.from('chunk-data-1'), 'chunk1')
        .field('meta', meta)
        .expect(200);

      expect(res.body.data.isComplete).toBe(true);
    });

    it('meta JSON tidak valid → 400', async () => {
      if (!attemptId) return;

      await request(app.getHttpServer())
        .post('/api/sync/upload/chunk')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('chunk', Buffer.from('data'), 'chunk')
        .field('meta', 'invalid-json')
        .expect(400);
    });
  });
});
