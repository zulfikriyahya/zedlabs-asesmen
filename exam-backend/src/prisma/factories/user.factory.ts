// ── factories/user.factory.ts ─────────────────────────────
import { UserRole as UR } from '../../common/enums/user-role.enum';

export const userFactory = (
  overrides: Partial<{
    tenantId: string;
    email: string;
    username: string;
    role: string;
  }> = {},
) => ({
  tenantId: overrides.tenantId ?? 'test-tenant-id',
  email: overrides.email ?? `user_${Date.now()}@test.com`,
  username: overrides.username ?? `user_${Date.now()}`,
  passwordHash: '$2b$12$hashedpassword',
  role: overrides.role ?? UR.STUDENT,
  isActive: true,
});
