// ── notifications.module.ts ──────────────────────────────────
export class CreateNotificationDto {
  @IsString() @IsNotEmpty() userId: string;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() body: string;
  @IsString() @IsNotEmpty() type: string;
  @IsOptional() metadata?: Record<string, unknown>;
}
export class MarkReadDto {
  @IsString() @IsNotEmpty() notificationId: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({ data: { ...dto, metadata: dto.metadata } });
  }

  findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private svc: NotificationsService) {}
  @Get() findAll(@CurrentUser() u: CurrentUserPayload) {
    return this.svc.findByUser(u.sub);
  }
  @Patch(':id/read') markRead(@Param('id') id: string) {
    return this.svc.markRead(id);
  }
}

import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
@Module({
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
