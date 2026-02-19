// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/services/grading.service.ts  (updated)
// Tidak lagi depend pada AutoGradingService langsung —
// inject GradingHelperService dari SubmissionsModule via exports
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { GradingHelperService } from '../../submissions/services/grading-helper.service';

@Injectable()
export class GradingService {
  constructor(
    private prisma: PrismaService,
    private gradingHelper: GradingHelperService,
  ) {}

  /** Dipanggil dari GradingController jika perlu trigger ulang auto-grade */
  async runAutoGrade(attemptId: string) {
    return this.gradingHelper.runAutoGrade(attemptId);
  }

  async findPendingManual(tenantId: string, q: BaseQueryDto) {
    const where = {
      session: { tenantId },
      gradingStatus: GradingStatus.MANUAL_REQUIRED,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.examAttempt.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        include: {
          user: { select: { username: true } },
          session: { select: { title: true } },
          answers: { where: { isAutoGraded: false, score: null } },
        },
      }),
      this.prisma.examAttempt.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }
}
