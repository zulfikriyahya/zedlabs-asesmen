// ══════════════════════════════════════════════════════════════
// src/modules/questions/services/question-import.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ImportQuestionsDto } from '../dto/import-questions.dto';
import { CreateQuestionDto } from '../dto/create-question.dto';

@Injectable()
export class QuestionImportService {
  constructor(private questionsSvc: QuestionsService) {}

  async fromJson(tenantId: string, raw: unknown[], createdById: string) {
    const dto: ImportQuestionsDto = { questions: raw as CreateQuestionDto[] };
    return this.questionsSvc.bulkImport(tenantId, dto, createdById);
  }
}
