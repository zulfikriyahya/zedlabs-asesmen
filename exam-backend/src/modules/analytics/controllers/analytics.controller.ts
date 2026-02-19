// ════════════════════════════════════════════════════════════════════════════
// src/modules/analytics/controllers/analytics.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { AnalyticsService } from '../services/analytics.service';
import { DashboardService } from '../services/dashboard.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPERADMIN)
export class AnalyticsController {
  constructor(
    private svc: AnalyticsService,
    private dashSvc: DashboardService,
  ) {}

  @Get('dashboard')
  dashboard(@TenantId() tid: string) {
    return this.dashSvc.getSummary(tid);
  }

  @Get('session/:id')
  session(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.getSessionAnalytics(tid, id);
  }
}
