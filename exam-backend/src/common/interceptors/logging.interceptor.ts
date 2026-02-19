// ── logging.interceptor.ts ───────────────────────────────
import { Logger as NLog } from '@nestjs/common';
import { tap } from 'rxjs/operators';

@Inj()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new NLog('HTTP');

  intercept(ctx: EC, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`${method} ${url} — ${ms}ms`);
      }),
    );
  }
}
