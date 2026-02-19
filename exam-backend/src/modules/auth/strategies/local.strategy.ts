// ── strategies/local.strategy.ts ────────────────────────
import { Strategy as LocalS } from 'passport-local';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(LocalS) {
  constructor(private authSvc: AuthService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string) {
    const user = await this.authSvc.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Kredensial tidak valid');
    return user;
  }
}
