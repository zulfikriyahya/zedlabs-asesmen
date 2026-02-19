// ── exam-rooms.module.ts ──────────────────────────────────
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Injectable, NotFoundException, Module } from '@nestjs/common';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, TenantId } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { PrismaService } from '../../prisma/prisma.service';

export class CreateRoomDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
}
export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

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

@Controller('exam-rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamRoomsController {
  constructor(private svc: ExamRoomsService) {}
  @Get() findAll(@TenantId() tid: string) {
    return this.svc.findAll(tid);
  }
  @Get(':id') findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }
  @Post() @Roles(UserRole.OPERATOR, UserRole.ADMIN) create(
    @TenantId() tid: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.svc.create(tid, dto);
  }
  @Patch(':id') @Roles(UserRole.OPERATOR, UserRole.ADMIN) update(
    @TenantId() tid: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.svc.update(tid, id, dto);
  }
  @Delete(':id') @Roles(UserRole.ADMIN) @HttpCode(HttpStatus.NO_CONTENT) remove(
    @TenantId() tid: string,
    @Param('id') id: string,
  ) {
    return this.svc.remove(tid, id);
  }
}

@Module({
  providers: [ExamRoomsService],
  controllers: [ExamRoomsController],
  exports: [ExamRoomsService],
})
export class ExamRoomsModule {}
