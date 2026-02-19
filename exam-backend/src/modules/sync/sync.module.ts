// ── sync.module.ts ─────────────────────────────
import { SyncType } from '../../common/enums/sync-status.enum';

// ── dto ──────────────────────────────────────────────────
export class AddSyncItemDto {
  @IsString() @IsNotEmpty() attemptId: string;
  @IsString() @IsNotEmpty() idempotencyKey: string;
  type: SyncType;
  payload: Record<string, unknown>;
}
export class RetrySyncDto {
  @IsString() @IsNotEmpty() syncItemId: string;
}
