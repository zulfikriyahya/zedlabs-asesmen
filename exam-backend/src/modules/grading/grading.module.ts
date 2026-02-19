// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/grading.module.ts  (updated — circular dep fix)
// GradingModule tidak lagi import SubmissionsModule untuk AutoGradingService.
// Sebaliknya AutoGradingService di-provide ulang di sini.
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { GradingService } from './services/grading.service';
import { ManualGradingService } from './services/manual-grading.service';
import { GradingController } from './controllers/grading.controller';
import { AutoGradingService } from '../submissions/services/auto-grading.service';

@Module({
  providers: [GradingService, ManualGradingService, AutoGradingService],
  controllers: [GradingController],
  exports: [GradingService, AutoGradingService],
})
export class GradingModule {}
