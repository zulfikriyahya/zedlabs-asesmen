// ── dto/submit-exam.dto.ts ────────────────────────────────
export class SubmitExamDto {
  @IsString() @IsNotEmpty() attemptId: string;
  @IsString() @IsNotEmpty() idempotencyKey: string;
}
