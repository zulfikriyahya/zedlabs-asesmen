// ════════════════════════════════════════════════════════════════════════════
// src/modules/notifications/controllers/notifications.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { NotificationsService } from '../services/notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() u: CurrentUserPayload) {
    return this.svc.findByUser(u.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.svc.markRead(id);
  }
}
