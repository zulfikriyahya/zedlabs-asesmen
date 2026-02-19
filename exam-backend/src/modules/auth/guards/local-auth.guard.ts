// ── guards/local-auth.guard.ts ───────────────────────────
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
