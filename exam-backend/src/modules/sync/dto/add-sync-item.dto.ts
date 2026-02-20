import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { SyncType } from '../../../common/enums/sync-status.enum';
export class AddSyncItemDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() idempotencyKey!: string;
  @IsEnum(SyncType) type!: SyncType;
  @IsObject() payload!: Record<string, unknown>;
}
