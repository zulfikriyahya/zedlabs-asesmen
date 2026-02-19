// ── dto/submit-answer.dto.ts ──────────────────────────────
export class SubmitAnswerDto {
  @IsString() @IsNotEmpty() attemptId: string;
  @IsString() @IsNotEmpty() questionId: string;
  @IsString() @IsNotEmpty() idempotencyKey: string;
  answer: unknown; // JSON — bisa string, array, dll tergantung tipe soal
  mediaUrls?: string[];
}
