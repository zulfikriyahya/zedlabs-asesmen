// ════════════════════════════════════════════════════════════════════════════
// src/modules/tenants/dto/update-tenant.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
