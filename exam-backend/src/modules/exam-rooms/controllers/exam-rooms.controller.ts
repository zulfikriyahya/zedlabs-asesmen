// ════════════════════════════════════════════════════════════════════════════
// src/modules/exam-rooms/controllers/exam-rooms.controller.ts
// ════════════════════════════════════════════════════════════════════════════
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { ExamRoomsService } from '../services/exam-rooms.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';

@Controller('exam-rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamRoomsController {
  constructor(private svc: ExamRoomsService) {}

  @Get()
  findAll(@TenantId() tid: string) {
    return this.svc.findAll(tid);
  }

  @Get(':id')
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  create(@TenantId() tid: string, @Body() dto: CreateRoomDto) {
    return this.svc.create(tid, dto);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}
