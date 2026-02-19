// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/submissions.module.ts  (updated)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExamPackagesModule } from '../exam-packages/exam-packages.module';
import { GradingModule } from '../grading/grading.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ExamDownloadService } from './services/exam-download.service';
import { ExamSubmissionService } from './services/exam-submission.service';
import { AutoGradingService } from './services/auto-grading.service';
import { SubmissionsService } from './services/submissions.service';
import { StudentExamController } from './controllers/student-exam.controller';
import { SubmissionsController } from './controllers/submissions.controller';
import { SubmissionProcessor } from './processors/submission.processor';
import { SubmissionEventsListener } from './processors/submission-events.listener';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'submission' }),
    ExamPackagesModule,
    GradingModule,
    AuditLogsModule,
  ],
  providers: [
    ExamDownloadService,
    ExamSubmissionService,
    AutoGradingService,
    SubmissionsService,
    SubmissionProcessor,
    SubmissionEventsListener,
  ],
  controllers: [StudentExamController, SubmissionsController],
  exports: [ExamSubmissionService, AutoGradingService],
})
export class SubmissionsModule {}
