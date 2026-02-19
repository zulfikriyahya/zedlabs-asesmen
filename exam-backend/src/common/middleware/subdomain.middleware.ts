// ── subdomain.middleware.ts ──────────────────────────────
import { Injectable as MI, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@MI()
export class SubdomainMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    const host = req.hostname; // e.g. smkn1.exam.app
    const parts = host.split('.');
    // subdomain adalah bagian pertama jika lebih dari 2 segmen
    req.tenantId = parts.length > 2 ? parts[0] : undefined;
    next();
  }
}
