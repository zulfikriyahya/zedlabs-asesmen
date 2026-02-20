import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { SessionsService } from '../services/sessions.service';
import { SessionMonitoringService } from '../services/session-monitoring.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { AssignStudentsDto } from '../dto/assign-students.dto';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { AuditAction, AuditActions } from '../../audit-logs/decorators/audit.decorator';
import { AuditInterceptor } from '../../audit-logs/interceptors/audit.interceptor';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class SessionsController {
  constructor(
    private svc: SessionsService,
    private monitorSvc: SessionMonitoringService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List semua sesi ujian milik tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list sesi' })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail sesi ujian' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Detail sesi' })
  @ApiResponse({ status: 404, description: 'Sesi tidak ditemukan' })
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/live')
  @Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Status live peserta sesi (real-time monitoring)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Daftar attempt aktif beserta status' })
  live(@Param('id') id: string) {
    return this.monitorSvc.getLiveStatus(id);
  }

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Buat sesi ujian baru' })
  @ApiResponse({ status: 201, description: 'Sesi berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Waktu selesai harus setelah waktu mulai' })
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateSessionDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update sesi ujian' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Sesi berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Sesi tidak ditemukan' })
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.svc.update(tid, id, dto);
  }

  @Post(':id/assign')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign peserta ke sesi',
    description:
      'Generate tokenCode unik per peserta. Idempoten — peserta yang sudah ada tidak di-duplikat.',
  })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Jumlah peserta yang berhasil di-assign' })
  assign(@TenantId() tid: string, @Param('id') id: string, @Body() dto: AssignStudentsDto) {
    return this.svc.assignStudents(tid, id, dto);
  }

  @Post(':id/activate')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @AuditAction(AuditActions.ACTIVATE_SESSION, 'ExamSession')
  @ApiOperation({
    summary: 'Aktifkan sesi ujian',
    description: 'Status berubah SCHEDULED → ACTIVE. Notifikasi dikirim ke semua peserta.',
  })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Sesi berhasil diaktifkan' })
  @ApiResponse({ status: 400, description: 'Hanya sesi SCHEDULED yang bisa diaktifkan' })
  activate(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.activate(tid, id);
  }
  @Post(':id/complete')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @AuditAction('COMPLETE_SESSION', 'ExamSession')
  @ApiOperation({
    summary: 'Selesaikan sesi ujian',
    description: 'Status → COMPLETED. Semua attempt IN_PROGRESS di-timeout otomatis.',
  })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Sesi berhasil diselesaikan' })
  @ApiResponse({ status: 400, description: 'Sesi sudah dibatalkan' })
  complete(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.complete(tid, id);
  }
}
