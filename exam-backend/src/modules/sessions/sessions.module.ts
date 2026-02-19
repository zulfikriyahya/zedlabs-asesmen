// ── sessions.module.ts ──────────────────────────────────

import { BullModule } from '@nestjs/bullmq';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Query } from '@nestjs/common';
import { IsEnum, IsArray, IsDateString } from 'class-validator';
import { SessionStatus } from '../../common/enums/exam-status.enum';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { generateTokenCode } from '../../common/utils/randomizer.util';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../common/dto/base-response.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export class CreateSessionDto {
  @IsString() @IsNotEmpty() examPackageId: string;
  @IsOptional() @IsString() roomId?: string;
  @IsString() @IsNotEmpty() title: string;
  @IsDateString() startTime: string;
  @IsDateString() endTime: string;
}
export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsOptional() @IsEnum(SessionStatus) status?: SessionStatus;
}
export class AssignStudentsDto {
  @IsArray() @IsString({ each: true }) userIds: string[];
}

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notification') private notifQueue: Queue,
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
    if (s.status !== SessionStatus.SCHEDULED)
      throw new BadRequestException('Hanya sesi SCHEDULED yang bisa diaktifkan');
    const updated = await this.prisma.examSession.update({
      where: { id },
      data: { status: SessionStatus.ACTIVE },
    });
    // broadcast via Socket.IO
    await this.notifQueue.add('session-activated', { tenantId, sessionId: id });
    return updated;
  }

  async getStudentToken(sessionId: string, userId: string) {
    const ss = await this.prisma.sessionStudent.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!ss) throw new NotFoundException('Peserta tidak terdaftar di sesi ini');
    return { tokenCode: ss.tokenCode };
  }
}

@Injectable()
export class SessionMonitoringService {
  constructor(private prisma: PrismaService) {}

  async getLiveStatus(sessionId: string) {
    const attempts = await this.prisma.examAttempt.findMany({
      where: { sessionId },
      select: {
        id: true,
        userId: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        user: { select: { username: true } },
        _count: { select: { answers: true } },
      },
    });
    return attempts;
  }
}

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(
    private svc: SessionsService,
    private monitorSvc: SessionMonitoringService,
  ) {}

  @Get() findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }
  @Get(':id') findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }
  @Get(':id/live') @Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN) live(
    @Param('id') id: string,
  ) {
    return this.monitorSvc.getLiveStatus(id);
  }

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateSessionDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.svc.update(tid, id, dto);
  }

  @Post(':id/assign')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  assign(@TenantId() tid: string, @Param('id') id: string, @Body() dto: AssignStudentsDto) {
    return this.svc.assignStudents(tid, id, dto);
  }

  @Post(':id/activate')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  activate(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.activate(tid, id);
  }
}

@Module({
  imports: [BullModule.registerQueue({ name: 'notification' })],
  providers: [SessionsService, SessionMonitoringService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
