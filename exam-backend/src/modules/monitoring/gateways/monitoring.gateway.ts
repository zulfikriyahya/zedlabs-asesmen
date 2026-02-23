import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRole } from '../../../common/enums/user-role.enum';

interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/monitoring' })
export class MonitoringGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MonitoringGateway.name);

  // Map clientId → JWT payload untuk validasi per-event
  private readonly clients = new Map<string, JwtPayload>();

  constructor(
    private jwt: JwtService,
    private cfg: ConfigService,
    private prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ??
        client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) throw new Error('No token');

      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: this.cfg.get('JWT_ACCESS_SECRET'),
      });

      // [Fix #8] Hanya role tertentu yang boleh connect ke monitoring namespace
      const allowedRoles: string[] = [
        UserRole.SUPERVISOR,
        UserRole.OPERATOR,
        UserRole.ADMIN,
        UserRole.SUPERADMIN,
        UserRole.TEACHER,
      ];
      if (!allowedRoles.includes(payload.role)) {
        throw new Error(`Role '${payload.role}' tidak diizinkan mengakses monitoring`);
      }

      this.clients.set(client.id, payload);
      this.logger.log(
        `Client connected: ${client.id} (${payload.role} — tenant: ${payload.tenantId})`,
      );
    } catch (err) {
      this.logger.warn(`Unauthorized WS connection: ${client.id} — ${(err as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-session')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    if (!data?.sessionId) throw new WsException('sessionId diperlukan');

    const user = this.clients.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    // [Fix #8] Validasi session milik tenant yang sama
    const session = await this.prisma.examSession.findFirst({
      where: { id: data.sessionId, tenantId: user.tenantId },
      select: { id: true },
    });

    if (!session) {
      throw new WsException(
        `Session '${data.sessionId}' tidak ditemukan atau bukan milik tenant Anda`,
      );
    }

    client.join(`session:${data.sessionId}`);
    this.logger.log(`Client ${client.id} joined session:${data.sessionId}`);
    return { event: 'joined', room: `session:${data.sessionId}` };
  }

  broadcastStudentUpdate(sessionId: string, payload: unknown) {
    this.server.to(`session:${sessionId}`).emit('student-update', payload);
  }

  broadcastActivityLog(sessionId: string, log: unknown) {
    this.server.to(`session:${sessionId}`).emit('activity-log', log);
  }
}
