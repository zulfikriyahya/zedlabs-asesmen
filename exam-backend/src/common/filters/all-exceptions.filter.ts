import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger, Optional } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SentryService } from '../services/sentry.service';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(@Optional() private readonly sentry?: SentryService) {
    super();
  }

  catch(ex: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<{
      method: string;
      url: string;
      user?: { sub?: string; tenantId?: string; role?: string };
    }>();

    const status = ex instanceof HttpException ? ex.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (ex instanceof Error) {
      this.logger.error(
        `Unhandled [${status}]: ${req.method} ${req.url} — ${ex.message}`,
        ex.stack,
      );

      // Hanya kirim ke Sentry jika 5xx (bukan kesalahan klien)
      if (status >= 500 && this.sentry) {
        this.sentry.captureException(ex, {
          method: req.method,
          url: req.url,
          userId: req.user?.sub,
          tenantId: req.user?.tenantId,
          role: req.user?.role,
        });
      }
    }

    super.catch(ex, host);
  }
}
