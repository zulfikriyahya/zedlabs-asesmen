// ── test/e2e/auth.e2e-spec.ts ────────────────────────────────────────────────
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Auth E2E', () => {
  let app: INestApplication | undefined;

  // beforeAll: setup app & db

  it('POST /api/auth/login → 200 dengan token valid', async () => {
    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123', fingerprint: 'test-fp' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();
      });
  });

  it('POST /api/auth/login → 401 dengan password salah', async () => {
    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong', fingerprint: 'fp' })
      .expect(401);
  });
});
