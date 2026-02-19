// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/grading.module.ts  (final — no circular dep)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { GradingService } from './services/grading.service';
import { ManualGradingService } from './services/manual-grading.service';
import { GradingController } from './controllers/grading.controller';
import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [SubmissionsModule], // dapat GradingHelperService & AutoGradingService
  providers: [GradingService, ManualGradingService],
  controllers: [GradingController],
  exports: [GradingService, ManualGradingService],
})
export class GradingModule {}
