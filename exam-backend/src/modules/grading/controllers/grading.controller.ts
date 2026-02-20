import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
import { AuditAction, AuditActions } from '../../audit-logs/decorators/audit.decorator';
import { AuditInterceptor } from '../../audit-logs/interceptors/audit.interceptor';

@ApiTags('Grading')
@ApiBearerAuth()
@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
@UseInterceptors(AuditInterceptor)
export class GradingController {
  constructor(
    private svc: GradingService,
    private manualSvc: ManualGradingService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List attempt yang membutuhkan penilaian manual',
    description:
      'Mengembalikan attempt dengan gradingStatus = MANUAL_REQUIRED (biasanya mengandung soal essay).',
  })
  @ApiResponse({ status: 200, description: 'Paginated list attempt pending grading' })
  findPending(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findPendingManual(tid, q);
  }

  @Patch('answer')
  @AuditAction(AuditActions.GRADE_ANSWER, 'ExamAnswer')
  @ApiOperation({
    summary: 'Beri nilai pada satu jawaban',
    description:
      'Guru menilai jawaban essay secara manual. Tidak bisa override jawaban yang sudah di-auto-grade.',
  })
  @ApiResponse({ status: 200, description: 'Jawaban berhasil dinilai' })
  @ApiResponse({ status: 400, description: 'Jawaban sudah dinilai otomatis' })
  @ApiResponse({ status: 404, description: 'Jawaban tidak ditemukan' })
  gradeAnswer(@CurrentUser() u: CurrentUserPayload, @Body() dto: GradeAnswerDto) {
    return this.manualSvc.gradeAnswer(dto, u.sub);
  }

  @Post('complete')
  @ApiOperation({
    summary: 'Selesaikan grading satu attempt',
    description: 'Menghitung total score. Akan gagal jika masih ada jawaban yang belum dinilai.',
  })
  @ApiResponse({ status: 200, description: 'Grading selesai, status → COMPLETED' })
  @ApiResponse({ status: 400, description: 'Masih ada jawaban yang belum dinilai' })
  @ApiResponse({ status: 404, description: 'Attempt tidak ditemukan' })
  complete(@Body() dto: CompleteGradingDto) {
    return this.manualSvc.completeGrading(dto);
  }

  @Post('publish')
  @AuditAction(AuditActions.PUBLISH_RESULT, 'ExamAttempt')
  @ApiOperation({
    summary: 'Publikasikan hasil ujian ke siswa',
    description:
      'Batch publish. Hanya attempt dengan status COMPLETED atau AUTO_GRADED yang bisa dipublish.',
  })
  @ApiResponse({ status: 200, description: 'Jumlah hasil yang dipublish' })
  publish(@Body() dto: PublishResultDto) {
    return this.manualSvc.publishResults(dto);
  }
}
