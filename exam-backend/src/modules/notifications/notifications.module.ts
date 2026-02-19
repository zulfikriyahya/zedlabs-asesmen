// ════════════════════════════════════════════════════════════════════════════
// src/modules/notifications/notifications.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
