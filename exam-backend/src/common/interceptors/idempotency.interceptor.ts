// ── idempotency.interceptor.ts ───────────────────────────
import { InjectRedis } from '@nestjs-modules/ioredis'; // atau inject manual
import { ConflictException } from '@nestjs/common';
// NOTE: implementasi lengkap memerlukan Redis injection; ini skeleton pattern-nya.
@Inj()
export class IdempotencyInterceptor implements NestInterceptor {
  // Inject Redis via constructor di implementasi nyata
  intercept(ctx: EC, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'] as string | undefined;
    if (!key) return next.handle();
    // Cek Redis cache untuk key ini; jika ada return cached response
    // Jika tidak ada, jalankan handler dan cache hasilnya
    return next.handle();
  }
}
