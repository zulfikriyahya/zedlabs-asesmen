// ── dto/import-users.dto.ts ──────────────────────────────
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportUsersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users: CreateUserDto[];
}
