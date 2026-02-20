import { NextResponse, type NextRequest } from 'next/server';
import { extractSubdomain } from '@/lib/middleware/tenant.middleware';
import { hasRouteAccess } from '@/lib/middleware/role.middleware';
import type { UserRole } from '@/types/common';

// Decode JWT payload tanpa verify (verify dilakukan di backend)
function decodeJwtPayload(token: string): { role?: UserRole; exp?: number } | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files & Next internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Tambahkan subdomain sebagai header untuk server components
  const subdomain = extractSubdomain(req);
  const headers = new Headers(req.headers);
  if (subdomain) headers.set('x-tenant-subdomain', subdomain);

  // Auth check via cookie (access token disimpan di cookie httpOnly di Next.js API route)
  const token = req.cookies.get('access_token')?.value;
  const isLoginPage = pathname === '/login';

  if (!token) {
    if (isLoginPage) return NextResponse.next({ request: { headers } });
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = decodeJwtPayload(token);
  const isExpired = payload?.exp !== undefined && payload.exp * 1000 < Date.now();

  if (!payload || isExpired) {
    if (isLoginPage) return NextResponse.next();
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('access_token');
    return res;
  }

  if (isLoginPage) {
    // Redirect ke dashboard sesuai role
    const dashboards: Record<UserRole, string> = {
      SUPERADMIN: '/superadmin/dashboard',
      ADMIN: '/superadmin/dashboard',
      TEACHER: '/guru/dashboard',
      OPERATOR: '/operator/dashboard',
      SUPERVISOR: '/pengawas/dashboard',
      STUDENT: '/siswa/dashboard',
    };
    return NextResponse.redirect(new URL(dashboards[payload.role ?? 'STUDENT'] ?? '/', req.url));
  }

  // RBAC check
  if (payload.role && !hasRouteAccess(pathname, payload.role)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
