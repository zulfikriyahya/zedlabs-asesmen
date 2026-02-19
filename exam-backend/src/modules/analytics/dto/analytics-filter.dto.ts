// ════════════════════════════════════════════════════════════════════════════
// src/modules/analytics/dto/analytics-filter.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class AnalyticsFilterDto extends BaseQueryDto {
  @IsOptional() @IsString() sessionId?: string;
  @IsOptional() @IsString() subjectId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}
