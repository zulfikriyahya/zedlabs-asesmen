// ── performance.middleware.ts ────────────────────────────
@LI()
export class PerformanceMiddleware implements LM {
  use(_req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();
    (res as unknown as { on: (e: string, cb: () => void) => void }).on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      if (ms > 1000) console.warn(`⚠️  Slow request: ${ms.toFixed(1)}ms`);
    });
    next();
  }
}
