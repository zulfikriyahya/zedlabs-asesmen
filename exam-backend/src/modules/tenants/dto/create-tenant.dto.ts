// ════════════════════════════════════════════════════════════════════════════
// src/modules/tenants/dto/create-tenant.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTenantDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() subdomain: string;
}
