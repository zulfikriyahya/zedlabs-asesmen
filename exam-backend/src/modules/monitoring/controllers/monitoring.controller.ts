// ════════════════════════════════════════════════════════════════════════════
// src/modules/monitoring/controllers/monitoring.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { MonitoringService } from '../services/monitoring.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN)
export class MonitoringController {
  constructor(private svc: MonitoringService) {}

  @Get(':sessionId')
  overview(@Param('sessionId') id: string) {
    return this.svc.getSessionOverview(id);
  }

  @Get(':sessionId/logs/:attemptId')
  logs(@Param('attemptId') id: string, @Query() q: BaseQueryDto) {
    return this.svc.getActivityLogs(id, q);
  }
}
