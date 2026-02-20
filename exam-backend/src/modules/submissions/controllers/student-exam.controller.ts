import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DeviceGuard } from '../../auth/guards/device.guard';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { AuditAction, AuditActions } from '../../audit-logs/decorators/audit.decorator';
import { AuditInterceptor } from '../../audit-logs/interceptors/audit.interceptor';
import {
  ThrottleStrict,
  ThrottleModerate,
  ThrottleRelaxed,
} from '../../../common/decorators/throttle-tier.decorator';
import { ExamDownloadService } from '../services/exam-download.service';
import { ExamSubmissionService } from '../services/exam-submission.service';
import { StartAttemptDto } from '../dto/start-attempt.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { SubmitExamDto } from '../dto/submit-exam.dto';

@Controller('student')
@UseGuards(JwtAuthGuard, DeviceGuard)
@UseInterceptors(AuditInterceptor)
export class StudentExamController {
  constructor(
    private downloadSvc: ExamDownloadService,
    private submissionSvc: ExamSubmissionService,
  ) {}

  /** Download paket soal — paling kritis, harus strict */
  @Post('download')
  @ThrottleStrict()
  @AuditAction(AuditActions.START_EXAM, 'ExamAttempt')
  download(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: StartAttemptDto,
  ) {
    return this.downloadSvc.downloadPackage(
      tid,
      dto.sessionId,
      u.sub,
      dto.tokenCode,
      dto.deviceFingerprint,
      dto.idempotencyKey,
    );
  }

  /** Submit jawaban — moderate karena auto-save bisa sering */
  @Post('answers')
  @ThrottleModerate()
  submitAnswer(@Body() dto: SubmitAnswerDto) {
    return this.submissionSvc.submitAnswer(dto);
  }

  /** Submit ujian — strict, satu kali saja */
  @Post('submit')
  @ThrottleStrict()
  @AuditAction(AuditActions.SUBMIT_EXAM, 'ExamAttempt')
  submitExam(@Body() dto: SubmitExamDto) {
    return this.submissionSvc.submitExam(dto);
  }

  /** Lihat hasil — relaxed, baca saja */
  @Get('result/:attemptId')
  @ThrottleRelaxed()
  getResult(@Param('attemptId') id: string, @CurrentUser() u: CurrentUserPayload) {
    return this.submissionSvc.getAttemptResult(id, u.sub);
  }
}
