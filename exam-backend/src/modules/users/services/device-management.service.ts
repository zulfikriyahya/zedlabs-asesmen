import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { hashFingerprint } from '../../../common/utils/device-fingerprint.util';

@Injectable()
export class DeviceManagementService {
  constructor(private prisma: PrismaService) {}

  getUserDevices(userId: string) {
    return this.prisma.userDevice.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
      select: {
        id: true,
        fingerprint: true,
        label: true,
        isLocked: true,
        lockedAt: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });
  }

  async getUserDevicesByTenant(tenantId: string, userId: string) {
    // Verifikasi user milik tenant
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.getUserDevices(userId);
  }

  private async findDevice(tenantId: string, userId: string, rawFp: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const fp = hashFingerprint(rawFp);
    const dev = await this.prisma.userDevice.findUnique({
      where: { userId_fingerprint: { userId, fingerprint: fp } },
    });
    if (!dev) throw new NotFoundException('Perangkat tidak ditemukan');
    return { dev, fp };
  }

  async lockDevice(tenantId: string, userId: string, rawFp: string) {
    const { dev, fp } = await this.findDevice(tenantId, userId, rawFp);
    return this.prisma.userDevice.update({
      where: { userId_fingerprint: { userId, fingerprint: fp } },
      data: { isLocked: true, lockedAt: new Date() },
    });
  }

  async unlockDevice(tenantId: string, userId: string, rawFp: string) {
    const { fp } = await this.findDevice(tenantId, userId, rawFp);
    return this.prisma.userDevice.update({
      where: { userId_fingerprint: { userId, fingerprint: fp } },
      data: { isLocked: false, lockedAt: null },
    });
  }

  async updateLabel(tenantId: string, userId: string, rawFp: string, label: string) {
    const { fp } = await this.findDevice(tenantId, userId, rawFp);
    return this.prisma.userDevice.update({
      where: { userId_fingerprint: { userId, fingerprint: fp } },
      data: { label },
    });
  }

  async removeDevice(tenantId: string, userId: string, rawFp: string) {
    const { fp } = await this.findDevice(tenantId, userId, rawFp);
    return this.prisma.userDevice.delete({
      where: { userId_fingerprint: { userId, fingerprint: fp } },
    });
  }
}
