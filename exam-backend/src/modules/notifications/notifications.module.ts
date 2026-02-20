import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationProcessor } from './processors/notification.processor';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'notification' })],
  providers: [NotificationsService, NotificationProcessor],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
