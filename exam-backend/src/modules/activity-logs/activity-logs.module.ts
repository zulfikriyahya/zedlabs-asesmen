// ── activity-logs.module.ts ──────────────────────────────────
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateActivityLogDto {
  @IsString() @IsNotEmpty() attemptId: string;
  @IsString() @IsNotEmpty() userId: string;
  @IsString() @IsNotEmpty() type: string; // tab_blur | tab_focus | copy_paste | idle
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityLogsService {
  constructor(
    private prisma: PrismaService,
    private monitorGateway: MonitoringGateway,
  ) {}

  async create(dto: CreateActivityLogDto) {
    const log = await this.prisma.examActivityLog.create({
      data: {
        attemptId: dto.attemptId,
        userId: dto.userId,
        type: dto.type,
        metadata: dto.metadata,
      },
    });

    // Broadcast ke pengawas
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      select: { sessionId: true },
    });
    if (attempt) this.monitorGateway.broadcastActivityLog(attempt.sessionId, log);

    return log;
  }

  findByAttempt(attemptId: string) {
    return this.prisma.examActivityLog.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogsController {
  constructor(private svc: ActivityLogsService) {}
  @Get(':attemptId') findByAttempt(@Param('attemptId') id: string) {
    return this.svc.findByAttempt(id);
  }
  @Post() create(@Body() dto: CreateActivityLogDto) {
    return this.svc.create(dto);
  }
}

import { Post, Body } from '@nestjs/common';

@Module({
  imports: [MonitoringModule],
  providers: [ActivityLogsService],
  controllers: [ActivityLogsController],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
