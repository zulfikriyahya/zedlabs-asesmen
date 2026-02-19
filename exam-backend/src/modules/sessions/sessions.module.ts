// ════════════════════════════════════════════════════════════════════════════
// src/modules/sessions/sessions.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SessionsService } from './services/sessions.service';
import { SessionMonitoringService } from './services/session-monitoring.service';
import { SessionsController } from './controllers/sessions.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'notification' })],
  providers: [SessionsService, SessionMonitoringService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
