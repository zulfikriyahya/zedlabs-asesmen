import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { MonitoringService } from '../services/monitoring.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@ApiTags('Monitoring')
@ApiBearerAuth()
@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN)
export class MonitoringController {
  constructor(private svc: MonitoringService) {}

  @Get(':sessionId')
  @ApiOperation({
    summary: 'Overview status peserta satu sesi',
    description: 'Total, started, submitted, in-progress per sesi.',
  })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Overview peserta sesi' })
  overview(@Param('sessionId') id: string) {
    return this.svc.getSessionOverview(id);
  }

  @Get(':sessionId/logs/:attemptId')
  @ApiOperation({ summary: 'Activity log satu attempt (tab blur, paste, idle, dll.)' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiParam({ name: 'attemptId', description: 'Attempt ID' })
  @ApiResponse({ status: 200, description: 'Paginated activity logs' })
  logs(@Param('attemptId') id: string, @Query() q: BaseQueryDto) {
    return this.svc.getActivityLogs(id, q);
  }
}
