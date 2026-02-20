import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';

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

  async findAll(tenantId: string, q: AuditLogQueryDto) {
    const where = {
      tenantId,
      ...(q.action && { action: q.action }),
      ...(q.entityType && { entityType: q.entityType }),
      ...(q.userId && { userId: q.userId }),
      ...(q.search && {
        OR: [
          { action: { contains: q.search, mode: 'insensitive' as const } },
          { entityType: { contains: q.search, mode: 'insensitive' as const } },
          { entityId: { contains: q.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(q.from || q.to
        ? {
            createdAt: {
              ...(q.from && { gte: new Date(q.from) }),
              ...(q.to && { lte: new Date(q.to) }),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }

  /** Ringkasan aksi per hari — untuk grafik di dashboard superadmin */
  async getSummary(tenantId: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where: { tenantId, createdAt: { gte: since } },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
    });

    return logs.map((l) => ({ action: l.action, count: l._count.action }));
  }
}
