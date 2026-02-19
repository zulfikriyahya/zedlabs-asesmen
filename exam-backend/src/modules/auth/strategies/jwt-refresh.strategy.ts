// ── strategies/jwt-refresh.strategy.ts ───────────────────
import { Strategy as S2 } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(S2, 'jwt-refresh') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: cfg.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: CurrentUserPayload) {
    return { ...payload, refreshToken: (req.body as { refreshToken: string }).refreshToken };
  }
}
