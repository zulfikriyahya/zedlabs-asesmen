// ── tenant-id.decorator.ts ───────────────────────────────────────────────────
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => ctx.switchToHttp().getRequest().tenantId,
);
