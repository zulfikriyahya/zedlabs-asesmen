import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Scope } from '@nestjs/common';
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

    // Log slow queries di development
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
   * Buat Prisma client yang ter-scope ke tenant tertentu.
   * Set PostgreSQL session variable app.tenant_id untuk RLS.
   */
  forTenant(tenantId: string, role = 'APP') {
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // Set RLS context sebelum setiap query
            await (this as any).$executeRawUnsafe(
              `SET LOCAL app.tenant_id = '${tenantId.replace(/'/g, '')}';
               SET LOCAL app.role = '${role.replace(/'/g, '')}';`,
            );
            return query(args);
          },
        },
      },
    });
  }

  /**
   * Eksekusi dalam transaksi dengan RLS context.
   */
  async withTenantContext<T>(
    tenantId: string,
    role: string,
    fn: (tx: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.tenant_id = '${tenantId.replace(/'/g, '')}';
         SET LOCAL app.role = '${role.replace(/'/g, '')}';`,
      );
      return fn(tx as unknown as PrismaClient);
    });
  }
}
