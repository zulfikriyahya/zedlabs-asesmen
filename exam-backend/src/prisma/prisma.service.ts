// ── prisma.service.ts ────────────────────────────────────────────────────────
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected');

    // RLS safety net — set tenantId context per transaction jika menggunakan RLS
    // this.$use(async (params, next) => { ... });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Helper: pastikan setiap query menyertakan tenantId */
  tenantWhere(tenantId: string, extra: Record<string, unknown> = {}) {
    return { tenantId, ...extra };
  }
}
