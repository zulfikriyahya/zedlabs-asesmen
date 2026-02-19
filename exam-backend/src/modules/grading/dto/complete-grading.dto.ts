// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/dto/complete-grading.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsString, IsNotEmpty } from 'class-validator';

export class CompleteGradingDto {
  @IsString() @IsNotEmpty() attemptId: string;
}
