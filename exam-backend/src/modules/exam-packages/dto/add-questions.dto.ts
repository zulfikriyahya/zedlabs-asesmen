// ── dto/add-questions.dto.ts ──────────────────────────────
import { IsArray, ValidateNested, IsInt, IsOptional } from 'class-validator';

class QuestionItem {
  @IsString() questionId: string;
  @IsInt() @Min(1) order: number;
  @IsOptional() @IsInt() points?: number;
}

export class AddQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionItem)
  questions: QuestionItem[];
}
