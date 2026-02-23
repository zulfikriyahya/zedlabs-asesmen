import { Inject, Injectable, NestMiddleware, Optional } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Redis } from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';

const CACHE_TTL = 300; // 5 menit

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject('REDIS_CLIENT') private readonly redis?: Redis,
  ) {}

  async use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    const host = req.hostname;
    const parts = host.split('.');

    if (parts.length > 2) {
      const subdomain = parts[0];
      const cacheKey = `tenant:subdomain:${subdomain}`;

      try {
        // Cek cache Redis terlebih dahulu
        if (this.redis) {
          const cached = await this.redis.get(cacheKey);
          if (cached !== null) {
            req.tenantId = cached === '' ? undefined : cached;
            return next();
          }
        }

        const tenant = await this.prisma.tenant.findFirst({
          where: { subdomain, isActive: true },
          select: { id: true },
        });

        const tenantId = tenant?.id ?? undefined;
        req.tenantId = tenantId;

        // Simpan ke cache (string kosong = tidak ditemukan)
        if (this.redis) {
          await this.redis.setex(cacheKey, CACHE_TTL, tenantId ?? '');
        }
      } catch {
        req.tenantId = undefined;
      }
    } else {
      req.tenantId = undefined;
    }

    next();
  }
}
