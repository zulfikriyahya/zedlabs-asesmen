// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/grading.module.ts  (standalone — fix import AutoGrading)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { GradingService } from './services/grading.service';
import { ManualGradingService } from './services/manual-grading.service';
import { GradingController } from './controllers/grading.controller';
import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [SubmissionsModule], // import AutoGradingService dari submissions
  providers: [GradingService, ManualGradingService],
  controllers: [GradingController],
  exports: [GradingService],
})
export class GradingModule {}
