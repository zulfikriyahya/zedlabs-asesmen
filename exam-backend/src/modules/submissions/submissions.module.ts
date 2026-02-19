// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/submissions.module.ts  (final — no circular dep)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExamPackagesModule } from '../exam-packages/exam-packages.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ExamDownloadService } from './services/exam-download.service';
import { ExamSubmissionService } from './services/exam-submission.service';
import { AutoGradingService } from './services/auto-grading.service';
import { SubmissionsService } from './services/submissions.service';
import { StudentExamController } from './controllers/student-exam.controller';
import { SubmissionsController } from './controllers/submissions.controller';
import { SubmissionProcessor } from './processors/submission.processor';
import { SubmissionEventsListener } from './processors/submission-events.listener';
// GradingService di-inject via GradingModule — tapi itu circular.
// Solusi: AutoGradingService di-provide langsung di sini,
// GradingService.runAutoGrade di-call langsung tanpa import GradingModule.
import { GradingHelperService } from './services/grading-helper.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'submission' }), ExamPackagesModule, AuditLogsModule],
  providers: [
    ExamDownloadService,
    ExamSubmissionService,
    AutoGradingService,
    GradingHelperService, // internal helper, bukan GradingModule
    SubmissionsService,
    SubmissionProcessor,
    SubmissionEventsListener,
  ],
  controllers: [StudentExamController, SubmissionsController],
  exports: [ExamSubmissionService, AutoGradingService, GradingHelperService],
})
export class SubmissionsModule {}
