import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    const host = req.hostname; // e.g. smkn1.exam.app
    const parts = host.split('.');

    if (parts.length > 2) {
      const subdomain = parts[0];
      try {
        const tenant = await this.prisma.tenant.findFirst({
          where: { subdomain, isActive: true },
          select: { id: true },
        });
        req.tenantId = tenant?.id ?? undefined;
      } catch {
        req.tenantId = undefined;
      }
    } else {
      req.tenantId = undefined;
    }

    next();
  }
}
