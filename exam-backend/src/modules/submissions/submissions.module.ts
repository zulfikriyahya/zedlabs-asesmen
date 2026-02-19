// ── submissions.module.ts ────────────────────────────────
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ExamPackagesModule } from '../exam-packages/exam-packages.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'submission' }), ExamPackagesModule],
  providers: [ExamDownloadService, ExamSubmissionService, AutoGradingService, SubmissionsService],
  controllers: [StudentExamController, SubmissionsController],
  exports: [ExamSubmissionService, AutoGradingService],
})
export class SubmissionsModule {}
