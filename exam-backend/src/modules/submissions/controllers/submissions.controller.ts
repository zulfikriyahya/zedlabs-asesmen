// ══════════════════════════════════════════════════════════════
// src/modules/submissions/controllers/submissions.controller.ts
// ══════════════════════════════════════════════════════════════
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { SubmissionsService } from '../services/submissions.service';

@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(private svc: SubmissionsService) {}

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.OPERATOR)
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }
}
