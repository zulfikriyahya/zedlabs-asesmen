// ── dto/start-attempt.dto.ts ──────────────────────────────
import { IsString, IsNotEmpty } from 'class-validator';

export class StartAttemptDto {
  @IsString() @IsNotEmpty() sessionId: string;
  @IsString() @IsNotEmpty() tokenCode: string;
  @IsString() @IsNotEmpty() deviceFingerprint: string;
  @IsString() @IsNotEmpty() idempotencyKey: string;
}
