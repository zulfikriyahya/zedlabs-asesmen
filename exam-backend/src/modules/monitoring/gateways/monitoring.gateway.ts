// ════════════════════════════════════════════════════════════════════════════
// src/modules/monitoring/gateways/monitoring.gateway.ts
// ════════════════════════════════════════════════════════════════════════════
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

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
