import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitAnswerDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsString() @IsNotEmpty() idempotencyKey!: string;
  answer!: unknown;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
