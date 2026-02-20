import { IsNotEmpty, IsString } from 'class-validator';
export class CompleteGradingDto {
  @IsString() @IsNotEmpty() attemptId!: string;
}
