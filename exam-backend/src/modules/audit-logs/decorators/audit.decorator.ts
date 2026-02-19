// ════════════════════════════════════════════════════════════════════════════
// src/modules/audit-logs/decorators/audit.decorator.ts
// ════════════════════════════════════════════════════════════════════════════
import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'auditAction';

export interface AuditActionMeta {
  action: string;
  entityType: string;
}

export const AuditAction = (action: string, entityType: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, entityType } satisfies AuditActionMeta);
