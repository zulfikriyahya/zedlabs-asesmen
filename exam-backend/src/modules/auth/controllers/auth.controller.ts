// ── controllers/auth.controller.ts ───────────────────────
import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../../common/decorators/current-user.decorator';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: { user: { id: string; tenantId: string; role: string; email: string } },
    @Body() body: LoginDto,
  ) {
    return this.authSvc.login(
      req.user.id,
      req.user.tenantId,
      req.user.role,
      req.user.email,
      body.fingerprint,
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    // decode sub dari token tanpa verify untuk ambil userId
    const payload = this.authSvc['jwt'].decode(dto.refreshToken) as { sub: string };
    return this.authSvc.refresh(payload.sub, dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authSvc.logout(dto.refreshToken);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ChangePasswordDto) {
    await this.authSvc.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }
}
