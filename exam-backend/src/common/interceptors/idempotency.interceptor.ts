import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

// Cache in-memory sederhana untuk dev.
// Di production: ganti dengan Redis (ioredis).
const cache = new Map<string, unknown>();

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'] as string | undefined;
    if (!key) return next.handle();

    if (cache.has(key)) {
      return of(cache.get(key));
    }

    return next.handle().pipe(
      tap((response) => {
        cache.set(key, response);
        // TTL 24 jam
        setTimeout(() => cache.delete(key), 24 * 60 * 60 * 1000);
      }),
    );
  }
}
