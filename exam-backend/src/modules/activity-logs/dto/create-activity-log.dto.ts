import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
export class CreateActivityLogDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() userId!: string;
  @IsString() @IsNotEmpty() type!: string;
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}
