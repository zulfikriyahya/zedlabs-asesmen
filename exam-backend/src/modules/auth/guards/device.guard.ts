import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { DeviceLockedException } from '../../../common/exceptions/device-locked.exception';
import { AuthService } from '../services/auth.service';

@Injectable()
export class DeviceGuard implements CanActivate {
  private readonly logger = new Logger(DeviceGuard.name);

  constructor(private authSvc: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: string } | undefined;
    if (!user) return true;

    const fp = req.headers['x-device-fingerprint'] as string | undefined;
    if (!fp) return true;

    const isLocked = await this.authSvc.isDeviceLocked(user.sub, fp);
    if (isLocked) throw new DeviceLockedException(fp);
    return true;
  }
}
