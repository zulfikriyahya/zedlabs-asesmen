// ── strategies/jwt.strategy.ts ───────────────────────────
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: CurrentUserPayload & { sub: string }): CurrentUserPayload {
    return {
      sub: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email,
    };
  }
}
