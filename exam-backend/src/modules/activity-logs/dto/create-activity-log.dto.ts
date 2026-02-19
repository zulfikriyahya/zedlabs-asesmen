// ════════════════════════════════════════════════════════════════════════════
// src/modules/activity-logs/dto/create-activity-log.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateActivityLogDto {
  @IsString() @IsNotEmpty() attemptId: string;
  @IsString() @IsNotEmpty() userId: string;
  @IsString() @IsNotEmpty() type: string;
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}
