// ── monitoring.module.ts ──────────────────────────────────
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Injectable,
  Module,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, TenantId } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async getSessionOverview(sessionId: string) {
    const [attempts, total] = await this.prisma.$transaction([
      this.prisma.examAttempt.findMany({
        where: { sessionId },
        select: {
          id: true,
          userId: true,
          status: true,
          startedAt: true,
          submittedAt: true,
          user: { select: { username: true } },
          _count: { select: { answers: true, activityLogs: true } },
        },
      }),
      this.prisma.sessionStudent.count({ where: { sessionId } }),
    ]);

    const started = attempts.length;
    const submitted = attempts.filter((a) => a.status === 'SUBMITTED').length;

    return { total, started, submitted, inProgress: started - submitted, attempts };
  }

  async getActivityLogs(attemptId: string, q: BaseQueryDto) {
    return this.prisma.examActivityLog.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'desc' },
      skip: q.skip,
      take: q.limit,
    });
  }
}

@WebSocketGateway({ cors: true, namespace: '/monitoring' })
export class MonitoringGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MonitoringGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-session')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    client.join(`session:${data.sessionId}`);
    return { event: 'joined', room: `session:${data.sessionId}` };
  }

  broadcastStudentUpdate(sessionId: string, payload: unknown) {
    this.server.to(`session:${sessionId}`).emit('student-update', payload);
  }

  broadcastActivityLog(sessionId: string, log: unknown) {
    this.server.to(`session:${sessionId}`).emit('activity-log', log);
  }
}

@Controller('monitoring')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN)
export class MonitoringController {
  constructor(private svc: MonitoringService) {}

  @Get(':sessionId') overview(@Param('sessionId') id: string) {
    return this.svc.getSessionOverview(id);
  }
  @Get(':sessionId/logs/:attemptId') logs(
    @Param('attemptId') id: string,
    @Query() q: BaseQueryDto,
  ) {
    return this.svc.getActivityLogs(id, q);
  }
}

@Module({
  providers: [MonitoringService, MonitoringGateway],
  controllers: [MonitoringController],
  exports: [MonitoringGateway],
})
export class MonitoringModule {}
