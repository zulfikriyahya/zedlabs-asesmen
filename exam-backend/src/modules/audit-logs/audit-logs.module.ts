import { Module } from '@nestjs/common';
import { AuditLogsService } from './services/audit-logs.service';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  providers: [AuditLogsService, AuditInterceptor],
  controllers: [AuditLogsController],
  exports: [AuditLogsService, AuditInterceptor],
})
export class AuditLogsModule {}
