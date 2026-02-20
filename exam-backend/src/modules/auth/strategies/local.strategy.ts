import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authSvc: AuthService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string) {
    const user = await this.authSvc.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Kredensial tidak valid');
    return user;
  }
}
