import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { AnalyticsService } from '../services/analytics.service';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPERADMIN)
export class AnalyticsController {
  constructor(
    private svc: AnalyticsService,
    private dashSvc: DashboardService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Summary dashboard tenant',
    description: 'Total user aktif, sesi, attempt in-progress, dan pending grading.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard summary' })
  dashboard(@TenantId() tid: string) {
    return this.dashSvc.getSummary(tid);
  }

  @Get('session/:id')
  @ApiOperation({ summary: 'Analitik sesi: rata-rata, tertinggi, terendah, distribusi skor' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Analitik sesi' })
  session(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.getSessionAnalytics(tid, id);
  }
}
