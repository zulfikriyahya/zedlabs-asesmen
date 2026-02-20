import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '../../../src/common/guards/throttler.guard';
import { UserRole } from '../../../src/common/enums/user-role.enum';

const mockCtx = (role?: string, userId = 'user-1', tenantId = 'tenant-1') =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user: role ? { sub: userId, role } : undefined,
        tenantId,
        ip: '127.0.0.1',
        url: '/test',
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as unknown as ExecutionContext;

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])],
      providers: [CustomThrottlerGuard, Reflector],
    }).compile();

    guard = module.get(CustomThrottlerGuard);
  });

  it('getTracker — menggunakan tenantId:userId saat authenticated', async () => {
    const req = { tenantId: 'tenant-1', user: { sub: 'user-abc' }, ip: '1.2.3.4' };
    const tracker = await (guard as any).getTracker(req);
    expect(tracker).toBe('tenant-1:user-abc');
  });

  it('getTracker — fallback ke ip saat tidak ada user', async () => {
    const req = { tenantId: 'tenant-1', ip: '1.2.3.4' };
    const tracker = await (guard as any).getTracker(req);
    expect(tracker).toBe('tenant-1:1.2.3.4');
  });

  it('getTracker — fallback ke global:0.0.0.0 jika tidak ada data', async () => {
    const req = {};
    const tracker = await (guard as any).getTracker(req);
    expect(tracker).toBe('global:0.0.0.0');
  });

  it('shouldSkip — true untuk ADMIN', async () => {
    expect(await (guard as any).shouldSkip(mockCtx(UserRole.ADMIN))).toBe(true);
  });

  it('shouldSkip — true untuk SUPERADMIN', async () => {
    expect(await (guard as any).shouldSkip(mockCtx(UserRole.SUPERADMIN))).toBe(true);
  });

  it('shouldSkip — false untuk STUDENT', async () => {
    expect(await (guard as any).shouldSkip(mockCtx(UserRole.STUDENT))).toBe(false);
  });

  it('shouldSkip — false jika tidak ada user', async () => {
    expect(await (guard as any).shouldSkip(mockCtx())).toBe(false);
  });

  it('throwThrottlingException — melempar pesan dengan URL', async () => {
    await expect(
      (guard as any).throwThrottlingException(mockCtx(UserRole.STUDENT), {}),
    ).rejects.toThrow('/test');
  });
});
