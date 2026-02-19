// ════════════════════════════════════════════════════════════════════════════
// src/modules/question-tags/question-tags.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { QuestionTagsService } from './services/question-tags.service';
import { QuestionTagsController } from './controllers/question-tags.controller';

@Module({
  providers: [QuestionTagsService],
  controllers: [QuestionTagsController],
  exports: [QuestionTagsService],
})
export class QuestionTagsModule {}
