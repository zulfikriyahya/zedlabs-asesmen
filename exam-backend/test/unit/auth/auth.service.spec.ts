import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

const mockUser = {
  id: 'user-1',
  tenantId: 'tenant-1',
  role: 'STUDENT',
  email: 'siswa@test.com',
  username: 'siswa1',
  isActive: true,
  passwordHash: '',
};

describe('AuthService', () => {
  let svc: AuthService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      findUniqueOrThrow: jest.Mock;
      update: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    userDevice: { upsert: jest.Mock };
  };
  let jwtSvc: { sign: jest.Mock };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('password123', 10);
  });

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      userDevice: { upsert: jest.fn() },
    };
    jwtSvc = { sign: jest.fn(() => 'mock-token') };

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtSvc },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((k: string) => {
              const map: Record<string, string> = {
                JWT_ACCESS_SECRET: 'access-secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_SECRET: 'refresh-secret',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return map[k] ?? null;
            }),
          },
        },
      ],
    }).compile();

    svc = mod.get(AuthService);
    jest.clearAllMocks();
  });

  // ── validateUser ──────────────────────────────────────────────────────────
  describe('validateUser', () => {
    it('return user jika kredensial valid', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      const result = await svc.validateUser('siswa1', 'password123');
      expect(result).toMatchObject({ id: 'user-1' });
    });

    it('return null jika user tidak ditemukan', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      expect(await svc.validateUser('notfound', 'pass')).toBeNull();
    });

    it('return null jika password salah', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      expect(await svc.validateUser('siswa1', 'wrongpass')).toBeNull();
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    beforeEach(() => {
      prisma.userDevice.upsert.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});
    });

    it('return accessToken dan refreshToken', async () => {
      const result = await svc.login('u1', 't1', 'STUDENT', 'e@e.com', 'fp');
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(jwtSvc.sign).toHaveBeenCalledTimes(2);
    });

    it('upsert device fingerprint', async () => {
      await svc.login('u1', 't1', 'STUDENT', 'e@e.com', 'my-fp');
      expect(prisma.userDevice.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ userId: 'u1' }) }),
      );
    });
  });

  // ── refresh ───────────────────────────────────────────────────────────────
  describe('refresh', () => {
    it('throw jika refresh token tidak ditemukan', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue(null);
      await expect(svc.refresh('u1', 'bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throw jika refresh token sudah expired', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue({
        id: 'rt-1',
        expiresAt: new Date(Date.now() - 1000), // masa lalu
      });
      await expect(svc.refresh('u1', 'old-token')).rejects.toThrow(UnauthorizedException);
    });

    it('revoke token lama dan issue token baru', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      prisma.refreshToken.findFirst.mockResolvedValue({ id: 'rt-1', expiresAt: futureDate });
      prisma.refreshToken.update.mockResolvedValue({});
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.userDevice.upsert.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      await svc.refresh('user-1', 'valid-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ revokedAt: expect.any(Date) }) }),
      );
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('revoke refresh token', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      await svc.logout('some-token');
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { revokedAt: expect.any(Date) } }),
      );
    });
  });

  // ── changePassword ────────────────────────────────────────────────────────
  describe('changePassword', () => {
    it('throw jika password lama salah', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      await expect(svc.changePassword('u1', 'wrongold', 'newpass123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('update passwordHash jika password lama benar', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({});
      await svc.changePassword('u1', 'password123', 'newpass123');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordHash: expect.any(String) }),
        }),
      );
    });
  });

  // ── isDeviceLocked ────────────────────────────────────────────────────────
  describe('isDeviceLocked', () => {
    it('return true jika device terkunci', async () => {
      (prisma as any).userDevice = {
        ...prisma.userDevice,
        findUnique: jest.fn().mockResolvedValue({ isLocked: true }),
      };
      expect(await svc.isDeviceLocked('u1', 'fp')).toBe(true);
    });

    it('return false jika device tidak terkunci', async () => {
      (prisma as any).userDevice = {
        ...prisma.userDevice,
        findUnique: jest.fn().mockResolvedValue({ isLocked: false }),
      };
      expect(await svc.isDeviceLocked('u1', 'fp')).toBe(false);
    });

    it('return false jika device belum pernah terdaftar', async () => {
      (prisma as any).userDevice = {
        ...prisma.userDevice,
        findUnique: jest.fn().mockResolvedValue(null),
      };
      expect(await svc.isDeviceLocked('u1', 'fp')).toBe(false);
    });
  });
});
