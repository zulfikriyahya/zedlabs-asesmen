// ── tenant.interceptor.ts ────────────────────────────────
@Inj()
export class TenantInterceptor implements NestInterceptor {
  intercept(ctx: EC, next: CallHandler): Observable<unknown> {
    // tenantId sudah di-set oleh SubdomainMiddleware; interceptor ini
    // tersedia untuk enrichment response jika diperlukan
    return next.handle();
  }
}
