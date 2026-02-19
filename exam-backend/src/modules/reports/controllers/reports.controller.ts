// ════════════════════════════════════════════════════════════════════════════
// src/modules/reports/controllers/reports.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { ReportsService } from '../services/reports.service';
import { ExportFilterDto } from '../dto/export-filter.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPERATOR, UserRole.ADMIN)
export class ReportsController {
  constructor(private svc: ReportsService) {}

  @Post('export')
  export(@TenantId() tid: string, @Body() dto: ExportFilterDto) {
    return this.svc.requestExport(tid, dto);
  }
}
