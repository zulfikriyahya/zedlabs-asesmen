// ════════════════════════════════════════════════════════════════════════════
// src/common/decorators/tenant-id.decorator.ts
// ════════════════════════════════════════════════════════════════════════════
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => ctx.switchToHttp().getRequest().tenantId,
);
