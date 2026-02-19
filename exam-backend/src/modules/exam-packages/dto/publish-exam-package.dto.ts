// ── dto/publish-exam-package.dto.ts ──────────────────────
import { IsOptional, IsString } from 'class-validator';
export class PublishExamPackageDto {
  @IsOptional() @IsString() notes?: string;
}
