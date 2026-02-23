import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? [{ emit: 'event', level: 'query' }, 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected');

    if (process.env.NODE_ENV === 'development') {
      (this.$on as any)('query', (e: { query: string; duration: number }) => {
        if (e.duration > 500) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query.slice(0, 200)}`);
        }
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected');
  }

  /**
   * Eksekusi fn dalam transaksi dengan RLS context.
   * SET LOCAL hanya valid di dalam transaksi — ini adalah cara yang benar.
   * `forTenant()` standalone (luar transaksi) dihapus karena tidak aman.
   */
  async withTenantContext<T>(
    tenantId: string,
    role: string,
    fn: (tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]) => Promise<T>,
  ): Promise<T> {
    // Sanitasi untuk mencegah SQL injection via SET LOCAL
    const safeTenantId = tenantId.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeRole = role.replace(/[^a-zA-Z0-9_]/g, '');

    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.tenant_id = '${safeTenantId}'; SET LOCAL app.role = '${safeRole}';`,
      );
      return fn(tx);
    });
  }
}
