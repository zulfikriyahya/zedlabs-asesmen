// ════════════════════════════════════════════════════════════════════════════
// src/modules/question-tags/dto/update-tag.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTagDto extends PartialType(CreateTagDto) {}
