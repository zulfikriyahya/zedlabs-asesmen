import type { UserRole } from '@/types/common';

export const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/guru': ['TEACHER', 'ADMIN', 'SUPERADMIN'],
  '/operator': ['OPERATOR', 'ADMIN', 'SUPERADMIN'],
  '/pengawas': ['SUPERVISOR', 'ADMIN', 'SUPERADMIN'],
  '/siswa': ['STUDENT'],
  '/superadmin': ['SUPERADMIN'],
};

export function hasRouteAccess(pathname: string, role: UserRole): boolean {
  const match = Object.entries(ROLE_ROUTES).find(([prefix]) =>
    pathname.startsWith(`/${prefix.replace('/', '')}`),
  );
  if (!match) return true; // route publik
  return match[1].includes(role);
}
