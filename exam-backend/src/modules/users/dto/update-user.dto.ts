// ── dto/update-user.dto.ts ────────────────────────────────
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
