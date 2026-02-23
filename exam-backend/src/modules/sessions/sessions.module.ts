import { Module } from '@nestjs/common';
import { EmailService } from '../../common/services/email.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SessionsController } from './controllers/sessions.controller';
import { SessionMonitoringService } from './services/session-monitoring.service';
import { SessionsService } from './services/sessions.service';

// AppModule mendaftarkan EmailService sebagai provider tapi TIDAK meng-export-nya
// sebagai @Global — jadi SessionsModule tetap harus mendeklarasikannya sendiri.
// Cara paling bersih: buat EmailModule yang @Global, atau daftarkan ulang di sini.

@Module({
  imports: [NotificationsModule, AuditLogsModule],
  providers: [SessionsService, SessionMonitoringService, EmailService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
