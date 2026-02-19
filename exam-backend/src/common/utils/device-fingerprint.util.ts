// ── device-fingerprint.util.ts ───────────────────────────────────────────────
import { createHash as ch } from 'crypto';

export function hashFingerprint(raw: string): string {
  return ch('sha256').update(raw).digest('hex');
}

export function validateFingerprint(raw: string, stored: string): boolean {
  return hashFingerprint(raw) === stored;
}
