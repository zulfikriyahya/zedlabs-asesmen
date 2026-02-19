// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/dto/delete-media.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteMediaDto {
  @IsString() @IsNotEmpty() objectName: string;
}
