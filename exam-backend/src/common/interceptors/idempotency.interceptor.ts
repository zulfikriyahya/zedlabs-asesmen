import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Optional,
  BadRequestException,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 jam (detik) — simpan hasil
const KEY_RATE_WINDOW = 60; // 60 detik
const KEY_RATE_LIMIT = 10; // maks 10 idempotencyKey unik per window per user

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Optional() @Inject('REDIS_CLIENT') private readonly redis?: Redis) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'] as string | undefined;
    if (!key) return next.handle();

    const userId = (req.user as { sub?: string } | undefined)?.sub ?? req.ip ?? 'anon';
    const cacheKey = `idempotency:${key}`;

    if (this.redis) {
      // [Fix #6] Rate limit: satu user tidak boleh flood dengan key baru terus-menerus
      await this.checkKeyRateLimit(userId);

      const cached = await this.redis.get(cacheKey);
      if (cached) return of(JSON.parse(cached));

      return next.handle().pipe(
        tap(async (res) => {
          await this.redis!.setex(cacheKey, IDEMPOTENCY_TTL, JSON.stringify(res));
        }),
      );
    }

    // Fallback in-memory (dev/test)
    if (localCache.has(key)) return of(localCache.get(key));
    return next.handle().pipe(
      tap((res) => {
        localCache.set(key, res);
        setTimeout(() => localCache.delete(key), IDEMPOTENCY_TTL * 1000);
      }),
    );
  }

  /**
   * [Fix #6] Cek berapa banyak idempotencyKey unik yang dibuat user dalam window terakhir.
   * Menggunakan Redis sorted set (ZSET) dengan score = timestamp.
   */
  private async checkKeyRateLimit(userId: string): Promise<void> {
    if (!this.redis) return;

    const rateKey = `idempotency:rate:${userId}`;
    const now = Date.now();
    const windowStart = now - KEY_RATE_WINDOW * 1000;

    const pipe = this.redis.pipeline();
    // Hapus entry lama di luar window
    pipe.zremrangebyscore(rateKey, '-inf', windowStart);
    // Tambah entry baru
    pipe.zadd(rateKey, now, `${now}`);
    // Hitung berapa entry dalam window
    pipe.zcard(rateKey);
    // Set TTL agar key tidak menumpuk
    pipe.expire(rateKey, KEY_RATE_WINDOW * 2);

    const results = await pipe.exec();
    const count = (results?.[2]?.[1] as number) ?? 0;

    if (count > KEY_RATE_LIMIT) {
      throw new BadRequestException(
        `Terlalu banyak idempotency key unik dalam ${KEY_RATE_WINDOW} detik. Coba lagi nanti.`,
      );
    }
  }
}

const localCache = new Map<string, unknown>();
