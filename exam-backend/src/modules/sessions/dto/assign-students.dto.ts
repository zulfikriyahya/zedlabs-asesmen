// ════════════════════════════════════════════════════════════════════════════
// src/modules/sessions/dto/assign-students.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsArray, IsString } from 'class-validator';

export class AssignStudentsDto {
  @IsArray() @IsString({ each: true }) userIds: string[];
}
