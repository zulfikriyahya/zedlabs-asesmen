import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_ACTION_KEY, AuditActionMeta } from '../decorators/audit.decorator';
import { AuditLogsService } from '../services/audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditSvc: AuditLogsService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditActionMeta>(AUDIT_ACTION_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!meta) return next.handle();

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub?: string; tenantId?: string } | undefined;

    return next.handle().pipe(
      tap((responseData) => {
        // Ekstrak entityId dari: response.id, response.data.id, atau param :id
        const entityId =
          (responseData as { id?: string })?.id ??
          (responseData as { data?: { id?: string } })?.data?.id ??
          (req.params as { id?: string })?.id ??
          'unknown';

        this.auditSvc
          .log({
            tenantId: req.tenantId ?? user?.tenantId ?? 'unknown',
            userId: user?.sub,
            action: meta.action,
            entityType: meta.entityType,
            entityId,
            after: responseData as object,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          })
          .catch(() => {
            // audit log tidak boleh gagalkan request utama
          });
      }),
    );
  }
}
