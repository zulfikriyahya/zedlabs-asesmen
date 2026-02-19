// ── timeout.interceptor.ts ───────────────────────────────
import { timeout } from 'rxjs/operators';
import { TimeoutError } from 'rxjs';
import { RequestTimeoutException } from '@nestjs/common';

@Inj()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_ctx: EC, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(30_000),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tap({
        error: (e: any) => {
          if (e instanceof TimeoutError) throw new RequestTimeoutException();
        },
      }),
    );
  }
}
