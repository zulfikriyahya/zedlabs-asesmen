// ── controllers/exam-packages.controller.ts ──────────────
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  Roles,
  TenantId,
  CurrentUser,
  CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';

@Controller('exam-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamPackagesController {
  constructor(
    private svc: ExamPackagesService,
    private analysisSvc: ItemAnalysisService,
  ) {}

  @Get() findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }
  @Get(':id') findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }
  @Get(':id/item-analysis') @Roles(UserRole.TEACHER, UserRole.ADMIN) analysis(
    @TenantId() tid: string,
    @Param('id') id: string,
  ) {
    return this.analysisSvc.analyze(tid, id);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateExamPackageDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateExamPackageDto) {
    return this.svc.update(tid, id, dto);
  }

  @Post(':id/questions')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  addQuestions(@TenantId() tid: string, @Param('id') id: string, @Body() dto: AddQuestionsDto) {
    return this.svc.addQuestions(tid, id, dto);
  }

  @Delete(':id/questions/:qid')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeQuestion(@TenantId() tid: string, @Param('id') id: string, @Param('qid') qid: string) {
    return this.svc.removeQuestion(tid, id, qid);
  }

  @Post(':id/publish')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  publish(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.publish(tid, id);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN)
  archive(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.archive(tid, id);
  }
}
