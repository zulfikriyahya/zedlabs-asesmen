import { IsNotEmpty, IsString } from 'class-validator';
export class SubmitExamDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() idempotencyKey!: string;
}
