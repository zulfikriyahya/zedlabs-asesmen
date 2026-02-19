// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/controllers/grading.controller.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { GradingService } from '../services/grading.service';
import { ManualGradingService } from '../services/manual-grading.service';
import { GradeAnswerDto } from '../dto/grade-answer.dto';
import { CompleteGradingDto } from '../dto/complete-grading.dto';
import { PublishResultDto } from '../dto/publish-result.dto';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
export class GradingController {
  constructor(
    private svc: GradingService,
    private manualSvc: ManualGradingService,
  ) {}

  @Get()
  findPending(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findPendingManual(tid, q);
  }

  @Patch('answer')
  gradeAnswer(@CurrentUser() u: CurrentUserPayload, @Body() dto: GradeAnswerDto) {
    return this.manualSvc.gradeAnswer(dto, u.sub);
  }

  @Post('complete')
  complete(@Body() dto: CompleteGradingDto) {
    return this.manualSvc.completeGrading(dto);
  }

  @Post('publish')
  publish(@Body() dto: PublishResultDto) {
    return this.manualSvc.publishResults(dto);
  }
}
