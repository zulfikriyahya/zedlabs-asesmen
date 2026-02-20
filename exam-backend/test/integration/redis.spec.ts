import Redis from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

describe('Redis Integration', () => {
  let redis: Redis;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
    }).compile();
    const cfg = mod.get(ConfigService);

    redis = new Redis({
      host: cfg.get('REDIS_HOST', 'localhost'),
      port: cfg.get<number>('REDIS_PORT', 6379),
      password: cfg.get('REDIS_PASSWORD') || undefined,
      lazyConnect: false,
    });
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('dapat terhubung ke Redis (PING)', async () => {
    const pong = await redis.ping();
    expect(pong).toBe('PONG');
  });

  it('SET dan GET bekerja', async () => {
    const key = `test:${Date.now()}`;
    await redis.set(key, 'hello');
    const val = await redis.get(key);
    expect(val).toBe('hello');
    await redis.del(key);
  });

  it('TTL expiry bekerja', async () => {
    const key = `test:ttl:${Date.now()}`;
    await redis.setex(key, 1, 'will-expire');
    const before = await redis.get(key);
    expect(before).toBe('will-expire');

    await new Promise((r) => setTimeout(r, 1100));
    const after = await redis.get(key);
    expect(after).toBeNull();
  });

  it('JSON stringify/parse round-trip via Redis', async () => {
    const key = `test:json:${Date.now()}`;
    const obj = { attemptId: 'att-1', score: 85, tags: ['math', 'science'] };
    await redis.setex(key, 60, JSON.stringify(obj));
    const raw = await redis.get(key);
    expect(JSON.parse(raw!)).toEqual(obj);
    await redis.del(key);
  });

  it('SETNX (idempotency pattern) — hanya set jika belum ada', async () => {
    const key = `test:nx:${Date.now()}`;
    const first = await redis.setnx(key, 'first');
    const second = await redis.setnx(key, 'second');
    const val = await redis.get(key);

    expect(first).toBe(1); // berhasil set
    expect(second).toBe(0); // tidak ditimpa
    expect(val).toBe('first');
    await redis.del(key);
  });
});
