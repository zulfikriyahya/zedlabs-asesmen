// ── services/auth.service.ts ─────────────────────────────
import { Injectable as AS, UnauthorizedException as UE, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { hashFingerprint } from '../../../common/utils/device-fingerprint.util';

@AS()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { username, isActive: true } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async login(userId: string, tenantId: string, role: string, email: string, fingerprint: string) {
    await this.upsertDevice(userId, fingerprint);

    const payload = { sub: userId, tenantId, role, email };
    const accessToken = this.jwt.sign(payload, {
      secret: this.cfg.get('JWT_ACCESS_SECRET'),
      expiresIn: this.cfg.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
      expiresIn: this.cfg.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  async refresh(userId: string, oldToken: string) {
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId, token: oldToken, revokedAt: null },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UE('Refresh token tidak valid atau sudah kadaluarsa');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.login(userId, user.tenantId, user.role, user.email, '');
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  async changePassword(userId: string, currentPw: string, newPw: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const ok = await bcrypt.compare(currentPw, user.passwordHash);
    if (!ok) throw new UE('Password saat ini salah');
    const passwordHash = await bcrypt.hash(newPw, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async isDeviceLocked(userId: string, rawFp: string): Promise<boolean> {
    const fp = hashFingerprint(rawFp);
    const dev = await this.prisma.userDevice.findUnique({
      where: { userId_fingerprint: { userId, fingerprint: fp } },
    });
    return dev?.isLocked ?? false;
  }

  private async upsertDevice(userId: string, rawFp: string) {
    const fp = hashFingerprint(rawFp);
    await this.prisma.userDevice.upsert({
      where: { userId_fingerprint: { userId, fingerprint: fp } },
      create: { userId, fingerprint: fp, lastSeenAt: new Date() },
      update: { lastSeenAt: new Date() },
    });
  }
}
