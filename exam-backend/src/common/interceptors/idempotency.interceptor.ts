// src/common/interceptors/idempotency.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 jam (detik)

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  // Redis di-inject optional — fallback ke Map jika tidak tersedia (test)
  constructor(@Optional() @Inject('REDIS_CLIENT') private readonly redis?: Redis) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'] as string | undefined;
    if (!key) return next.handle();

    const cacheKey = `idempotency:${key}`;

    if (this.redis) {
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
}
const localCache = new Map<string, unknown>();
