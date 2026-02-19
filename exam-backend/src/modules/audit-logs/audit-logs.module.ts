// ════════════════════════════════════════════════════════════════════════════
// src/modules/audit-logs/audit-logs.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { AuditLogsService } from './services/audit-logs.service';

@Module({
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
