// ════════════════════════════════════════════════════════════════════════════
// src/modules/sync/dto/add-sync-item.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsString, IsNotEmpty, IsEnum, IsObject } from 'class-validator';
import { SyncType } from '../../../common/enums/sync-status.enum';

export class AddSyncItemDto {
  @IsString() @IsNotEmpty() attemptId: string;
  @IsString() @IsNotEmpty() idempotencyKey: string;
  @IsEnum(SyncType) type: SyncType;
  @IsObject() payload: Record<string, unknown>;
}
