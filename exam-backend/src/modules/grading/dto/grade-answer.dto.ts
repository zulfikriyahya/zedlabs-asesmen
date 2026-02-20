import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class GradeAnswerDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsNumber() @Min(0) score!: number;
  @IsOptional() @IsString() feedback?: string;
}
