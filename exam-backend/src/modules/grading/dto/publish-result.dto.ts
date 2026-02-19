// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/dto/publish-result.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsArray, IsString } from 'class-validator';

export class PublishResultDto {
  @IsArray() @IsString({ each: true }) attemptIds: string[];
}
