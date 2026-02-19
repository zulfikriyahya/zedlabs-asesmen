// ════════════════════════════════════════════════════════════════════════════
// src/common/decorators/idempotency.decorator.ts
// ════════════════════════════════════════════════════════════════════════════
import { SetMetadata } from '@nestjs/common';
export const IDEMPOTENCY_KEY = 'idempotency';
export const UseIdempotency = () => SetMetadata(IDEMPOTENCY_KEY, true);
