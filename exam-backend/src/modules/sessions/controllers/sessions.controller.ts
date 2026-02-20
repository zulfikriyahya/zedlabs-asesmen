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

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class SessionsController {
  constructor(
    private svc: SessionsService,
    private monitorSvc: SessionMonitoringService,
  ) {}

  @Get()
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/live')
  @Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN)
  live(@Param('id') id: string) {
    return this.monitorSvc.getLiveStatus(id);
  }

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateSessionDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.svc.update(tid, id, dto);
  }

  @Post(':id/assign')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  assign(@TenantId() tid: string, @Param('id') id: string, @Body() dto: AssignStudentsDto) {
    return this.svc.assignStudents(tid, id, dto);
  }

  @Post(':id/activate')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @AuditAction(AuditActions.ACTIVATE_SESSION, 'ExamSession')
  activate(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.activate(tid, id);
  }
}
