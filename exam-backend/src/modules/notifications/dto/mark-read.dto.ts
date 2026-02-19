// ════════════════════════════════════════════════════════════════════════════
// src/modules/notifications/dto/mark-read.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsString, IsNotEmpty } from 'class-validator';

export class MarkReadDto {
  @IsString() @IsNotEmpty() notificationId: string;
}
