// ── idempotency-conflict.exception.ts ───────────────────────────────────────
import { ConflictException } from '@nestjs/common';

export class IdempotencyConflictException extends ConflictException {
  constructor(key: string) {
    super(`Permintaan dengan idempotency key '${key}' sudah diproses`);
  }
}
