import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { AuditLogsService } from '../services/audit-logs.service';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
export class AuditLogsController {
  constructor(private svc: AuditLogsService) {}

  @Get()
  findAll(@TenantId() tid: string, @Query() q: AuditLogQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get('summary')
  summary(@TenantId() tid: string, @Query('days') days?: string) {
    return this.svc.getSummary(tid, days ? parseInt(days, 10) : 7);
  }
}
