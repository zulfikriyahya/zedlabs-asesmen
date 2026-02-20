import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import {
  ThrottleStrict,
  ThrottleModerate,
} from '../../../common/decorators/throttle-tier.decorator';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ThrottleStrict()
  @ApiOperation({
    summary: 'Login dengan username & password',
    description: 'Mengembalikan accessToken (15m) dan refreshToken (7d).',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid' })
  @ApiResponse({ status: 429, description: 'Terlalu banyak percobaan login' })
  login(
    @CurrentUser() user: { id: string; tenantId: string; role: string; email: string },
    @Body() body: LoginDto,
  ) {
    return this.authSvc.login(user.id, user.tenantId, user.role, user.email, body.fingerprint);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ThrottleModerate()
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Token lama di-invalidate (rotation).',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token baru berhasil di-issue' })
  @ApiResponse({ status: 401, description: 'Refresh token tidak valid atau sudah kadaluarsa' })
  refresh(@CurrentUser() user: CurrentUserPayload & { refreshToken: string }) {
    return this.authSvc.refresh(user.sub, user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — revoke refresh token' })
  @ApiResponse({ status: 204, description: 'Logout berhasil' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authSvc.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ThrottleModerate()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ganti password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 204, description: 'Password berhasil diubah' })
  @ApiResponse({ status: 401, description: 'Password lama salah' })
  changePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ChangePasswordDto) {
    return this.authSvc.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }
}
