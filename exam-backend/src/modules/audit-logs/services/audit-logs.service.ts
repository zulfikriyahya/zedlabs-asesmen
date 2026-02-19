// ════════════════════════════════════════════════════════════════════════════
// src/modules/audit-logs/services/audit-logs.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    tenantId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        before: params.before as object,
        after: params.after as object,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  findAll(tenantId: string, q: BaseQueryDto & { action?: string }) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        ...(q.action && { action: q.action }),
      },
      orderBy: { createdAt: 'desc' },
      skip: q.skip,
      take: q.limit,
    });
  }
}
