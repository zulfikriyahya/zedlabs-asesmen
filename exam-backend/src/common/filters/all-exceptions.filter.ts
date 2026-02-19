// ── all-exceptions.filter.ts ─────────────────────────────────────────────────
import { ArgumentsHost as AH, Catch as CatchAll, Logger as Log } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@CatchAll()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Log(AllExceptionsFilter.name);

  catch(ex: unknown, host: AH) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();

    if (ex instanceof Error) {
      this.logger.error(
        `Unhandled: ${req.method} ${(req as unknown as { url: string }).url} — ${ex.message}`,
        ex.stack,
      );
    }

    // delegate HttpException ke filter di atas, sisanya 500
    super.catch(ex, host);
  }
}
