// ════════════════════════════════════════════════════════════════════════════
// src/modules/reports/controllers/reports.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ExportFilterDto } from '../dto/export-filter.dto';
import { ReportsService } from '../services/reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPERATOR, UserRole.ADMIN)
export class ReportsController {
  constructor(private svc: ReportsService) {}

  @Post('export')
  export(@TenantId() tid: string, @Body() dto: ExportFilterDto) {
    return this.svc.requestExport(tid, dto);
  }
  @Get('job/:jobId')
  jobStatus(@Param('jobId') jobId: string) {
    return this.svc.getJobStatus(jobId);
  }
}
