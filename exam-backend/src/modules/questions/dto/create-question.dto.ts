// ── dto/create-question.dto.ts ────────────────────────────
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
  IsObject,
} from 'class-validator';
import { QuestionType } from '../../../common/enums/question-type.enum';

export class CreateQuestionDto {
  @IsString() @IsNotEmpty() subjectId: string;
  @IsEnum(QuestionType) type: QuestionType;
  @IsObject() content: Record<string, unknown>;
  @IsOptional() @IsObject() options?: Record<string, unknown>;
  @IsObject() correctAnswer: Record<string, unknown>;
  @IsOptional() @IsInt() @Min(1) points?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) difficulty?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tagIds?: string[];
}
