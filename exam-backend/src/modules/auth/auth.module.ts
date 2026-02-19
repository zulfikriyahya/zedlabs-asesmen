// ── auth.module.ts ────────────────────────────────────────
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, PassportModule, JwtModule.register({})],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, LocalStrategy, DeviceGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, RolesGuard, DeviceGuard],
})
export class AuthModule {}
