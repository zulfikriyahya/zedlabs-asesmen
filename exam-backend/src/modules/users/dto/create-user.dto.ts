// ── dto/create-user.dto.ts ────────────────────────────────
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() username: string;
  @IsString() @MinLength(8) password: string;
  @IsEnum(UserRole) role: UserRole;
  @IsOptional() @IsString() name?: string;
}
