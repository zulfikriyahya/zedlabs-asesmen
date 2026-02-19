// ── base-query.dto.ts ────────────────────────────────────────────────────────
import { IsOptional, IsString } from 'class-validator';

export class BaseQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
