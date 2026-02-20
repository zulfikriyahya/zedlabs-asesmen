import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { AuditLogsService } from '../services/audit-logs.service';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
export class AuditLogsController {
  constructor(private svc: AuditLogsService) {}

  @Get()
  @ApiOperation({
    summary: 'List audit log tenant',
    description: 'Append-only. Filter by action, entityType, userId, date range.',
  })
  @ApiResponse({ status: 200, description: 'Paginated audit logs' })
  findAll(@TenantId() tid: string, @Query() q: AuditLogQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan aksi per action (N hari terakhir, default 7)' })
  @ApiQuery({ name: 'days', required: false, description: 'Jumlah hari (default 7)' })
  @ApiResponse({ status: 200, description: 'Array { action, count } urut terbanyak' })
  summary(@TenantId() tid: string, @Query('days') days?: string) {
    return this.svc.getSummary(tid, days ? parseInt(days, 10) : 7);
  }
}
