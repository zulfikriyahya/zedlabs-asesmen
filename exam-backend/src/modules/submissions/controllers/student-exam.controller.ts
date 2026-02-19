// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/controllers/student-exam.controller.ts  (updated)
// — tambah endpoint GET result dengan Param
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DeviceGuard } from '../../auth/guards/device.guard';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { ExamDownloadService } from '../services/exam-download.service';
import { ExamSubmissionService } from '../services/exam-submission.service';
import { StartAttemptDto } from '../dto/start-attempt.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { SubmitExamDto } from '../dto/submit-exam.dto';

@Controller('student')
@UseGuards(JwtAuthGuard, DeviceGuard)
export class StudentExamController {
  constructor(
    private downloadSvc: ExamDownloadService,
    private submissionSvc: ExamSubmissionService,
  ) {}

  @Post('download')
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

  @Post('answers')
  submitAnswer(@Body() dto: SubmitAnswerDto) {
    return this.submissionSvc.submitAnswer(dto);
  }

  @Post('submit')
  submitExam(@Body() dto: SubmitExamDto) {
    return this.submissionSvc.submitExam(dto);
  }

  @Get('result/:attemptId')
  getResult(@Param('attemptId') id: string, @CurrentUser() u: CurrentUserPayload) {
    return this.submissionSvc.getAttemptResult(id, u.sub);
  }
}
