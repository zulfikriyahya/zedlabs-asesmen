import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ExportFilterDto } from '../dto/export-filter.dto';
import { ReportsService } from '../services/reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPERATOR, UserRole.ADMIN)
export class ReportsController {
  constructor(private svc: ReportsService) {}

  @Post('export')
  @ApiOperation({
    summary: 'Request export laporan (async via BullMQ)',
    description:
      'Mengembalikan jobId. Cek status via GET /reports/job/:jobId. File tersedia di downloadUrl setelah selesai.',
  })
  @ApiResponse({ status: 200, description: '{ jobId, message }' })
  export(@TenantId() tid: string, @Body() dto: ExportFilterDto) {
    return this.svc.requestExport(tid, dto);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Cek status job export' })
  @ApiParam({ name: 'jobId', description: 'Job ID dari response /reports/export' })
  @ApiResponse({ status: 200, description: '{ jobId, state, progress, downloadUrl }' })
  @ApiResponse({ status: 404, description: 'Job tidak ditemukan' })
  jobStatus(@Param('jobId') jobId: string) {
    return this.svc.getJobStatus(jobId);
  }
}
