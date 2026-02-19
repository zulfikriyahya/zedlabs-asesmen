// ── tenant.guard.ts ──────────────────────────────────────
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/current-user.decorator';
import { TenantNotFoundException } from '../exceptions/tenant-not-found.exception';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    if (!req.tenantId) {
      this.logger.warn('Request tanpa tenantId ditolak');
      throw new TenantNotFoundException('unknown');
    }
    return true;
  }
}
