import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Tracker key: tenantId:userId  → setiap user dihitung sendiri
   * Fallback ke tenantId:ip jika belum authenticated
   */
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const tenantId = (req as { tenantId?: string }).tenantId ?? 'global';
    const user = (req as { user?: { sub?: string } }).user;
    const userId = user?.sub ?? (req as { ip?: string }).ip ?? '0.0.0.0';
    return `${tenantId}:${userId}`;
  }

  /**
   * Skip throttle untuk role ADMIN dan SUPERADMIN —
   * mereka tidak boleh terkena block saat mengelola sistem
   */
  protected async shouldSkip(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const role = (req.user as { role?: string } | undefined)?.role;
    return role === UserRole.ADMIN || role === UserRole.SUPERADMIN;
  }

  protected async throwThrottlingException(
    ctx: ExecutionContext,
    throttlerLimitDetail: Parameters<ThrottlerGuard['throwThrottlingException']>[1],
  ): Promise<void> {
    const req = ctx.switchToHttp().getRequest<{ url: string }>();
    throw new ThrottlerException(
      `Terlalu banyak request ke ${req.url}. Coba lagi setelah beberapa saat.`,
    );
  }
}
