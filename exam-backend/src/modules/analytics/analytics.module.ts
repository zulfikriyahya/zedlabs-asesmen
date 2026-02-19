// ── analytics.module.ts ──────────────────────────────────
import { IsOptional, IsDateString } from 'class-validator';

export class AnalyticsFilterDto extends BaseQueryDto {
  @IsOptional() @IsString() sessionId?: string;
  @IsOptional() @IsString() subjectId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSessionAnalytics(tenantId: string, sessionId: string) {
    const attempts = await this.prisma.examAttempt.findMany({
      where: { session: { tenantId }, sessionId },
      include: { answers: { select: { score: true, maxScore: true } } },
    });

    const scores = attempts.map((a) => ({
      userId: a.userId,
      totalScore: a.totalScore ?? 0,
      maxScore: a.maxScore ?? 0,
      percentage: a.maxScore ? ((a.totalScore ?? 0) / a.maxScore) * 100 : 0,
    }));

    const avg = scores.length ? scores.reduce((s, a) => s + a.percentage, 0) / scores.length : 0;
    const highest = Math.max(...scores.map((s) => s.percentage), 0);
    const lowest = Math.min(...scores.map((s) => s.percentage), 0);

    return {
      sessionId,
      totalStudents: scores.length,
      avg: Math.round(avg * 10) / 10,
      highest,
      lowest,
      scores,
    };
  }
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const [totalUsers, totalSessions, activeAttempts, pendingGrading] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { tenantId, isActive: true } }),
        this.prisma.examSession.count({ where: { tenantId } }),
        this.prisma.examAttempt.count({ where: { session: { tenantId }, status: 'IN_PROGRESS' } }),
        this.prisma.examAttempt.count({
          where: { session: { tenantId }, gradingStatus: 'MANUAL_REQUIRED' },
        }),
      ]);
    return { totalUsers, totalSessions, activeAttempts, pendingGrading };
  }
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPERADMIN)
export class AnalyticsController {
  constructor(
    private svc: AnalyticsService,
    private dashSvc: DashboardService,
  ) {}
  @Get('dashboard') dashboard(@TenantId() tid: string) {
    return this.dashSvc.getSummary(tid);
  }
  @Get('session/:id') session(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.getSessionAnalytics(tid, id);
  }
}

import { TenantId } from '../../common/decorators/current-user.decorator';
@Module({
  providers: [AnalyticsService, DashboardService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
