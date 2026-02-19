// ── services/submissions.service.ts ──────────────────────
import { Injectable as ISS } from '@nestjs/common';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';

@ISS()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    q: BaseQueryDto & { sessionId?: string; gradingStatus?: GradingStatus },
  ) {
    const where = {
      session: { tenantId },
      ...(q.sessionId && { sessionId: q.sessionId }),
      ...(q.gradingStatus && { gradingStatus: q.gradingStatus }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.examAttempt.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { [q.sortBy ?? 'startedAt']: q.sortOrder },
        include: {
          user: { select: { username: true, email: true } },
          session: { select: { title: true } },
        },
      }),
      this.prisma.examAttempt.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }
}
