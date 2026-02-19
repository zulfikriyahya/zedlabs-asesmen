// ════════════════════════════════════════════════════════════════════════════
// src/modules/exam-rooms/services/exam-rooms.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';

@Injectable()
export class ExamRoomsService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.examRoom.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async findOne(tenantId: string, id: string) {
    const room = await this.prisma.examRoom.findFirst({ where: { id, tenantId } });
    if (!room) throw new NotFoundException('Ruang ujian tidak ditemukan');
    return room;
  }

  create(tenantId: string, dto: CreateRoomDto) {
    return this.prisma.examRoom.create({ data: { tenantId, ...dto } });
  }

  async update(tenantId: string, id: string, dto: UpdateRoomDto) {
    await this.findOne(tenantId, id);
    return this.prisma.examRoom.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.examRoom.delete({ where: { id } });
  }
}
