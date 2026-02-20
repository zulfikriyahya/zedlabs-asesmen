import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SessionMonitoringService } from './services/session-monitoring.service';
import { SessionsService } from './services/sessions.service';
import { SessionsController } from './controllers/sessions.controller';

@Module({
  imports: [NotificationsModule, AuditLogsModule],
  providers: [SessionsService, SessionMonitoringService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
