// ── checksum.util.ts ─────────────────────────────────────────────────────────
import { createHash } from 'crypto';

export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

export function md5(data: string | Buffer): string {
  return createHash('md5').update(data).digest('hex');
}
