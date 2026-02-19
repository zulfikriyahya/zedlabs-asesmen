// ── dto/approve-question.dto.ts ──────────────────────────
import { IsIn } from 'class-validator';
export class ApproveQuestionDto {
  @IsIn(['review', 'approved', 'draft']) status: string;
}
