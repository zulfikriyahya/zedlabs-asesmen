import { IsNotEmpty, IsString } from 'class-validator';
export class SubmitAnswerDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsString() @IsNotEmpty() idempotencyKey!: string;
  answer!: unknown;
  mediaUrls?: string[];
}
