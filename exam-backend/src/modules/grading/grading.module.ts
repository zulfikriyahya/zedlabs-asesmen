// ── grading.module.ts ──────────────────────────────────

import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// ── dto ──────────────────────────────────────────────────
export class GradeAnswerDto {
  @IsString() @IsNotEmpty() attemptId: string;
  @IsString() @IsNotEmpty() questionId: string;
  @IsNumber() @Min(0) score: number;
  @IsOptional() @IsString() feedback?: string;
}

export class CompleteGradingDto {
  @IsString() @IsNotEmpty() attemptId: string;
}

export class PublishResultDto {
  @IsArray() @IsString({ each: true }) attemptIds: string[];
}
