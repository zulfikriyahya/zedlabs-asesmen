import type { NextRequest } from 'next/server';

export function extractSubdomain(req: NextRequest): string | null {
  const host = req.headers.get('host') ?? '';
  const domain = process.env.NEXT_PUBLIC_TENANT_DOMAIN ?? 'exam.example.com';
  if (host === domain || host === `www.${domain}`) return null;
  const sub = host.replace(`.${domain}`, '');
  return sub !== host ? sub : null;
}
