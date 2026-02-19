// ── questions.module.ts ──────────────────────────────────
import { Module } from '@nestjs/common';

@Module({
  providers: [QuestionsService, QuestionStatisticsService, QuestionImportService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {}
