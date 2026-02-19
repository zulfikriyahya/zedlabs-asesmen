// ── dto/upload-media.dto.ts ───────────────────────────────
import { IsOptional } from 'class-validator';
export class UploadMediaDto {
  @IsString() @IsNotEmpty() attemptId: string;
  @IsString() @IsNotEmpty() questionId: string;
  @IsOptional() @IsString() chunkIndex?: string;
  @IsOptional() @IsString() totalChunks?: string;
}
