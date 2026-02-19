// ── dto/update-question.dto.ts ────────────────────────────
import { PartialType } from '@nestjs/mapped-types';
export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}
