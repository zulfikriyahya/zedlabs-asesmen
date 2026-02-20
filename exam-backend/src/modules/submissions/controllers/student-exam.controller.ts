import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
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

@ApiTags('Student Exam')
@ApiBearerAuth()
@Controller('student')
@UseGuards(JwtAuthGuard, DeviceGuard)
@UseInterceptors(AuditInterceptor)
export class StudentExamController {
  constructor(
    private downloadSvc: ExamDownloadService,
    private submissionSvc: ExamSubmissionService,
  ) {}

  @Post('download')
  @ThrottleStrict()
  @AuditAction(AuditActions.START_EXAM, 'ExamAttempt')
  @ApiOperation({
    summary: 'Download paket soal',
    description:
      'Validasi token, buat attempt, dan kembalikan paket soal terenkripsi. Idempoten via idempotencyKey.',
  })
  @ApiResponse({ status: 200, description: 'Paket soal berhasil di-download' })
  @ApiResponse({ status: 400, description: 'Token tidak valid / di luar jangka waktu sesi' })
  @ApiResponse({ status: 404, description: 'Sesi tidak aktif' })
  @ApiResponse({ status: 429, description: 'Rate limit — maks 5 req/menit' })
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
  @ThrottleModerate()
  @ApiOperation({
    summary: 'Submit / update jawaban',
    description:
      'Auto-save per soal. Idempoten via idempotencyKey. Tidak bisa diubah setelah ujian disubmit.',
  })
  @ApiResponse({ status: 200, description: 'Jawaban tersimpan' })
  @ApiResponse({ status: 400, description: 'Attempt sudah SUBMITTED atau TIMED_OUT' })
  @ApiResponse({ status: 404, description: 'Attempt tidak ditemukan' })
  submitAnswer(@Body() dto: SubmitAnswerDto) {
    return this.submissionSvc.submitAnswer(dto);
  }

  @Post('submit')
  @ThrottleStrict()
  @AuditAction(AuditActions.SUBMIT_EXAM, 'ExamAttempt')
  @ApiOperation({
    summary: 'Submit ujian',
    description: 'Mengunci semua jawaban dan memicu auto-grading via BullMQ. Idempoten.',
  })
  @ApiResponse({ status: 200, description: 'Ujian berhasil disubmit' })
  @ApiResponse({ status: 404, description: 'Attempt tidak ditemukan' })
  submitExam(@Body() dto: SubmitExamDto) {
    return this.submissionSvc.submitExam(dto);
  }

  @Get('result/:attemptId')
  @ThrottleRelaxed()
  @ApiOperation({
    summary: 'Lihat hasil ujian',
    description:
      'Hanya mengembalikan nilai lengkap jika status PUBLISHED. Siswa hanya bisa akses attempt miliknya.',
  })
  @ApiParam({ name: 'attemptId', description: 'ID attempt yang ingin dilihat hasilnya' })
  @ApiResponse({ status: 200, description: 'Data hasil ujian' })
  @ApiResponse({ status: 404, description: 'Attempt tidak ditemukan atau bukan milik user ini' })
  getResult(@Param('attemptId') id: string, @CurrentUser() u: CurrentUserPayload) {
    return this.submissionSvc.getAttemptResult(id, u.sub);
  }
}
