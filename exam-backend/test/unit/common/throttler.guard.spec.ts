import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorage } from '@nestjs/throttler';
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

  beforeEach(() => {
    guard = new CustomThrottlerGuard({} as ThrottlerStorage, {} as Reflector, []);
  });

  it('getTracker — menggunakan tenantId:userId saat authenticated', async () => {
    const req = { tenantId: 'tenant-1', user: { sub: 'user-abc' }, ip: '1.2.3.4' };
    const tracker = await (guard as any).getTracker(req);
    expect(tracker).toBe('tenant-1:user-abc');
  });

  it('getTracker — fallback ke tenantId:ip saat belum login', async () => {
    const req = { tenantId: 'tenant-1', user: undefined, ip: '1.2.3.4' };
    const tracker = await (guard as any).getTracker(req);
    expect(tracker).toBe('tenant-1:1.2.3.4');
  });

  it('shouldSkip — true untuk ADMIN', async () => {
    const result = await (guard as any).shouldSkip(mockCtx(UserRole.ADMIN));
    expect(result).toBe(true);
  });

  it('shouldSkip — true untuk SUPERADMIN', async () => {
    const result = await (guard as any).shouldSkip(mockCtx(UserRole.SUPERADMIN));
    expect(result).toBe(true);
  });

  it('shouldSkip — false untuk STUDENT', async () => {
    const result = await (guard as any).shouldSkip(mockCtx(UserRole.STUDENT));
    expect(result).toBe(false);
  });

  it('shouldSkip — false untuk unauthenticated', async () => {
    const result = await (guard as any).shouldSkip(mockCtx(undefined));
    expect(result).toBe(false);
  });
});
