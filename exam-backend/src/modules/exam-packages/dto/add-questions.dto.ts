import { IsArray, ValidateNested, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
class QuestionItem {
  @IsString() questionId!: string;
  @IsInt() @Min(1) order!: number;
  @IsOptional() @IsInt() points?: number;
}
export class AddQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionItem)
  questions!: QuestionItem[];
}
