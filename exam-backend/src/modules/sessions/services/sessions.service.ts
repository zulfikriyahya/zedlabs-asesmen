import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { SessionStatus } from '../../../common/enums/exam-status.enum';
import { generateTokenCode } from '../../../common/utils/randomizer.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { AssignStudentsDto } from '../dto/assign-students.dto';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private notifSvc: NotificationsService,
  ) {}

  async findAll(tenantId: string, q: BaseQueryDto & { status?: SessionStatus }) {
    const where = {
      tenantId,
      ...(q.status && { status: q.status }),
      ...(q.search && { title: { contains: q.search, mode: 'insensitive' as const } }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.examSession.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { [q.sortBy ?? 'startTime']: q.sortOrder },
        include: {
          examPackage: { select: { title: true } },
          room: true,
          _count: { select: { students: true, attempts: true } },
        },
      }),
      this.prisma.examSession.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }

  async findOne(tenantId: string, id: string) {
    const s = await this.prisma.examSession.findFirst({
      where: { id, tenantId },
      include: { examPackage: true, room: true, students: true },
    });
    if (!s) throw new NotFoundException('Sesi ujian tidak ditemukan');
    return s;
  }

  async create(tenantId: string, dto: CreateSessionDto, createdById: string) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (end <= start) throw new BadRequestException('Waktu selesai harus setelah waktu mulai');
    return this.prisma.examSession.create({
      data: { tenantId, createdById, ...dto, startTime: start, endTime: end },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateSessionDto) {
    await this.findOne(tenantId, id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);
    return this.prisma.examSession.update({ where: { id }, data });
  }

  async assignStudents(tenantId: string, id: string, dto: AssignStudentsDto) {
    await this.findOne(tenantId, id);
    const results = await Promise.allSettled(
      dto.userIds.map((userId) =>
        this.prisma.sessionStudent.upsert({
          where: { sessionId_userId: { sessionId: id, userId } },
          create: { sessionId: id, userId, tokenCode: generateTokenCode() },
          update: {},
        }),
      ),
    );
    return { assigned: results.filter((r) => r.status === 'fulfilled').length };
  }

  async activate(tenantId: string, id: string) {
    const s = await this.findOne(tenantId, id);
    if (s.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Hanya sesi SCHEDULED yang bisa diaktifkan');
    }
    const updated = await this.prisma.examSession.update({
      where: { id },
      data: { status: SessionStatus.ACTIVE },
    });

    // Notify semua peserta sesi
    const students = await this.prisma.sessionStudent.findMany({
      where: { sessionId: id },
      select: { userId: true },
    });
    await Promise.allSettled(
      students.map((ss) =>
        this.notifSvc.create({
          userId: ss.userId,
          title: 'Ujian Dimulai',
          body: `Sesi "${s.title}" telah diaktifkan. Silakan login dan mulai ujian.`,
          type: 'SESSION_ACTIVATED',
          metadata: { sessionId: id, tenantId },
        }),
      ),
    );

    return updated;
  }
}
