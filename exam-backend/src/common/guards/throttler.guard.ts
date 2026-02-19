// ── throttler.guard.ts ───────────────────────────────────
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const tenantId = (req as { tenantId?: string }).tenantId ?? 'global';
    const ip = (req as { ip?: string }).ip ?? '0.0.0.0';
    return `${tenantId}:${ip}`;
  }
}
