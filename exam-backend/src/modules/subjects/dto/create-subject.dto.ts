// ── dto/create-subject.dto.ts ─────────────────────────────
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSubjectDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
