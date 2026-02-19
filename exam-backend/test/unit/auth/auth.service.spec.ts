// ── test/unit/auth/auth.service.spec.ts ──────────────────────────────────────
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let svc: AuthService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: { findFirst: jest.fn() },
            refreshToken: { create: jest.fn() },
            userDevice: { upsert: jest.fn() },
          },
        },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'mock-token') } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((k: string) => (k === 'JWT_ACCESS_EXPIRES_IN' ? '15m' : 'mock-secret')),
          },
        },
      ],
    }).compile();

    svc = mod.get(AuthService);
    prisma = mod.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('validateUser returns null for wrong password', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ passwordHash: '$2b$12$wrong' });
    const result = await svc.validateUser('user', 'wrongpass');
    expect(result).toBeNull();
  });
});
