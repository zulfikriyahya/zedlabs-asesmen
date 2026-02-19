// ── dto/import-questions.dto.ts ──────────────────────────
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class ImportQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
