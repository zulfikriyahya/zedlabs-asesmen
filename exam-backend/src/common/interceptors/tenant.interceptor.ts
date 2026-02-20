import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantInterceptor.name);

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<{
      tenantId?: string;
      user?: { tenantId?: string };
      method: string;
      url: string;
    }>();

    // Jika tenantId sudah di-set oleh SubdomainMiddleware, sinkronisasikan
    // ke user payload agar konsisten di seluruh layer (service, guard, decorator)
    if (req.tenantId && req.user && !req.user.tenantId) {
      req.user.tenantId = req.tenantId;
    }

    // Jika tenantId belum ada dari subdomain tapi user JWT punya tenantId,
    // fallback ke JWT (misal akses via IP langsung oleh SUPERADMIN)
    if (!req.tenantId && req.user?.tenantId) {
      req.tenantId = req.user.tenantId;
    }

    return next.handle().pipe(
      tap(() => {
        if (process.env.NODE_ENV === 'development') {
          this.logger.debug(`[${req.method}] ${req.url} — tenant: ${req.tenantId ?? 'none'}`);
        }
      }),
    );
  }
}
