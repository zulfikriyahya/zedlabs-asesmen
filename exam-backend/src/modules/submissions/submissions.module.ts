import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExamPackagesModule } from '../exam-packages/exam-packages.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuthModule } from '../auth/auth.module';
import { ExamDownloadService } from './services/exam-download.service';
import { ExamSubmissionService } from './services/exam-submission.service';
import { AutoGradingService } from './services/auto-grading.service';
import { SubmissionsService } from './services/submissions.service';
import { StudentExamController } from './controllers/student-exam.controller';
import { SubmissionsController } from './controllers/submissions.controller';
import { SubmissionProcessor } from './processors/submission.processor';
import { GradingHelperService } from './services/grading-helper.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'submission' }),
    ExamPackagesModule,
    AuditLogsModule, // sudah ada — AuditInterceptor & AuditLogsService tersedia
    AuthModule,
  ],
  providers: [
    ExamDownloadService,
    ExamSubmissionService,
    AutoGradingService,
    GradingHelperService,
    SubmissionsService,
    SubmissionProcessor,
  ],
  controllers: [StudentExamController, SubmissionsController],
  exports: [ExamSubmissionService, AutoGradingService, GradingHelperService],
})
export class SubmissionsModule {}
