// ── logger.middleware.ts ─────────────────────────────────
import { Injectable as LI, NestMiddleware as LM, Logger as LL } from '@nestjs/common';

@LI()
export class LoggerMiddleware implements LM {
  private readonly logger = new LL('HTTP');

  use(req: Request, _res: Response, next: NextFunction) {
    const { method, url } = req as unknown as { method: string; url: string };
    this.logger.debug(`→ ${method} ${url}`);
    next();
  }
}
