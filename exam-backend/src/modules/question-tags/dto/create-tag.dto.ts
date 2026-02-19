// ════════════════════════════════════════════════════════════════════════════
// src/modules/question-tags/dto/create-tag.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  @IsString() @IsNotEmpty() name: string;
}
