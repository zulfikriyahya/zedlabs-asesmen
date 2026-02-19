// ════════════════════════════════════════════════════════════════════════════
// src/modules/sync/dto/retry-sync.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsString, IsNotEmpty } from 'class-validator';

export class RetrySyncDto {
  @IsString() @IsNotEmpty() syncItemId: string;
}
