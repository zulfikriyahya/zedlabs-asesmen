import { Module } from '@nestjs/common';
import { QuestionsService } from './services/questions.service';
import { QuestionStatisticsService } from './services/question-statistics.service';
import { QuestionImportService } from './services/question-import.service';
import { QuestionsController } from './controllers/questions.controller';

@Module({
  providers: [QuestionsService, QuestionStatisticsService, QuestionImportService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {}
